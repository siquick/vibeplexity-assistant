import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";

// Create SQLite database
const sqlite = new Database("orin.db");

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database with migrations
export async function initializeDatabase() {
  try {
    // Run migrations
    migrate(db, { migrationsFolder: "./src/storage/migrations" });
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

// Graceful shutdown
export function closeDatabase() {
  sqlite.close();
}

// Export sqlite instance for Better Auth adapter
export { sqlite };
