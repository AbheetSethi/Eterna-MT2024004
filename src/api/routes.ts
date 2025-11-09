import { Router, Request, Response } from 'express';
import { aggregateTokenData } from '../services/aggregator';
import { getCachedTokens, setCachedTokens, checkRedisConnection } from '../services/cache';
import { paginate } from '../utils/pagination';
import { sortTokens } from '../utils/helpers';
import { QueryParams } from '../types';
import { config } from '../config';

const router = Router();

router.get('/tokens', async (req: Request, res: Response) => {
  try {
    const { limit = 30, cursor, sortBy = 'volume', timeframe = '24h' } = req.query as any;
    
    const cacheKey = `tokens:all:${timeframe}:${sortBy}`;
    
    // Try cache first
    let tokens = await getCachedTokens(cacheKey);
    
    if (!tokens) {
      // Fetch from APIs
      tokens = await aggregateTokenData('SOL');
      
      if (tokens.length > 0) {
        await setCachedTokens(cacheKey, tokens, config.cacheTTL);
      }
    }

    // Sort tokens
    const sorted = sortTokens(tokens, sortBy as any);
    
    // Paginate
    const result = paginate(sorted, parseInt(limit as string), cursor as string);

    res.json(result);
  } catch (error) {
    console.error('GET /tokens error:', error);
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
});

router.get('/tokens/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    const cacheKey = `token:${address}`;
    let token = await getCachedTokens(cacheKey);
    
    if (!token || token.length === 0) {
      // Fetch all tokens and find the one
      const tokens = await aggregateTokenData('SOL');
      const found = tokens.find(t => t.token_address === address);
      
      if (!found) {
        return res.status(404).json({ error: 'Token not found' });
      }
      
      await setCachedTokens(cacheKey, [found], config.cacheTTL);
      return res.json(found);
    }

    res.json(token[0]);
  } catch (error) {
    console.error('GET /tokens/:address error:', error);
    res.status(500).json({ error: 'Failed to fetch token' });
  }
});

router.get('/health', async (req: Request, res: Response) => {
  try {
    const redisConnected = await checkRedisConnection();
    
    res.json({
      status: 'ok',
      cache: redisConnected ? 'connected' : 'disconnected',
      apis: {
        dexscreener: 'available',
        jupiter: 'available',
        geckoterminal: 'available',
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Health check failed' });
  }
});

export default router;
