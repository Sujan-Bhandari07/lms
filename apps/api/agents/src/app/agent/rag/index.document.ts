import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "../models/embedding.llm";

export async function indexPdf(filePath: string,collection:string) {
  // Load and extract PDF text
  const loader = new PDFLoader(filePath);
  const documents = await loader.load();

  // Split text into overlapping chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 150,
  });

  const chunks = await splitter.splitDocuments(documents);

  // Generate embeddings and save chunks in Qdrant
  await QdrantVectorStore.fromDocuments(chunks, embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: collection,
  });

  return {
    message: "PDF indexed successfully",
    totalChunks: chunks.length,
  };
}