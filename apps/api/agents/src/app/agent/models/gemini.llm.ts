import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const geminillm = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY || "dummy-key",
});
