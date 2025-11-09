# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Redis

**Option A: Local Redis**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows (WSL)
sudo apt-get install redis-server
sudo service redis-server start
```

**Option B: Redis Cloud (Free)**
1. Go to https://redis.com/try-free/
2. Create free account
3. Create database
4. Copy connection URL

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
REDIS_URL=redis://localhost:6379  # or your Redis Cloud URL
CACHE_TTL=30
UPDATE_INTERVAL=10000
NODE_ENV=development
```

### 4. Run the Service
```bash
# Development mode (with auto-reload)
npm run dev

# Or build and run production
npm run build
npm start
```

### 5. Test It!

**Open in browser:**
- API: http://localhost:3000/api/health
- WebSocket Client: Open `client.html` in your browser

**Or use curl:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get tokens
curl http://localhost:3000/api/tokens?limit=10

# Get specific token (replace with actual address)
curl http://localhost:3000/api/tokens/576P1t7XsRL4ZVj38LV2eYWxXRPguBADA8BxcNz1xo8y
```

### 6. Run Tests
```bash
npm test
```

## 📊 Testing WebSocket

1. Open `client.html` in multiple browser tabs
2. Click "Fetch Top 20 Tokens"
3. Click "Subscribe to All Loaded Tokens"
4. Watch real-time updates appear in all tabs!

## 🎥 Making Demo Video

### What to Show:

1. **API Demo** (30 seconds)
   - Show health endpoint
   - Show tokens endpoint with different sort options
   - Show response times

2. **WebSocket Demo** (30 seconds)
   - Open 2-3 browser tabs with client.html
   - Subscribe to tokens
   - Show updates appearing in all tabs simultaneously

3. **Performance Test** (30 seconds)
   - Make 5-10 rapid API calls using Postman or curl
   - Show response times (should be fast with caching)
   - Explain caching strategy

4. **Architecture Explanation** (30 seconds)
   - Quick diagram or code walkthrough
   - Explain: API aggregation → Redis cache → WebSocket updates
   - Mention rate limiting and error handling

### Recording Tips:
- Use OBS Studio (free) or Loom
- Keep it under 2 minutes
- Show terminal + browser side by side
- Speak clearly about design decisions

## 🚀 Deploy to Production

### Railway (Recommended)
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add Redis
railway add

# 5. Deploy
railway up
```

### Render
1. Push to GitHub
2. Go to render.com
3. New → Web Service
4. Connect repo
5. Add Redis database
6. Deploy!

## 🐛 Troubleshooting

**Redis connection error?**
- Check Redis is running: `redis-cli ping` (should return PONG)
- Check REDIS_URL in .env

**API rate limit errors?**
- Normal! The service handles this with exponential backoff
- Check logs for "Rate limit hit" messages

**No WebSocket updates?**
- Make sure background scheduler is running (check logs)
- Verify tokens are subscribed
- Check browser console for errors

**Tests failing?**
- Make sure Redis is running
- Some tests require actual API calls (may be slow)
- Check network connection

## 📝 Next Steps

1. ✅ Get it running locally
2. ✅ Test all endpoints with Postman
3. ✅ Test WebSocket with multiple tabs
4. ✅ Run the test suite
5. ✅ Deploy to Railway/Render
6. ✅ Record demo video
7. ✅ Update README with deployment URL

## 💡 Tips

- Use `npm run dev` for development (auto-reload)
- Check logs for API rate limiting
- Redis cache makes subsequent requests super fast
- WebSocket updates happen every 10 seconds by default
- Adjust UPDATE_INTERVAL in .env for faster/slower updates

Good luck! 🚀
