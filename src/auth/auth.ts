// TODO: Fix Better Auth integration - currently causing runtime issues
// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { db } from "../storage/database.js";

// TODO: Uncomment when Better Auth integration is fixed
/*
export const auth = betterAuth({
  database: drizzleAdapter(db),

  // Multi-service OAuth2 providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Request Calendar API scopes
      scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
      // Always get refresh token for offline access
      accessType: "offline",
      prompt: "select_account consent",
    },

    // Spotify provider (for future use)
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      // Request Spotify API scopes
      scopes: [
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "playlist-read-private",
        "user-library-read",
      ],
    },
  },

  // CLI-friendly session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days for CLI persistence
    updateAge: 60 * 60 * 24, // Refresh daily
  },

  // Cross-domain support for CLI + web server
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
    },
  },

  // Base URL for redirects
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Custom callback URLs if needed
  trustedOrigins: ["http://localhost:3000", process.env.FRONTEND_URL || "http://localhost:3000"],
});

// Export types for TypeScript
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
*/

// Placeholder types until Better Auth is working
export type Session = {
  user: User;
  session: {
    id: string;
    expiresAt: Date;
  };
};

export type User = {
  id: string;
  email: string;
  name?: string;
  image?: string;
};
