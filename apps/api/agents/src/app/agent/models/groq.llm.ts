import { ChatGroq } from "@langchain/groq";

const groqllm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY || "dummy-key-for-test",
});

export { groqllm };
