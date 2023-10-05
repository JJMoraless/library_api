import "dotenv/config";
import { MongoClient } from "mongodb";

const ATLAS_URI = process.env.ATLAS_URI;
const DB_NAME = process.env.ATLAS_DB_NAME;
const client = new MongoClient(ATLAS_URI);

export const connectToDatabase = async () => {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log(`🤌  successful connection = DB: ${db.databaseName}`);
    return db;
  } catch (error) {
    console.log(`🦀 error = ${error}`);
  }
};

const db = await connectToDatabase();
export default db;
