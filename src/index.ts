import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config';
import routes from './api/routes';
import { initWebSocket, broadcastMultipleTokens } from './api/websocket';
import { initRedis } from './services/cache';
import { aggregateTokenData } from './services/aggregator';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Initialize WebSocket
initWebSocket(server);

// Initialize Redis
initRedis();

// Background update scheduler
let updateInterval: NodeJS.Timeout;

function startScheduler() {
  updateInterval = setInterval(async () => {
    try {
      console.log('Running scheduled token update...');
      const tokens = await aggregateTokenData('SOL');
      
      if (tokens.length > 0) {
        // Broadcast top 50 tokens
        const topTokens = tokens.slice(0, 50);
        broadcastMultipleTokens(topTokens);
        console.log(`Broadcasted ${topTokens.length} token updates`);
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }, config.updateInterval);

  console.log(`Scheduler started with ${config.updateInterval}ms interval`);
}

// Start server
server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Cache TTL: ${config.cacheTTL}s`);
  
  // Start background updates
  startScheduler();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  clearInterval(updateInterval);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
