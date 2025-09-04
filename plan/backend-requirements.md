# Backend Requirements Analysis - Multi-Service Connection Hub

## 🔍 Current State Assessment

### What Vibeplexity Has Today ✅
```
✅ CLI Interface with interactive prompts
✅ Agentic workflow (Planning → Execution → Synthesis)
✅ AI SDK integration (Gemini 2.5 Flash)
✅ Tool system (web-search, fetch-url, generate-haiku)
✅ Structured planning with Zod schemas
✅ TypeScript with strict typing
✅ Bun runtime for performance
✅ Error handling and recovery
✅ Package management and build system
```

### What's Missing for Multi-Service Connection Hub ❌
```
❌ Multi-Service Authentication Hub (unified OAuth2 for Google, Spotify, etc.)
❌ Service Provider Registry (pluggable service architecture)
❌ Service Abstraction Layer (consistent API across services)
❌ Dynamic Tool System (auto-generate tools based on connected services)
❌ Cross-Service Query Engine (queries spanning multiple services)
❌ Extensible Architecture (easy addition of new services)
❌ Connection Management (connect/disconnect services per user)
❌ Service-Specific Data Caching (unified cache for all services)
```

## 🏗️ Critical Missing Components

### 1. **Connection Hub Infrastructure** (HIGH PRIORITY) - SIMPLIFIED WITH BETTER AUTH
```typescript
// Using Better Auth - Significantly Reduced Implementation:
src/auth/
├── auth.ts                # Better Auth configuration (~50 lines)
└── cli-auth-handler.ts    # CLI authentication wrapper

src/server/
├── server.ts              # Hono + Better Auth integration (~100 lines)
├── routes/
│   ├── connections.ts     # Service status endpoints
│   └── services/          # Service-specific API routes
└── middleware/
    └── auth.ts            # Better Auth middleware (provided)

src/connections/
├── connection-manager.ts   # Service connection tracking
├── service-registry.ts     # Service provider registry
└── service-provider.ts     # Service provider interface

Better Auth Handles Automatically:
✅ Multi-provider OAuth2 flows (Google, Spotify, future)
✅ Token encryption and storage
✅ Session management and security
✅ CSRF protection and secure cookies
✅ Token refresh and lifecycle management
```

### 2. **Multi-Service Database Layer** (HIGH PRIORITY)
```typescript
// Currently Missing - Need to Add:
src/storage/
├── database.ts            # Database connection setup
├── migrations/            # Schema migration files
├── repositories/
│   ├── user-repository.ts        # User CRUD operations
│   ├── service-connection-repository.ts # Service connections per user
│   ├── service-provider-repository.ts   # Service provider registry
│   ├── service-cache-repository.ts      # Multi-service data cache
│   └── session-repository.ts            # Session management
└── models/
    ├── user.ts                   # User data models
    ├── service-connection.ts     # Service connection models
    ├── service-provider.ts       # Service provider models
    └── service-data.ts           # Service data cache models

Current Issue:
- No unified storage for multiple service connections
- Cannot store different token types for different services
- No service-agnostic caching system
- No framework for service metadata storage
```

### 3. **Service Abstraction Layer** (HIGH PRIORITY)
```typescript
// Currently Missing - Need to Add:
src/services/
├── base-service.ts           # Abstract base class for all services
├── service-orchestrator.ts   # Cross-service query coordination
├── google-calendar-service.ts # Google Calendar implementation
├── spotify-service.ts        # Spotify implementation
├── future-service.ts         # Template for new services
└── types/
    ├── service-capability.ts # Service capability definitions
    ├── service-query.ts      # Query interface types
    └── service-result.ts     # Result interface types

Current Issue:
- No abstraction layer for different services
- Cannot handle cross-service queries uniformly
- No framework for adding new services consistently
- No capability-based service discovery
```

### 4. **Dynamic Tool System** (HIGH PRIORITY)
```typescript
// Currently Missing - Need to Add:
src/tools/
├── dynamic-tool-generator.ts    # Auto-generate tools from services
├── tool-registry.ts            # Register/discover available tools
├── cross-service-tools.ts      # Tools that span multiple services
└── service-tools/
    ├── calendar-tools.ts       # Google Calendar specific tools
    ├── music-tools.ts          # Spotify specific tools
    └── [future]-tools.ts       # Future service tools

Current Issue:
- Tools are statically defined, not dynamically generated
- Cannot auto-discover tools based on connected services
- No framework for cross-service operations
- Tools don't adapt based on user's service connections
```

### 5. **Cross-Service Query Engine** (MEDIUM PRIORITY)
```typescript
// Currently Missing - Need to Add:
src/query/
├── query-parser.ts           # Parse natural language queries
├── query-planner.ts          # Determine which services to use
├── query-executor.ts         # Execute multi-service queries
├── result-aggregator.ts      # Combine results from multiple services
└── query-optimizer.ts        # Optimize query execution

Current Issue:
- Cannot handle queries that span multiple services
- No intelligent routing of queries to appropriate services
- No result aggregation from multiple sources
- No optimization for cross-service operations
```

## 🎯 Immediate Backend Development Priorities

### Phase 1: Essential Infrastructure (Week 1) - SIMPLIFIED WITH BETTER AUTH
```bash
Priority 1: Better Auth Integration (DAY 1-2)
└── Better Auth configuration with Hono + Drizzle
└── Multi-provider setup (Google + Spotify)
└── CLI-friendly session management

Priority 2: Database Foundation (DAY 2-3)
└── Drizzle ORM setup with Better Auth adapter
└── Service-specific tables (cache, tools registry)
└── Migration system setup

Priority 3: Service Infrastructure (DAY 3-7)
└── Service abstraction layer framework
└── Connection manager for service registry
└── Dynamic tool generation system

TIME SAVED: 5-6 days of custom authentication development!
```

### Phase 2: Core Calendar Features (Week 2-3)
```bash
Priority 4: Google Calendar API Integration
└── Official Google Calendar API client
└── Token refresh and lifecycle management
└── Calendar CRUD operations

Priority 5: Enhanced CLI
└── User authentication flow in CLI
└── Session management across CLI restarts
└── Multi-user support (user switching)

Priority 6: Calendar Tools
└── Natural language date parsing
└── Calendar query, create, manage tools
└── Integration with existing agentic workflow
```

### Phase 3: Production Readiness (Week 4)
```bash
Priority 7: Security Hardening
└── Input validation and sanitization
└── Rate limiting and abuse prevention
└── Security headers and CSRF protection

Priority 8: Performance & Monitoring
└── Caching layer (Redis for calendar data)
└── Database query optimization
└── Error tracking and monitoring

Priority 9: Documentation & Testing
└── Comprehensive testing suite
└── API documentation
└── User setup and troubleshooting guides
```

## 🔧 Technology Stack Decisions

### Web Server Framework
```typescript
Recommendation: Hono.js
Reasoning:
- ✅ Excellent TypeScript support
- ✅ Fast performance (important for CLI responsiveness)
- ✅ Small bundle size
- ✅ Modern API design
- ✅ Good middleware ecosystem

Alternative: Express.js
- ✅ Mature ecosystem
- ✅ Extensive middleware
- ❌ Larger bundle size
- ❌ Less modern TypeScript support
```

### Database Choice
```typescript
Development: SQLite
- ✅ Zero configuration
- ✅ Perfect for development
- ✅ Built into Bun
- ✅ Easy testing and prototyping

Production: PostgreSQL
- ✅ Excellent JSON support (for calendar data)
- ✅ Strong consistency guarantees
- ✅ Great performance
- ✅ Robust ecosystem
- ✅ Good with Node.js/Bun
```

### ORM/Query Builder
```typescript
Recommendation: Drizzle ORM
Reasoning:
- ✅ Excellent TypeScript support
- ✅ Type-safe queries
- ✅ Great performance
- ✅ Modern API design
- ✅ Good with Bun

Alternative: Prisma
- ✅ Great developer experience
- ✅ Type safety
- ❌ Bundle size considerations
- ❌ Migration complexity
```

### Caching Layer
```typescript
Recommendation: Redis
Reasoning:
- ✅ Excellent for session storage
- ✅ Perfect for calendar data caching
- ✅ Good expiration and invalidation
- ✅ Mature Node.js integration

Alternative: In-memory caching
- ✅ Simpler setup
- ❌ Data loss on restart
- ❌ No shared cache across instances
```

## 📦 Required New Dependencies - SIMPLIFIED WITH BETTER AUTH

### Core Backend Dependencies
```json
{
  "dependencies": {
    // Web Server
    "hono": "^3.12.0",
    "@hono/node-server": "^1.8.0",
    
    // Authentication (Better Auth replaces custom auth stack!)
    "better-auth": "^1.0.0",
    
    // Database
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.0",
    "better-sqlite3": "^9.0.0",
    
    // Service APIs
    "googleapis": "^128.0.0",
    "spotify-web-api-node": "^5.0.2",
    
    // Caching
    "redis": "^4.6.0",
    
    // Utilities
    "chrono-node": "^2.7.0",
    "uuid": "^9.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    // Database
    "drizzle-kit": "^0.20.0",
    
    // Types
    "@types/uuid": "^9.0.0",
    
    // Testing
    "@types/supertest": "^6.0.0",
    "supertest": "^6.3.0"
  }
}

REMOVED DEPENDENCIES (Better Auth handles these):
❌ "google-auth-library" - Better Auth includes this
❌ "crypto-js" - Better Auth handles encryption
❌ "helmet" - Better Auth includes security
❌ "cors" - Hono provides this
❌ "@types/crypto-js" - No longer needed
❌ "@types/cors" - No longer needed
```

### Development Tools
```json
{
  "scripts": {
    "dev": "bun run index.ts",
    "dev:server": "bun run src/server/server.ts",
    "cli": "bun run index.ts",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "bun run src/storage/migrate.ts",
    "db:studio": "drizzle-kit studio",
    "auth:setup": "bun run src/auth/setup.ts",
    "test": "bun test",
    "test:watch": "bun test --watch"
  }
}
```

## 🚀 Development Environment Setup

### Local Development Stack
```bash
Required Services:
├── PostgreSQL (port 5432)
├── Redis (port 6379)  
├── Hono Server (port 3000)
└── CLI Interface (interactive)

Docker Compose Setup:
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: vibeplexity
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Environment Variables - SIMPLIFIED WITH BETTER AUTH
```bash
# Better Auth handles OAuth2 configuration automatically
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# OAuth2 Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Database (Better Auth auto-configures)
DATABASE_URL=postgresql://dev:dev@localhost:5432/vibeplexity
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development

REMOVED VARIABLES (Better Auth handles these):
❌ GOOGLE_REDIRECT_URI - Auto-generated by Better Auth
❌ JWT_SECRET - Better Auth manages this
❌ ENCRYPTION_KEY - Better Auth handles encryption
❌ SESSION_SECRET - Better Auth manages sessions
```

## 🎯 Success Criteria

### Week 1 Success: Infrastructure
```bash
✅ Can start web server on localhost:3000
✅ Database schema is created and migrations work
✅ Google OAuth2 flow completes successfully
✅ Tokens are encrypted and stored in database
✅ Basic user authentication works
```

### Week 2 Success: Calendar Integration
```bash
✅ Can authenticate with Google Calendar
✅ Can fetch user's calendar events
✅ Can create calendar events via API
✅ Natural language date parsing works
✅ CLI can authenticate users and maintain sessions
```

### Week 3 Success: Complete Feature
```bash
✅ "What's on my calendar today?" works end-to-end
✅ "Schedule meeting Friday 2pm" creates events
✅ Multi-user support allows different user logins
✅ Error handling provides clear user feedback
✅ Performance meets acceptable standards
```

### Production Ready: Security & Scale
```bash
✅ Security audit passes (OAuth2, encryption, CSRF)
✅ Performance tests meet SLA requirements
✅ Documentation is complete and accurate
✅ Monitoring and error tracking work
✅ Can handle multiple concurrent users
```

This analysis provides a clear roadmap for transforming Vibeplexity from a single-user CLI tool into a multi-user, calendar-integrated platform while maintaining its core agentic AI capabilities.
