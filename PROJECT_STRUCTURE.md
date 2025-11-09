# Project Structure

```
meme-coin-aggregator/
├── src/
│   ├── index.ts                 # Entry point, Express server, WebSocket init, scheduler
│   ├── api/
│   │   ├── routes.ts            # REST API endpoints (/tokens, /tokens/:address, /health)
│   │   └── websocket.ts         # Socket.io setup, subscription management, broadcasts
│   ├── services/
│   │   ├── aggregator.ts        # DEX API integrations, data merging logic
│   │   ├── cache.ts             # Redis operations (get, set, invalidate)
│   │   └── rateLimiter.ts       # Rate limiting with exponential backoff
│   ├── utils/
│   │   ├── pagination.ts        # Cursor encoding/decoding, pagination logic
│   │   └── helpers.ts           # Sorting, change detection utilities
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces and types
│   └── config/
│       └── index.ts             # Environment configuration
│
├── tests/
│   ├── unit/
│   │   ├── aggregator.test.ts   # Token merging, deduplication tests
│   │   ├── cache.test.ts        # Redis cache operations tests
│   │   └── pagination.test.ts   # Cursor and pagination tests
│   └── integration/
│       ├── api.test.ts          # REST endpoint tests
│       └── websocket.test.ts    # WebSocket connection and event tests
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest test configuration
├── railway.json                 # Railway deployment config
├── Procfile                     # Render/Heroku deployment config
├── postman_collection.json      # Postman API collection
├── client.html                  # WebSocket test client
├── load-test.js                 # Load testing script
├── README.md                    # Main documentation
├── QUICKSTART.md                # Quick start guide
└── PROJECT_STRUCTURE.md         # This file
```

## File Descriptions

### Core Application Files

**src/index.ts**
- Express server initialization
- WebSocket server setup
- Background scheduler for token updates
- Graceful shutdown handling

**src/api/routes.ts**
- GET /api/tokens - Paginated token list with filtering/sorting
- GET /api/tokens/:address - Individual token details
- GET /api/health - Service health check

**src/api/websocket.ts**
- Socket.io server initialization
- Client subscription management
- Token update broadcasting
- Price change and volume spike detection

**src/services/aggregator.ts**
- fetchFromDexScreener() - DexScreener API integration
- fetchFromJupiter() - Jupiter Price API integration
- fetchFromGeckoTerminal() - GeckoTerminal API integration
- mergeTokenData() - Deduplication and data merging
- aggregateTokenData() - Orchestrates all API calls

**src/services/cache.ts**
- Redis connection management
- getCachedTokens() - Retrieve cached data
- setCachedTokens() - Store data with TTL
- invalidateCache() - Clear cache by pattern

**src/services/rateLimiter.ts**
- SimpleRateLimiter class
- Throttle API calls with delays
- Exponential backoff on rate limits

**src/utils/pagination.ts**
- encodeCursor() - Create pagination cursor
- decodeCursor() - Parse pagination cursor
- paginate() - Slice data by cursor and limit

**src/utils/helpers.ts**
- sortTokens() - Sort by volume, price change, or market cap
- detectPriceChange() - Calculate price change percentage
- detectVolumeSpike() - Detect significant volume increases

**src/types/index.ts**
- TokenData interface
- API response types
- Query parameter types

**src/config/index.ts**
- Environment variable loading
- Configuration validation
- Default values

### Test Files

**tests/unit/aggregator.test.ts**
- Token deduplication tests
- Price averaging tests
- Multi-source merging tests

**tests/unit/cache.test.ts**
- Cache set/get operations
- TTL expiration tests
- Connection tests

**tests/unit/pagination.test.ts**
- Cursor encoding/decoding
- Page slicing
- Edge cases

**tests/integration/api.test.ts**
- REST endpoint functionality
- Query parameter handling
- Error responses

**tests/integration/websocket.test.ts**
- WebSocket connection
- Subscription management
- Event broadcasting

### Configuration Files

**package.json**
- Dependencies: express, socket.io, ioredis, axios
- Dev dependencies: typescript, jest, ts-node
- Scripts: dev, build, start, test

**tsconfig.json**
- TypeScript compiler options
- Target: ES2020
- Module: CommonJS
- Strict mode enabled

**jest.config.js**
- Test environment: node
- Preset: ts-jest
- Test pattern: **/*.test.ts

**.env.example**
- PORT - Server port (default: 3000)
- REDIS_URL - Redis connection string
- CACHE_TTL - Cache expiration in seconds (default: 30)
- UPDATE_INTERVAL - Background update interval in ms (default: 10000)
- NODE_ENV - Environment (development/production)

### Deployment Files

**railway.json**
- Railway.app deployment configuration
- Build and start commands
- Restart policy

**Procfile**
- Render/Heroku deployment
- Web process definition

### Testing & Documentation

**postman_collection.json**
- Complete API collection
- All endpoints with examples
- Environment variables

**client.html**
- Interactive WebSocket test client
- Token list display
- Real-time update visualization
- Event logging

**load-test.js**
- Sequential request testing
- Parallel request testing
- Cache effectiveness testing
- Performance metrics

**README.md**
- Complete project documentation
- API reference
- Deployment guide
- Architecture overview

**QUICKSTART.md**
- 5-minute setup guide
- Testing instructions
- Troubleshooting tips
- Demo video guide

## Data Flow

```
1. Client Request
   ↓
2. Express Route Handler
   ↓
3. Check Redis Cache
   ↓
4. [Cache Miss] → Aggregator Service
   ↓
5. Parallel API Calls (DexScreener, Jupiter, GeckoTerminal)
   ↓
6. Rate Limiter (throttle + backoff)
   ↓
7. Merge & Deduplicate Data
   ↓
8. Store in Redis Cache
   ↓
9. Return to Client

Background Process:
   ↓
10. Scheduler (every 10s)
    ↓
11. Fetch Fresh Data
    ↓
12. Detect Changes
    ↓
13. Broadcast via WebSocket
    ↓
14. Subscribed Clients Receive Updates
```

## Key Design Patterns

1. **Simple Functions Over Classes**
   - Easier to test and understand
   - Functional programming style
   - Minimal boilerplate

2. **Cache-First Strategy**
   - Check cache before API calls
   - Reduce external API load
   - Fast response times

3. **Graceful Degradation**
   - Continue with partial data if one API fails
   - Log errors but don't crash
   - Return what's available

4. **Rate Limiting**
   - Throttle requests to respect API limits
   - Exponential backoff on 429 errors
   - Per-API tracking

5. **Real-time Updates**
   - Background scheduler refreshes data
   - WebSocket broadcasts changes
   - Client subscription model

## Environment Setup

### Development
```bash
npm install
cp .env.example .env
# Start Redis locally
npm run dev
```

### Testing
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
node load-test.js           # Load testing
```

### Production
```bash
npm run build               # Compile TypeScript
npm start                   # Run compiled code
```

## Performance Targets

- Initial load: < 2s
- Cached response: < 100ms
- WebSocket latency: < 500ms
- Memory usage: ~100MB
- Concurrent connections: 100+

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless design
   - Redis as shared cache
   - Load balancer compatible

2. **Caching Strategy**
   - Multi-level caching
   - Configurable TTL
   - Pattern-based invalidation

3. **API Rate Limits**
   - Per-API throttling
   - Exponential backoff
   - Request queuing

4. **WebSocket Management**
   - Subscription tracking
   - Connection pooling
   - Heartbeat monitoring
