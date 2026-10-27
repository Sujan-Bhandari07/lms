import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "../models/embedding.llm";


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

  // Ask Groq using the retrieved context
//   const answer = await llm.invoke([
//     {
//       role: "system",
//       content: `
//         Answer the user's question using the supplied context.
//         If the answer cannot be found in the context,
//         say you could not find it in the provided documents.

//         Context:
//         ${context}
//       `,
//     },
//     {
//       role: "user",
//       content: question,
//     },
//   ]);

  return {
    context: context,
    sources: documents.map((doc) => doc.metadata),
  };
}