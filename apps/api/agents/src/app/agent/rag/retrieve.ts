import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "../models/embedding.llm";
import { groqllm } from "../models/groq.llm";


export async function askDocuments(question: string,collection:string) {
  const vectorStore =
    await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName:collection ,
    });

  // Find the four most relevant chunks
  const retriever = vectorStore.asRetriever(4);
  const documents = await retriever.invoke(question);

  const context = documents
    .map((doc) => doc.pageContent)
    .join("\n\n");



  return {
    context: context,
    sources: documents.map((doc) => doc.metadata),
  };
}