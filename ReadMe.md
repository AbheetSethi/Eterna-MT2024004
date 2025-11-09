# Real-time Meme Coin Aggregation Service

A Node.js/TypeScript service that aggregates real-time meme coin data from multiple DEX sources (DexScreener, Jupiter, GeckoTerminal) with efficient Redis caching and WebSocket-based real-time updates.

## 🚀 Features

- **Multi-source aggregation**: Fetches data from DexScreener, Jupiter, and GeckoTerminal APIs
- **Smart caching**: Redis-based caching with configurable TTL (default 30s)
- **Real-time updates**: WebSocket support for live price and volume updates
- **Rate limiting**: Exponential backoff to handle API rate limits
- **Pagination**: Cursor-based pagination for large token lists
- **Filtering & Sorting**: Sort by volume, price change, or market cap

## 🏗️ Architecture

Simple, graduate-level project structure:
- **Express.js** for REST API
- **Socket.io** for WebSocket connections
- **Redis** for caching
- **Axios** for HTTP requests with retry logic
- **TypeScript** for type safety

### Design Decisions

1. **Simple functions over classes**: Easier to test and understand
2. **Redis for caching**: Persistent, scalable, and free tier available
3. **Socket.io over native WebSocket**: Auto-reconnection and better browser support
4. **Parallel API calls**: Using `Promise.all()` for faster aggregation
5. **Weighted price averaging**: When same token appears on multiple DEXs

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd meme-coin-aggregator

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Redis URL if needed
```

## 🔧 Configuration

Create a `.env` file:

```env
PORT=3000
REDIS_URL=redis://localhost:6379
CACHE_TTL=30
UPDATE_INTERVAL=10000
NODE_ENV=development
```

## 🏃 Running Locally

### Prerequisites
- Node.js 18+ 
- Redis server running locally or Redis Cloud account

### Start Redis (if local)
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Windows (with WSL)
sudo service redis-server start
```

### Start the service
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### GET /api/tokens
Fetch paginated list of tokens with filtering and sorting.

**Query Parameters:**
- `limit` (default: 30) - Number of tokens per page
- `cursor` - Pagination cursor for next page
- `sortBy` - Sort by `volume`, `price_change`, or `market_cap`
- `timeframe` - Time period: `1h`, `24h`, or `7d`

**Example:**
```bash
curl "http://localhost:3000/api/tokens?limit=10&sortBy=volume"
```

**Response:**
```json
{
  "tokens": [
    {
      "token_address": "576P1t7XsRL4ZVj38LV2eYWxXRPguBADA8BxcNz1xo8y",
      "token_name": "PIPE CTO",
      "token_ticker": "PIPE",
      "price_sol": 4.4141209798877615e-7,
      "market_cap_sol": 441.41209798877617,
      "volume_sol": 1322.4350391679925,
      "liquidity_sol": 149.359428555,
      "transaction_count": 2205,
      "price_1hr_change": 120.61,
      "protocol": "Raydium CLMM",
      "sources": ["dexscreener"],
      "last_updated": 1699564800000
    }
  ],
  "nextCursor": "MTA6MTY5OTU2NDgwMDAwMA=="
}
```

### GET /api/tokens/:address
Fetch individual token by address.

**Example:**
```bash
curl "http://localhost:3000/api/tokens/576P1t7XsRL4ZVj38LV2eYWxXRPguBADA8BxcNz1xo8y"
```

### GET /api/health
Health check endpoint.

**Example:**
```bash
curl "http://localhost:3000/api/health"
```

**Response:**
```json
{
  "status": "ok",
  "cache": "connected",
  "apis": {
    "dexscreener": "available",
    "jupiter": "available",
    "geckoterminal": "available"
  },
  "timestamp": 1699564800000
}
```

## 🔌 WebSocket Events

### Client → Server

**subscribe**: Subscribe to token updates
```javascript
socket.emit('subscribe', { 
  tokenAddresses: ['addr1', 'addr2'] 
});
```

**unsubscribe**: Unsubscribe from token updates
```javascript
socket.emit('unsubscribe', { 
  tokenAddresses: ['addr1'] 
});
```

### Server → Client

**token:update**: General token data update
```javascript
socket.on('token:update', (data) => {
  console.log(data.address, data.data);
});
```

**token:price-change**: Price changed by >5%
```javascript
socket.on('token:price-change', (data) => {
  console.log(`Price change: ${data.change}%`);
});
```

**token:volume-spike**: Volume increased by >50%
```javascript
socket.on('token:volume-spike', (data) => {
  console.log(`Volume spike: ${data.volume}`);
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Coverage:**
- Unit tests: Pagination, aggregation, caching
- Integration tests: API endpoints, WebSocket connections

## 🚀 Deployment

### Deploy to Railway

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add Redis plugin: "New" → "Database" → "Redis"
6. Set environment variables in Railway dashboard
7. Deploy!

### Deploy to Render

1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Add Redis: "New" → "Redis"
6. Set environment variables
7. Deploy!

### Environment Variables for Production
```
PORT=3000
REDIS_URL=<your-redis-url>
CACHE_TTL=30
UPDATE_INTERVAL=10000
NODE_ENV=production
```

## 📊 Performance

- **Initial load**: < 2s for 30 tokens
- **Cached response**: < 100ms
- **WebSocket latency**: < 500ms
- **Memory usage**: ~100MB with Redis

## 🎥 Demo Video

[Link to YouTube demo video]

The video demonstrates:
1. API working with live requests
2. Multiple browser tabs showing WebSocket updates
3. 5-10 rapid API calls with response times
4. Request flow and design decisions

## 📮 Postman Collection

Import the `postman_collection.json` file to test all endpoints.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Web Framework**: Express.js
- **WebSocket**: Socket.io
- **Cache**: Redis (ioredis)
- **HTTP Client**: Axios
- **Testing**: Jest

## 📝 API Rate Limits

- **DexScreener**: 300 requests/min
- **Jupiter**: No official limit (be respectful)
- **GeckoTerminal**: ~30 requests/min

The service implements exponential backoff to handle rate limits gracefully.

## 🤝 Contributing

This is a graduate student project. Feel free to fork and improve!

## 📄 License

MIT
