import {ChatOpenRouter} from "@langchain/openrouter"


export const openaillm=new ChatOpenRouter({
   model: "deepseek/deepseek-chat",
   temperature:0,
   maxTokens:2500
})