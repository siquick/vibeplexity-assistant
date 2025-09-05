// TODO: Re-enable when Better Auth is working
// import { auth, type User } from "./auth.js";
import type { User } from "./auth.js";
import { spawn } from "child_process";
import { db } from "../storage/database.js";
import { userSessions } from "../storage/schema.js";
import { eq } from "drizzle-orm";

export class CLIAuthHandler {
  private storedSessionToken: string | null = null;

  /**
   * Check if user has valid authentication
   */
  async checkAuthentication(): Promise<User | null> {
    try {
      // Try to get session token from stored value or environment
      const sessionToken = this.storedSessionToken || process.env.ORIN_SESSION_TOKEN;

      if (!sessionToken) {
        return null;
      }

      // TODO: Check session with Better Auth when it's working
      // const session = await auth.api.getSession({
      //   headers: {
      //     cookie: `better-auth.session_token=${sessionToken}`,
      //   },
      // });

      // Placeholder until Better Auth is working
      const session = null;

      if (session?.user) {
        // Update last accessed time
        await this.updateSessionAccess(sessionToken);
        this.storedSessionToken = sessionToken;
        return session.user;
      }

      return null;
    } catch (error) {
      console.error("Authentication check failed:", error);
      return null;
    }
  }

  /**
   * Initiate OAuth flow for a specific service
   */
  async initiateServiceConnection(serviceId: "google" | "spotify"): Promise<User | null> {
    try {
      console.log(`🔐 Connecting to ${serviceId}...`);
      console.log("Opening browser for authentication...");

      // Generate OAuth URL
      const authUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/signin/${serviceId}`;

      // Open browser to auth URL
      await this.openBrowser(authUrl);

      // Wait for user to complete auth flow
      console.log("⏳ Waiting for authentication to complete...");
      console.log("Please complete the authentication in your browser.");
      console.log("Press Enter after you've completed authentication in the browser...");

      // Wait for user input
      await this.waitForUserInput();

      // Check if authentication was successful
      const user = await this.checkAuthentication();

      if (user) {
        console.log(`✅ ${serviceId} connected successfully!`);
        console.log(`👤 Signed in as: ${user.email}`);
        return user;
      } else {
        console.log(`❌ Authentication failed. Please try again.`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Failed to connect to ${serviceId}:`, error);
      return null;
    }
  }

  /**
   * Store session token for CLI persistence
   */
  async storeSessionToken(sessionToken: string, userId: string): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      // Store in database
      await db
        .insert(userSessions)
        .values({
          userId,
          sessionToken,
          expiresAt,
          metadata: { source: "cli", userAgent: "orin-cli" },
        })
        .onConflictDoUpdate({
          target: userSessions.sessionToken,
          set: {
            lastAccessed: new Date(),
            expiresAt,
          },
        });

      this.storedSessionToken = sessionToken;
      console.log("💾 Session saved for future CLI usage");
    } catch (error) {
      console.error("Failed to store session token:", error);
    }
  }

  /**
   * Sign out user and clear stored tokens
   */
  async signOut(): Promise<void> {
    try {
      if (this.storedSessionToken) {
        // Remove from database
        await db.delete(userSessions).where(eq(userSessions.sessionToken, this.storedSessionToken));

        // Clear stored token
        this.storedSessionToken = null;

        console.log("✅ Signed out successfully");
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  /**
   * Open browser to the specified URL
   */
  private async openBrowser(url: string): Promise<void> {
    const platform = process.platform;

    let command: string;
    let args: string[];

    switch (platform) {
      case "darwin": // macOS
        command = "open";
        args = [url];
        break;
      case "win32": // Windows
        command = "start";
        args = ["", url];
        break;
      default: // Linux and others
        command = "xdg-open";
        args = [url];
        break;
    }

    spawn(command, args, { detached: true, stdio: "ignore" });
  }

  /**
   * Wait for user input (Enter key)
   */
  private async waitForUserInput(): Promise<void> {
    return new Promise((resolve) => {
      process.stdin.once("data", () => {
        resolve();
      });
    });
  }

  /**
   * Update session last accessed time
   */
  private async updateSessionAccess(sessionToken: string): Promise<void> {
    try {
      await db
        .update(userSessions)
        .set({ lastAccessed: new Date() })
        .where(eq(userSessions.sessionToken, sessionToken));
    } catch (error) {
      // Silently fail - not critical
    }
  }
}
