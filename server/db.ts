import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

let pool: Pool | null = null;
let db: NodePgDatabase<typeof schema> | null = null;
let dbAvailable = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
    db = drizzle(pool, { schema });
    dbAvailable = true;
  } catch (e) {
    console.warn("[db] Failed to initialize database pool:", (e as Error).message);
  }
} else {
  console.warn("[db] DATABASE_URL not set - running without database persistence");
}

export { pool, db, dbAvailable };
