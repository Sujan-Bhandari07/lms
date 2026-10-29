import { StateGraph } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { state } from "./state";
import {
  catalogAgent,
  final,
  generalagent,
  getAllCoursesTool,
  getAllTutors,
  getSpecificCourseTool,
  getWebsiteInformation,
  other,
  router,
  shouldCallTools,
  shouldcontinue,
} from "../tools/tools";
import { getCheckpointer, setupCheckpointer } from "../memory/checkpointer";

const toolnode = new ToolNode([
  getSpecificCourseTool,
  getAllCoursesTool,
  getAllTutors,
]);

const builder = new StateGraph(state)
  .addNode("router", router)
  .addNode("tools", toolnode)
  .addNode("catalog", catalogAgent)
  .addNode("general", generalagent)
  .addNode("other", other)
  .addNode("final", async (graphState) => {
    const last = graphState.messages?.at(-1);
    if (last instanceof AIMessage && !last.tool_calls?.length && last.content) {
      return {
        ...graphState,
        response:
          typeof last.content === "string"
            ? last.content
            : JSON.stringify(last.content),
      };
    }
    return final(graphState);
  })
  .addNode("website", getWebsiteInformation)
  .addEdge("__start__", "router")
  .addConditionalEdges("router", shouldcontinue, {
    catalog: "catalog",
    general: "general",
    website: "website",
    other: "other",
  })
  .addConditionalEdges("catalog", shouldCallTools, {
    tools: "tools",
    __end__: "final",
  })
  .addEdge("tools", "catalog")
  .addEdge("final", "__end__")
  .addEdge("other", "__end__")
  .addEdge("website", "__end__")
  .addEdge("general", "__end__");

let compiled = builder.compile();
let usingCheckpointer = false;

export async function getGraph() {
  if (usingCheckpointer) return compiled;
  if (!process.env.MONGO_CHECKPOINTER_URI) return compiled;
  try {
    await setupCheckpointer();
    const checkpointer = getCheckpointer();
    if (checkpointer) {
      compiled = builder.compile({ checkpointer });
      usingCheckpointer = true;
    }
  } catch (error) {
    console.error("LangGraph checkpointer is unavailable; using in-request memory.", error);
  }
  return compiled;
}

export { compiled as graph };
