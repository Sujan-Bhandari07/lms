import { MongoClient } from "mongodb-checkpointer";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";

let client: MongoClient | null = null;
let checkpointerInstance: MongoDBSaver | null = null;

export function getCheckpointer(): MongoDBSaver | null {
  if (checkpointerInstance) return checkpointerInstance;
  const uri = process.env.MONGO_CHECKPOINTER_URI;
  if (!uri) return null;
  client = new MongoClient(uri);
  checkpointerInstance = new MongoDBSaver({
    client,
    dbName: "ujyalo_ai",
  });
  return checkpointerInstance;
}

export async function setupCheckpointer() {
  const cp = getCheckpointer();
  if (!cp || !client) return;
  await client.connect();
  await cp.setup();
}
