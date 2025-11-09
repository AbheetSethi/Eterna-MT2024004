import Redis from 'ioredis';
import { config } from '../config';
import { TokenData } from '../types';

let redis: Redis | null = null;

export function initRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redis.on('error', (err) => {
      console.error('Redis error:', err);
    });

    redis.on('connect', () => {
      console.log('Redis connected');
    });
  }
  return redis;
}

export async function getCachedTokens(key: string): Promise<TokenData[] | null> {
  try {
    const redis = initRedis();
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCachedTokens(
  key: string,
  data: TokenData[],
  ttl: number = config.cacheTTL
): Promise<void> {
  try {
    const redis = initRedis();
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const redis = initRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

export async function checkRedisConnection(): Promise<boolean> {
  try {
    const redis = initRedis();
    await redis.ping();
    return true;
  } catch (error) {
    return false;
  }
}
