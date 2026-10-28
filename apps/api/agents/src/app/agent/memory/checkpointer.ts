import { MongoClient } from "mongodb-checkpointer";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";

const client = new MongoClient(process.env.MONGODB_CHECKPOINTER_URI);

export const checkpointer = new MongoDBSaver({
  client,
  dbName: "ujyalo_ai",
});

export async function setupCheckpointer() {
  await client.connect();
  await checkpointer.setup();
}