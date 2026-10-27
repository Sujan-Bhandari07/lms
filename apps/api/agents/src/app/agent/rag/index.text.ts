
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "../models/embedding.llm";

export async function indexText(
  text: string,
  collection: string,
  metadata: Record<string, string> = {},
) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 150,
  });

  const document = new Document({
    pageContent: text,
    metadata,
  });

  const chunks = await splitter.splitDocuments([document]);

  await QdrantVectorStore.fromDocuments(chunks, embeddings, {
    url: process.env.QDRANT_CLUSTER,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: collection,
  });

  return {
    message: "Text indexed successfully",
    totalChunks: chunks.length,
  };
}
