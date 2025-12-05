import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to the database with error handling
client.connect().catch((error) => {
  console.error("Failed to connect to the database:", error);
});

// Optional: Handle disconnection gracefully
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await client.end();
  process.exit(0);
});

export const db = drizzle(client);
