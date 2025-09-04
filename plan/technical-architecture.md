# Technical Architecture - Multi-Service Connection Hub

## 🏗️ System Architecture Overview

### Current vs Enhanced Architecture

```mermaid
graph TB
    subgraph "Current Orin"
        CLI[CLI Interface]
        Workflow[Agentic Workflow]
        Tools[Tools: web-search, fetch-url, haiku]
        Planner[Planning System]
        AI[AI SDK Integration]
        
        CLI --> Workflow
        Workflow --> Planner
        Workflow --> Tools
        Workflow --> AI
    end
    
    subgraph "Enhanced with Connection Hub"
        CLI2[Enhanced CLI]
        WebServer[Web Server]
        ConnHub[Connection Hub Core]
        ServiceLayer[Service Abstraction Layer]
        DB[(Database)]
        Cache[(Redis Cache)]
        DynamicTools[Dynamic Tool System]
        
        CLI2 --> WebServer
        CLI2 --> ConnHub
        WebServer --> ConnHub
        ConnHub --> DB
        ServiceLayer --> DB
        ServiceLayer --> Cache
        DynamicTools --> ServiceLayer
        ConnHub --> ServiceLayer
    end
```

## 🔧 Component Details

### 1. Better Auth Integration Architecture

```typescript
// src/auth/auth.ts - Better Auth Configuration
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scopes: ["https://www.googleapis.com/auth/calendar"],
      accessType: "offline",
      prompt: "select_account consent"
    },
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      scopes: ["user-read-playback-state", "user-modify-playback-state"]
    }
  },
  session: { expiresIn: 60 * 60 * 24 * 7 }, // 7 days for CLI
  advanced: { crossSubDomainCookies: { enabled: true } }
});

// src/connections/connection-manager.ts - Simplified with Better Auth
export class ConnectionManager {
  async getConnectedServices(userId: string): Promise<ServiceConnection[]>
  async getServiceTokens(userId: string, serviceId: string): Promise<TokenSet>
  async requestAdditionalScopes(userId: string, serviceId: string, scopes: string[]): Promise<void>
}

// src/connections/service-registry.ts - Service-specific logic only
export class ServiceRegistry {
  registerService(provider: ServiceProvider): void
  getService(serviceId: string): ServiceProvider
  getAvailableServices(): ServiceProvider[]
  getToolsForService(serviceId: string): Tool[]
}
```

### 2. Service Abstraction Layer Architecture

```typescript
// src/services/base-service.ts
export abstract class BaseService {
  constructor(protected serviceId: string, protected connectionManager: ConnectionManager) {}
  
  abstract getCapabilities(): ServiceCapability[]
  abstract generateTools(): Tool[]
  abstract handleQuery(userId: string, query: string): Promise<any>
}

// src/services/google-calendar-service.ts
export class GoogleCalendarService extends BaseService {
  async listEvents(userId: string, options: ListEventsOptions): Promise<CalendarEvent[]>
  async createEvent(userId: string, event: CreateEventRequest): Promise<CalendarEvent>
  async queryEvents(userId: string, query: string): Promise<CalendarEvent[]>
  
  getCapabilities(): ServiceCapability[] {
    return ['calendar.read', 'calendar.write', 'calendar.query'];
  }
  
  generateTools(): Tool[] {
    return [calendarQueryTool, calendarCreateTool, calendarManageTool];
  }
}

// src/services/spotify-service.ts
export class SpotifyService extends BaseService {
  async getPlaylists(userId: string): Promise<Playlist[]>
  async playPlaylist(userId: string, playlistId: string): Promise<void>
  async getCurrentTrack(userId: string): Promise<Track>
  
  getCapabilities(): ServiceCapability[] {
    return ['music.read', 'music.control', 'music.query'];
  }
  
  generateTools(): Tool[] {
    return [musicQueryTool, musicControlTool, musicPlaylistTool];
  }
}

// src/services/service-orchestrator.ts
export class ServiceOrchestrator {
  async executeQuery(userId: string, query: string): Promise<CrossServiceResult>
  async getAvailableTools(userId: string): Promise<Tool[]>
  async executeMultiServiceQuery(userId: string, queries: ServiceQuery[]): Promise<any>
}
```

### 3. Database Schema - Better Auth Managed + Service Extensions

```sql
-- Better Auth creates these tables automatically:
-- users, sessions, accounts, verificationTokens
-- No need to manually create authentication tables!

-- Our service-specific extensions:
CREATE TABLE service_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    service_id VARCHAR(50) NOT NULL, -- 'google', 'spotify'
    data_type VARCHAR(100) NOT NULL, -- 'calendar_events', 'playlists'
    data_key VARCHAR(255) NOT NULL,  -- Specific identifier
    data_content JSONB NOT NULL,
    cache_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_service (user_id, service_id),
    INDEX idx_data_type (user_id, service_id, data_type),
    INDEX idx_expiry (cache_expires_at),
    UNIQUE(user_id, service_id, data_type, data_key)
);

-- Service capabilities and tools registry
CREATE TABLE service_providers (
    id VARCHAR(50) PRIMARY KEY, -- 'google', 'spotify'
    name VARCHAR(100) NOT NULL,
    api_config JSONB NOT NULL,  -- API endpoints, rate limits
    capabilities JSONB NOT NULL, -- Service capabilities
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Multi-service data cache
CREATE TABLE service_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id VARCHAR(50) REFERENCES service_providers(id),
    data_type VARCHAR(100) NOT NULL, -- 'calendar_events', 'playlists', 'messages', etc.
    data_key VARCHAR(255) NOT NULL,  -- Specific identifier for the data
    data_content JSONB NOT NULL,
    cache_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_service (user_id, service_id),
    INDEX idx_data_type (user_id, service_id, data_type),
    INDEX idx_expiry (cache_expires_at),
    UNIQUE(user_id, service_id, data_type, data_key)
);

-- Dynamic tool registry
CREATE TABLE available_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id VARCHAR(50) REFERENCES service_providers(id),
    tool_name VARCHAR(100) NOT NULL,
    tool_description TEXT,
    tool_schema JSONB NOT NULL, -- Zod schema for the tool
    required_capabilities TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(service_id, tool_name)
);

-- User sessions for CLI
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);
```

### 4. API Endpoints Design - Better Auth Integration

```typescript
// src/server/server.ts - Better Auth handles all authentication
import { auth } from "../auth/auth.js";

// Better Auth handles all OAuth2 routes automatically:
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
// Routes: /api/auth/signin/google, /api/auth/signin/spotify, 
//         /api/auth/callback/*, /api/auth/session, etc.

// Authentication middleware
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user || null);
  c.set("session", session?.session || null);
  return next();
});

// Our service-specific routes
app.get('/api/connections', connectionsController.getConnections);
app.post('/api/connections/:serviceId/scopes', connectionsController.addScopes);

// Service API routes
app.get('/api/calendar/events', calendarController.getEvents);
app.post('/api/calendar/events', calendarController.createEvent);
app.get('/api/spotify/playlists', spotifyController.getPlaylists);
app.post('/api/spotify/play', spotifyController.playMusic);
```

## 🔐 Security Architecture - Better Auth Managed

### 1. Better Auth Security Features (Built-in)

Better Auth provides enterprise-grade security out of the box:

```typescript
// All security handled automatically by Better Auth:
// ✅ AES-256 token encryption
// ✅ PKCE for OAuth2 flows  
// ✅ CSRF protection with secure state parameters
// ✅ Secure cookie management (SameSite, Secure, HttpOnly)
// ✅ Session token rotation
// ✅ Input validation and sanitization

// Our configuration leverages these features:
export const auth = betterAuth({
  // Secure session management
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // Refresh daily
  },
  
  // Cross-domain security for CLI
  advanced: {
    crossSubDomainCookies: { enabled: true },
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true
    }
  }
});
```

### 2. Service-Level Security

```typescript
// src/security/service-security.ts
export class ServiceSecurity {
  // Rate limiting per service
  static createRateLimit(serviceId: string) {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: getServiceLimit(serviceId), // Service-specific limits
      keyGenerator: (req) => `${req.user?.id}:${serviceId}`,
    });
  }
  
  // Scope validation
  static validateScopes(userScopes: string[], requiredScopes: string[]): boolean {
    return requiredScopes.every(scope => userScopes.includes(scope));
  }
}
```

## 📊 Data Flow Architecture

### 1. Calendar Query Flow

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant Server
    participant Auth
    participant Calendar
    participant Google
    participant DB
    
    User->>CLI: "What's on my calendar today?"
    CLI->>Server: Query with session token
    Server->>Auth: Validate session
    Auth->>DB: Get user tokens
    DB-->>Auth: Encrypted tokens
    Auth->>Auth: Decrypt tokens
    Auth-->>Server: Valid tokens
    Server->>Calendar: Query events
    Calendar->>Google: Calendar API call
    Google-->>Calendar: Event data
    Calendar->>DB: Cache events
    Calendar-->>Server: Processed events
    Server-->>CLI: Formatted response
    CLI-->>User: "You have 3 meetings today..."
```

### 2. Event Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant Parser
    participant Calendar
    participant Google
    
    User->>CLI: "Schedule dinner with John Friday 7pm"
    CLI->>Parser: Parse natural language
    Parser-->>CLI: Structured event data
    CLI->>Calendar: Create event request
    Calendar->>Google: Calendar API create
    Google-->>Calendar: Created event
    Calendar-->>CLI: Event confirmation
    CLI-->>User: "Event created: Dinner with John..."
```

## 🚀 Performance Architecture

### 1. Caching Strategy

```typescript
// src/cache/calendar-cache.ts
export class CalendarCache {
  private redis: Redis;
  private readonly TTL = 300; // 5 minutes
  
  async getEvents(userId: string, dateRange: DateRange): Promise<CalendarEvent[] | null> {
    const key = `calendar:${userId}:${dateRange.start}:${dateRange.end}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async setEvents(userId: string, dateRange: DateRange, events: CalendarEvent[]): Promise<void> {
    const key = `calendar:${userId}:${dateRange.start}:${dateRange.end}`;
    await this.redis.setex(key, this.TTL, JSON.stringify(events));
  }
}
```

### 2. Rate Limiting Strategy

```typescript
// src/middleware/rate-limit.ts
export const calendarRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per user
  keyGenerator: (req) => req.user?.id || req.ip,
  message: 'Too many calendar requests, please try again later'
});

// Different limits for different operations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 auth attempts per 15 minutes
  skipSuccessfulRequests: true
});
```

## 🧪 Testing Architecture

### 1. Unit Testing Strategy

```typescript
// tests/unit/calendar-service.test.ts
describe('CalendarService', () => {
  let service: CalendarService;
  let mockGoogleClient: jest.Mocked<GoogleCalendarClient>;
  
  beforeEach(() => {
    mockGoogleClient = createMockGoogleClient();
    service = new CalendarService(mockGoogleClient);
  });
  
  describe('queryEvents', () => {
    it('should parse "this week" correctly', async () => {
      const events = await service.queryEvents('user123', 'this week');
      expect(mockGoogleClient.listEvents).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          timeMin: expect.any(Date),
          timeMax: expect.any(Date)
        })
      );
    });
  });
});
```

### 2. Integration Testing Strategy

```typescript
// tests/integration/oauth-flow.test.ts
describe('OAuth Flow Integration', () => {
  let app: Express;
  let server: Server;
  
  beforeAll(async () => {
    app = createTestApp();
    server = app.listen(0);
  });
  
  it('should complete full OAuth flow', async () => {
    // 1. Initiate OAuth
    const authResponse = await request(app)
      .get('/auth/google')
      .expect(302);
    
    // 2. Extract auth URL and state
    const authUrl = authResponse.headers.location;
    const state = new URL(authUrl).searchParams.get('state');
    
    // 3. Simulate callback with auth code
    const callbackResponse = await request(app)
      .get('/auth/google/callback')
      .query({ code: 'mock_auth_code', state })
      .expect(200);
    
    // 4. Verify tokens were stored
    expect(callbackResponse.body).toHaveProperty('user');
    expect(callbackResponse.body).toHaveProperty('sessionToken');
  });
});
```

## 🎯 Deployment Architecture

### 1. Environment Configuration

```bash
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Google OAuth2
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://api.vibeplexity.com/auth/google/callback

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/orin
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_256_bit_secret
ENCRYPTION_KEY=your_encryption_key
SESSION_SECRET=your_session_secret

# CORS
CORS_ORIGIN=https://orin.ai,https://app.orin.ai

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=30
RATE_LIMIT_AUTH_ATTEMPTS=5
```

### 2. Docker Configuration

```dockerfile
# Dockerfile
FROM oven/bun:alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN bun run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["bun", "run", "start"]
```

This technical architecture provides a robust foundation for implementing Google Calendar integration while maintaining security, performance, and scalability standards.
