# Getting Started - Complete Guide

## 🎯 What You Have

A complete, production-ready real-time meme coin aggregation service with:
- ✅ REST API with pagination, filtering, and sorting
- ✅ WebSocket support for real-time updates
- ✅ Redis caching with configurable TTL
- ✅ Rate limiting with exponential backoff
- ✅ Integration with 3 DEX APIs (DexScreener, Jupiter, GeckoTerminal)
- ✅ 15+ unit and integration tests
- ✅ Complete documentation
- ✅ Deployment configurations
- ✅ Testing tools (Postman collection, load tester, WebSocket client)

## 🚀 Quick Start (5 Minutes)

### Step 1: Verify Setup
```bash
node verify-setup.js
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local development):
```env
PORT=3000
REDIS_URL=redis://localhost:6379
CACHE_TTL=30
UPDATE_INTERVAL=10000
NODE_ENV=development
```

### Step 4: Start Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Windows (WSL):**
```bash
sudo apt-get install redis-server
sudo service redis-server start
```

**Or use Redis Cloud (Free):**
1. Go to https://redis.com/try-free/
2. Create account and database
3. Copy connection URL to `.env`

### Step 5: Run the Service
```bash
npm run dev
```

You should see:
```
Server running on port 3000
Environment: development
Cache TTL: 30s
Redis connected
Scheduler started with 10000ms interval
```

### Step 6: Test It!

**Browser:**
- Health: http://localhost:3000/api/health
- Tokens: http://localhost:3000/api/tokens?limit=10
- WebSocket Client: Open `client.html` in browser

**Terminal:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get tokens
curl http://localhost:3000/api/tokens?limit=10&sortBy=volume
```

## 📚 What to Read Next

1. **QUICKSTART.md** - Detailed setup and testing guide
2. **README.md** - Complete API documentation
3. **PROJECT_STRUCTURE.md** - Code organization and architecture
4. **DELIVERABLES_CHECKLIST.md** - Submission requirements

## 🧪 Testing

### Run All Tests
```bash
npm test
```

Expected output:
```
PASS tests/unit/pagination.test.ts
PASS tests/unit/aggregator.test.ts
PASS tests/unit/cache.test.ts
PASS tests/integration/api.test.ts
PASS tests/integration/websocket.test.ts

Test Suites: 5 passed, 5 total
Tests:       15 passed, 15 total
```

### Load Testing
```bash
node load-test.js
```

Shows:
- Sequential request performance
- Parallel request performance
- Cache effectiveness
- Response times

### Manual Testing

**1. Postman Collection**
- Import `postman_collection.json`
- Set `base_url` to `http://localhost:3000`
- Run all requests

**2. WebSocket Client**
- Open `client.html` in 2-3 browser tabs
- Click "Fetch Top 20 Tokens"
- Click "Subscribe to All Loaded Tokens"
- Watch real-time updates in all tabs

## 🚀 Deployment

### Option A: Railway (Recommended)

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add Redis
railway add

# Deploy
railway up

# Get URL
railway domain
```

### Option B: Render

1. Push code to GitHub
2. Go to https://render.com
3. New → Web Service
4. Connect GitHub repo
5. Add Redis database
6. Set environment variables:
   - `PORT=3000`
   - `REDIS_URL=<from-redis-addon>`
   - `CACHE_TTL=30`
   - `UPDATE_INTERVAL=10000`
   - `NODE_ENV=production`
7. Deploy!

### After Deployment

1. Test health endpoint: `https://your-app.com/api/health`
2. Test tokens endpoint: `https://your-app.com/api/tokens?limit=10`
3. Update README.md with deployment URL
4. Test WebSocket with deployed URL in client.html

## 🎥 Demo Video Guide

### What to Record (1-2 minutes total)

**Segment 1: API Demo (30 seconds)**
```
1. Open Postman or browser
2. Show GET /api/health
3. Show GET /api/tokens with different sort options
4. Highlight fast response times
```

**Segment 2: WebSocket Demo (30 seconds)**
```
1. Open 2-3 browser tabs with client.html
2. Fetch tokens in all tabs
3. Subscribe to tokens
4. Show real-time updates appearing simultaneously
```

**Segment 3: Performance (30 seconds)**
```
1. Run load-test.js
2. Show 10 rapid API calls
3. Display response times
4. Show cache improvement (80-90% faster)
```

**Segment 4: Architecture (30 seconds)**
```
1. Quick code walkthrough
2. Explain: API → Aggregator → Cache → WebSocket
3. Mention rate limiting and error handling
4. Highlight design decisions (simple, scalable)
```

### Recording Tools
- **OBS Studio** (free, powerful)
- **Loom** (easy, web-based)
- **QuickTime** (Mac)
- **Windows Game Bar** (Windows)

### Upload
1. Upload to YouTube (public or unlisted)
2. Add link to README.md
3. Add link to submission

## 📋 Pre-Submission Checklist

### Code
- [ ] All files committed to GitHub
- [ ] Clean, meaningful commit messages
- [ ] No .env file in repo (only .env.example)
- [ ] All tests passing

### Deployment
- [ ] Deployed to Railway or Render
- [ ] Redis connected
- [ ] Public URL working
- [ ] URL added to README

### Documentation
- [ ] README.md complete
- [ ] Design decisions explained
- [ ] API endpoints documented
- [ ] Setup instructions clear

### Testing
- [ ] Postman collection included
- [ ] All tests passing (npm test)
- [ ] Load test runs successfully
- [ ] WebSocket client works

### Demo Video
- [ ] Recorded (1-2 minutes)
- [ ] Uploaded to YouTube
- [ ] Link in README
- [ ] Shows all features

## 🐛 Troubleshooting

### Redis Connection Error
```
Error: Redis connection failed
```
**Solution:**
- Check Redis is running: `redis-cli ping`
- Verify REDIS_URL in .env
- For Redis Cloud, check connection string

### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution:**
- Change PORT in .env to 3001
- Or kill process using port 3000

### API Rate Limit Errors
```
Rate limit hit for dexscreener
```
**Solution:**
- This is normal! Service handles it automatically
- Exponential backoff will retry
- Check logs for "backing off to Xms"

### Tests Failing
```
FAIL tests/unit/cache.test.ts
```
**Solution:**
- Make sure Redis is running
- Some tests require network access
- Check Redis connection

### WebSocket Not Updating
```
No updates appearing in client
```
**Solution:**
- Check browser console for errors
- Verify tokens are subscribed
- Check server logs for scheduler running
- Make sure UPDATE_INTERVAL is set

## 💡 Tips

1. **Development**
   - Use `npm run dev` for auto-reload
   - Check logs for API rate limiting
   - Redis cache makes subsequent requests fast

2. **Testing**
   - Run tests before committing
   - Use load-test.js to verify performance
   - Test WebSocket with multiple tabs

3. **Deployment**
   - Use Railway for easiest deployment
   - Redis Cloud free tier is sufficient
   - Set NODE_ENV=production

4. **Demo Video**
   - Keep it under 2 minutes
   - Show, don't just tell
   - Highlight key features
   - Explain design decisions

## 📞 Need Help?

1. Check **QUICKSTART.md** for detailed instructions
2. Check **README.md** for API documentation
3. Check **PROJECT_STRUCTURE.md** for code organization
4. Check **DELIVERABLES_CHECKLIST.md** for requirements

## 🎯 Success Criteria

Your project is ready when:
- ✅ All tests pass
- ✅ Service runs locally
- ✅ Service deployed and accessible
- ✅ WebSocket updates work
- ✅ Demo video recorded
- ✅ Documentation complete
- ✅ GitHub repo public

## 🚀 Next Steps

1. Run `node verify-setup.js` to check everything
2. Run `npm install` to install dependencies
3. Start Redis server
4. Run `npm run dev` to start service
5. Open `client.html` to test WebSocket
6. Run `npm test` to verify tests
7. Deploy to Railway or Render
8. Record demo video
9. Submit!

Good luck! 🎉
