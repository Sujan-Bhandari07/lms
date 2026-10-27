import { ChatGroq } from "@langchain/groq";

const groqllm = new ChatGroq({
model: "openai/gpt-oss-120b",
temperature: 0
});





export {groqllm}