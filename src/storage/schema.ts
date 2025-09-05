import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

// Better Auth will create its own tables automatically:
// - user, session, account, verification

// Our service-specific extensions to Better Auth

// Service providers registry
export const serviceProviders = sqliteTable("service_providers", {
  id: text("id").primaryKey(), // 'google', 'spotify', etc.
  name: text("name").notNull(),
  apiConfig: text("api_config", { mode: "json" }).notNull(), // JSON config
  capabilities: text("capabilities", { mode: "json" }).notNull(), // Array of capabilities
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

// Service data cache for user-specific service data
export const serviceDataCache = sqliteTable("service_data_cache", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").notNull(), // References Better Auth user table
  serviceId: text("service_id").notNull(), // References service_providers.id
  dataType: text("data_type").notNull(), // 'calendar_events', 'playlists', etc.
  dataKey: text("data_key").notNull(), // Specific identifier
  dataContent: text("data_content", { mode: "json" }).notNull(), // JSON data
  cacheExpiresAt: integer("cache_expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

// Available tools registry (dynamically generated from services)
export const availableTools = sqliteTable("available_tools", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  serviceId: text("service_id").notNull(), // References service_providers.id
  toolName: text("tool_name").notNull(),
  toolDescription: text("tool_description"),
  toolSchema: text("tool_schema", { mode: "json" }).notNull(), // Zod schema JSON
  requiredCapabilities: text("required_capabilities", { mode: "json" }).notNull(), // Array
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

// User CLI sessions for persistent authentication
export const userSessions = sqliteTable("user_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").notNull(), // References Better Auth user table
  sessionToken: text("session_token").unique().notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
  lastAccessed: integer("last_accessed", { mode: "timestamp" }).default(new Date()),
  metadata: text("metadata", { mode: "json" }).default("{}"), // Additional session data
});

// Export types for TypeScript
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type ServiceDataCache = typeof serviceDataCache.$inferSelect;
export type AvailableTool = typeof availableTools.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
