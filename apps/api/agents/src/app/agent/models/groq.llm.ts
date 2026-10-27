import { ChatGroq } from "@langchain/groq";
import { getAllCoursesTool, getAllTutors, getSpecificCourseTool } from "../tools/tools";

const groqllm = new ChatGroq({
model: "openai/gpt-oss-120b",
temperature: 0
}).bindTools([getAllCoursesTool,getAllTutors,getSpecificCourseTool])





export {groqllm}