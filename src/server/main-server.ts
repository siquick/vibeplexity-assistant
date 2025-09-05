import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

console.log("🏗️  ORIN CONNECTION HUB - MAIN SERVER");
console.log("=".repeat(50));

// Create Hono app with future auth support
const app = new Hono<{
  Variables: {
    user: any | null; // Will be typed when auth is implemented
    session: any | null; // Will be typed when auth is implemented
  };
}>();

// CORS configuration for CLI + web integration
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL || "http://localhost:3000"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
  })
);

// Authentication middleware (placeholder until Better Auth is working)
app.use("/api/*", async (c, next) => {
  // Skip auth routes
  if (c.req.path.startsWith("/api/auth/")) {
    return next();
  }

  // Set placeholder values (will be replaced with real auth)
  c.set("user", null);
  c.set("session", null);

  return next();
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "orin-connection-hub",
    version: "0.1.0",
    foundation: "stable",
  });
});

// System status endpoint
app.get("/api/status", (c) => {
  return c.json({
    server: "✅ running",
    foundation: "✅ stable",
    database: "⏳ ready (schema designed, auth needed for activation)",
    auth: "⏳ Better Auth integration pending",
    services: {
      google: "⏳ ready for implementation",
      spotify: "⏳ ready for implementation",
    },
    nextSteps: [
      "1. Implement Google Calendar service (without auth first)",
      "2. Fix Better Auth integration",
      "3. Add authentication layer",
      "4. Create dynamic tools system",
    ],
  });
});

// Authentication status endpoint (placeholder)
app.get("/api/auth/status", (c) => {
  return c.json({
    authenticated: false,
    message: "Authentication system ready for implementation",
    providers: {
      google: {
        name: "Google Calendar",
        status: "configured",
        scopes: ["calendar.read", "calendar.write"],
      },
      spotify: {
        name: "Spotify",
        status: "configured",
        scopes: ["music.read", "music.control"],
      },
    },
    implementation: "Better Auth integration pending",
  });
});

// User info endpoint (placeholder until auth is working)
app.get("/api/user", async (c) => {
  return c.json(
    {
      error: "Authentication not yet implemented - Better Auth integration pending",
      message: "This endpoint will return user info once authentication is working",
    },
    501
  );
});

// Available services endpoint
app.get("/api/services", (c) => {
  return c.json({
    message: "Available services for Orin Connection Hub",
    services: [
      {
        id: "google",
        name: "Google Calendar",
        description: "Access and manage your Google Calendar events",
        capabilities: ["calendar.read", "calendar.write", "calendar.query"],
        status: "ready_for_implementation",
        endpoints: [
          "GET /api/calendar/events",
          "POST /api/calendar/events",
          "PUT /api/calendar/events/:id",
          "DELETE /api/calendar/events/:id",
        ],
      },
      {
        id: "spotify",
        name: "Spotify",
        description: "Control your Spotify music playback and access playlists",
        capabilities: ["music.read", "music.control", "music.search"],
        status: "ready_for_implementation",
        endpoints: [
          "GET /api/music/playlists",
          "POST /api/music/play",
          "PUT /api/music/control",
          "GET /api/music/current",
        ],
      },
    ],
  });
});

// Service connections endpoint
app.get("/api/connections", async (c) => {
  return c.json({
    message: "Available services for connection (authentication required for actual connections)",
    connected: [],
    available: [
      {
        id: "google",
        name: "Google Calendar",
        status: "available",
        capabilities: ["calendar.read", "calendar.write"],
        description: "Access your Google Calendar events and manage your schedule",
      },
      {
        id: "spotify",
        name: "Spotify",
        status: "available",
        capabilities: ["music.read", "music.control"],
        description: "Control your Spotify music playback and access playlists",
      },
    ],
  });
});

// Individual connection status endpoint
app.get("/api/connections/:serviceId", async (c) => {
  const serviceId = c.req.param("serviceId");

  return c.json({
    serviceId,
    connected: false,
    lastSync: null,
    capabilities: [],
    message: "Authentication required to check connection status",
    requiresAuth: true,
  });
});

// Development/architecture info endpoint
app.get("/api/dev", (c) => {
  return c.json({
    environment: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 3000,
    foundation: "Day 1 Complete ✅",
    architecture: {
      server: "Hono.js - ✅ Working",
      database: "Drizzle ORM + SQLite - ✅ Schema Ready",
      auth: "Better Auth - ⏳ Integration Pending",
      services: "Abstraction Layer - ✅ Designed",
    },
    completed: [
      "✅ Project structure and dependencies",
      "✅ Database schema for multi-service architecture",
      "✅ Service abstraction layer design",
      "✅ Dynamic tool registry schema",
      "✅ CLI session management design",
      "✅ CORS and API endpoint structure",
      "✅ Clean, working server foundation",
    ],
    readyForNext: true,
  });
});

// Start server
async function startServer() {
  try {
    const port = Number(process.env.PORT) || 3000;

    console.log(`🚀 Starting on port ${port}`);
    console.log(`🔗 Health: http://localhost:${port}/health`);
    console.log(`📊 Status: http://localhost:${port}/api/status`);
    console.log(`🔧 Services: http://localhost:${port}/api/services`);
    console.log(`👥 Connections: http://localhost:${port}/api/connections`);
    console.log(`🔐 Auth: http://localhost:${port}/api/auth/status`);
    console.log(`🛠️  Dev Info: http://localhost:${port}/api/dev`);

    serve({
      fetch: app.fetch,
      port,
    });

    console.log("=".repeat(50));
    console.log("✅ Main server running successfully!");
    console.log("📝 Ready for Google Calendar service implementation");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server...");
  process.exit(0);
});

// Start server immediately
startServer();
