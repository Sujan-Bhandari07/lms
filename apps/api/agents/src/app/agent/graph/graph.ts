import {StateGraph} from "@langchain/langgraph"
import { state } from "./state"
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { final, generalagent, getAllCoursesTool, getAllTutors, getSpecificCourseTool, getWebsiteInformation, other, router, shouldcontinue } from "../tools/tools"

const toolnode = new ToolNode([getSpecificCourseTool,getAllCoursesTool,getAllTutors])

const graph = new StateGraph(state)
.addNode("router",router)
.addNode("tools",toolnode)
.addNode("general",generalagent)
.addNode("other",other)
.addNode("final",final)
.addNode("website",getWebsiteInformation)
.addEdge("__start__","router")
.addConditionalEdges("router",shouldcontinue,{
    tools:"tools",
    general:"general",
    website:"website",
    other:"other"
})
.addEdge("tools","final")
.addEdge("final","__end__")
.addEdge("other","__end__")
.addEdge("website","__end__")
.addEdge("general","__end__")
.compile()

export {graph}