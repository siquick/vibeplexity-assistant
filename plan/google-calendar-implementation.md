# Multi-Service Connection Hub - Implementation Plan

## 📋 Executive Summary

Building a unified connection hub for Orin will enable users to:
- **Calendar Management**: "What's coming up this week?", "Schedule meeting Friday 2pm"
- **Music Control**: "Play my Focus playlist", "What's currently playing?"
- **Multi-Service Queries**: "What's on my calendar and play some background music"
- **Future Services**: Slack, GitHub, Notion, email, social media, etc.

This requires a **unified OAuth2 system**, **service abstraction layer**, **modular tool architecture**, and **extensible authentication** for multiple service providers.

## 🎯 Core Requirements

### Functional Requirements
1. **Multi-Service OAuth2 Hub** - Unified authentication for Google, Spotify, and future services
2. **Service Abstraction Layer** - Consistent API interface across different services
3. **Dynamic Tool Discovery** - Automatically expose tools based on connected services
4. **Cross-Service Operations** - Enable queries that span multiple services
5. **Multi-User Support** - Handle multiple users with different service connections
6. **Extensible Architecture** - Easy addition of new services without core changes

### Non-Functional Requirements
1. **Security** - Encrypted token storage, secure API communication
2. **Performance** - Efficient calendar queries, caching strategies
3. **Reliability** - Error handling, token refresh, API rate limiting
4. **User Experience** - Seamless authorization flow, clear error messages
5. **Privacy** - Minimal data storage, user consent management

## 🏗️ Architecture Overview

### Current State Analysis
```
Current Orin Architecture:
├── CLI Interface (index.ts)
├── Agentic Workflow (3-step planning)
├── Tools (web-search, fetch-url, generate-haiku)
├── Planning System (structured prompts)
└── AI SDK Integration (Gemini/OpenAI)

Missing for Connection Hub:
├── Multi-Service Authentication System
├── Service Provider Registry
├── Unified Token Management
├── Service Abstraction Layer
├── Dynamic Tool Registration
└── Cross-Service Query Engine
```

### Proposed Architecture
```
Enhanced Orin with Connection Hub:
├── CLI Interface (enhanced with multi-service auth)
├── Web Server (OAuth callbacks, service endpoints)
├── Connection Hub Core
│   ├── Multi-Service OAuth2 Manager
│   ├── Service Provider Registry
│   ├── Unified Token Storage & Encryption
│   └── User Session Management
├── Database Layer
│   ├── User Accounts
│   ├── Service Connections
│   ├── Encrypted Tokens (per service)
│   └── Service Data Cache
├── Service Abstraction Layer
│   ├── Google Calendar Service
│   ├── Spotify Service
│   ├── Future Services (Slack, GitHub, etc.)
│   └── Cross-Service Query Engine
└── Dynamic Tool System
    ├── Service-Specific Tools (auto-generated)
    ├── Cross-Service Tools
    └── Tool Discovery & Registration
```

## 🔧 Technical Implementation Plan

### Phase 1: Authentication Infrastructure (Week 1-2)

#### 1.1 OAuth2 Flow Setup
```typescript
// New files to create:
src/auth/
├── oauth-config.ts       # Google OAuth2 configuration
├── oauth-flow.ts         # Authorization flow management
├── token-manager.ts      # Token storage and refresh
└── auth-middleware.ts    # Authentication middleware
```

**Key Components:**
- Google OAuth2 client configuration
- Authorization URL generation
- Token exchange and refresh logic
- Secure token storage with encryption

#### 1.2 Database Layer
```typescript
// New files:
src/storage/
├── database.ts           # Database connection & schema
├── user-repository.ts    # User data operations
├── token-repository.ts   # Token CRUD operations
└── migrations/           # Database schema migrations
```

**Storage Options:**
- **SQLite** (for development/simple deployment)
- **PostgreSQL** (for production)
- **Redis** (for session/cache storage)

#### 1.3 Web Server Component
```typescript
// New files:
src/server/
├── server.ts             # Express/Hono web server
├── routes/
│   ├── auth.ts          # OAuth callback routes
│   ├── calendar.ts      # Calendar API endpoints
│   └── health.ts        # Health check endpoints
└── middleware/
    ├── auth.ts          # Authentication middleware
    ├── cors.ts          # CORS configuration
    └── rate-limit.ts    # Rate limiting
```

### Phase 2: Google Calendar Integration (Week 2-3)

#### 2.1 Calendar API Client
```typescript
// New files:
src/calendar/
├── google-calendar-client.ts  # Google Calendar API wrapper
├── calendar-service.ts        # Business logic layer
├── date-parser.ts            # Natural language date parsing
├── event-formatter.ts        # Event data formatting
└── types/
    ├── calendar-types.ts     # Calendar-specific types
    └── event-types.ts        # Event data structures
```

#### 2.2 Calendar Tools
```typescript
// New tool files:
src/tools/
├── calendar-query.ts         # Query calendar events
├── calendar-create.ts        # Create calendar events
├── calendar-manage.ts        # Update/delete events
└── calendar-availability.ts  # Check availability
```

### Phase 3: Enhanced Planning & CLI (Week 3-4)

#### 3.1 Enhanced Planner
```typescript
// Updates to existing files:
src/prompts/planner.js
- Add calendar tools to available tools
- Enhanced temporal reasoning for calendar queries
- Date/time parsing and validation
- Event creation prompt templates
```

#### 3.2 CLI Enhancements
```typescript
// Updates to index.ts:
- User authentication flow in CLI
- Session management
- Calendar-specific error handling
- Multi-user support
```

## 🔐 Security Considerations

### 1. OAuth2 Security
- **PKCE (Proof Key for Code Exchange)** for enhanced security
- **State parameter** to prevent CSRF attacks
- **Secure redirect URIs** with HTTPS only
- **Scope limitation** to minimum required permissions

### 2. Token Security
- **Encryption at rest** using AES-256
- **Secure key management** (environment variables, key rotation)
- **Token expiration handling** with automatic refresh
- **Secure token transmission** (HTTPS only)

### 3. Data Protection
- **Minimal data storage** (only essential calendar metadata)
- **Data retention policies** (automatic cleanup)
- **User consent management** (clear permission explanations)
- **Audit logging** for security monitoring

## 📊 Database Schema Design

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

### Tokens Table
```sql
CREATE TABLE user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    encrypted_access_token TEXT NOT NULL,
    encrypted_refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    scope TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Calendar Cache Table (Optional)
```sql
CREATE TABLE calendar_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    calendar_id VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    cache_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🛠️ Required Dependencies

### New Package Dependencies
```json
{
  "dependencies": {
    "google-auth-library": "^9.0.0",
    "googleapis": "^128.0.0",
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0",
    "pg": "^8.11.0",
    "sqlite3": "^5.1.6",
    "redis": "^4.6.0",
    "crypto-js": "^4.2.0",
    "chrono-node": "^2.7.0",
    "dotenv": "^16.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/pg": "^8.10.0",
    "@types/crypto-js": "^4.2.0",
    "@types/uuid": "^9.0.0"
  }
}
```

## 🚀 Deployment Considerations

### Environment Variables
```bash
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/vibeplexity
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
SESSION_SECRET=your_session_secret

# Server Configuration
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Infrastructure Requirements
- **Web Server** (Express.js/Hono running on port 3000)
- **Database** (PostgreSQL for production, SQLite for development)
- **Redis** (for session storage and caching)
- **HTTPS Certificate** (required for OAuth2)
- **Domain Name** (for OAuth2 redirect URIs)

## 📝 Implementation Steps

### Week 1: Foundation
1. **Day 1-2**: Set up database schema and connection
2. **Day 3-4**: Implement OAuth2 flow (Google OAuth2 setup)
3. **Day 5-7**: Create token management and encryption

### Week 2: API Integration
1. **Day 8-9**: Implement Google Calendar API client
2. **Day 10-11**: Create calendar service layer
3. **Day 12-14**: Build natural language date parsing

### Week 3: Tools Development
1. **Day 15-16**: Develop calendar query tool
2. **Day 17-18**: Create calendar event creation tool
3. **Day 19-21**: Implement calendar management tools

### Week 4: Integration & Testing
1. **Day 22-23**: Enhance planner with calendar capabilities
2. **Day 24-25**: Update CLI for authentication flow
3. **Day 26-28**: Testing, debugging, and documentation

## 🧪 Testing Strategy

### Unit Tests
- OAuth2 flow components
- Token encryption/decryption
- Calendar API client methods
- Date parsing functions
- Calendar tools functionality

### Integration Tests
- End-to-end OAuth2 flow
- Google Calendar API integration
- Database operations
- Complete agentic workflow with calendar

### Security Tests
- Token security validation
- OAuth2 flow security testing
- Input validation and sanitization
- Rate limiting verification

## 🎯 Success Metrics

### Functional Success
- [ ] Users can authenticate with Google Calendar
- [ ] Calendar queries work with natural language
- [ ] Event creation works reliably
- [ ] Multi-user support functions correctly
- [ ] Token refresh works automatically

### Performance Success
- [ ] Calendar queries respond within 2 seconds
- [ ] Authentication flow completes within 30 seconds
- [ ] Database queries execute within 500ms
- [ ] API rate limits are respected

### Security Success
- [ ] All tokens are encrypted at rest
- [ ] OAuth2 flow passes security audit
- [ ] No sensitive data in logs
- [ ] HTTPS enforced for all auth flows

## 🎨 User Experience Flow

### Initial Setup
1. User runs `bun run cli`
2. On first calendar query, prompted to authenticate
3. CLI opens browser to Google OAuth2 consent screen
4. User grants permissions
5. Browser redirects to local server with auth code
6. CLI completes authentication and stores encrypted tokens
7. Calendar functionality now available

### Daily Usage
```
🤖 Your query: What do I have coming up this week?

🧠 Planning... ✅
🔧 Executing tools... 📅📅 ✅
🎭 Synthesising... ✅

🎉 RESPONSE:
Here's what you have coming up this week:

**Tuesday, September 5th**
- 2:00 PM - Team standup meeting (30 mins)
- 7:00 PM - Radiohead concert at O2 Arena

**Wednesday, September 6th**
- 9:00 AM - Client presentation (1 hour)
- 6:30 PM - Dinner with Sarah

**Thursday, September 7th**
- All day - Focus time (no meetings scheduled)

You have a busy but manageable week ahead!

🤖 Your query: Create a reminder to buy concert tickets for Saturday 8pm
🧠 Planning... ✅
🔧 Executing tools... 📅 ✅
🎭 Synthesising... ✅

🎉 RESPONSE:
✅ Created calendar event: "Buy concert tickets"
📅 Date: Saturday, September 9th at 8:00 PM
⏱️ Duration: 1 hour
🔗 Event ID: evt_abc123xyz

The reminder has been added to your calendar!
```

## 🔮 Future Enhancements

### Phase 2 Features
- **Multiple Calendar Support** (work, personal, shared calendars)
- **Meeting Intelligence** (conflict detection, optimal meeting times)
- **Calendar Analytics** (time tracking, productivity insights)
- **Smart Scheduling** (AI-suggested meeting times)

### Phase 3 Features
- **Integration with Other Calendar Providers** (Outlook, Apple Calendar)
- **Team Calendar Management** (shared calendars, room booking)
- **Advanced Event Processing** (recurring events, reminders, attachments)
- **Calendar Sync Across Platforms** (bidirectional sync)

## 💡 Key Risks & Mitigation

### Technical Risks
1. **Google API Rate Limits** → Implement smart caching and batch requests
2. **Token Expiration Issues** → Robust refresh token handling
3. **Date Parsing Complexity** → Use proven libraries (chrono-node)
4. **Database Performance** → Implement proper indexing and caching

### Security Risks
1. **Token Compromise** → Encryption, secure storage, token rotation
2. **OAuth2 Attacks** → PKCE, state validation, secure redirects
3. **Data Breach** → Minimal data storage, encryption, audit logs

### Business Risks
1. **Google API Changes** → Version pinning, change monitoring
2. **User Privacy Concerns** → Clear consent, minimal data collection
3. **Compliance Requirements** → GDPR compliance, data retention policies

This comprehensive plan provides a roadmap for implementing Google Calendar integration while maintaining security, performance, and user experience standards.
