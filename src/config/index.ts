import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  cacheTTL: parseInt(process.env.CACHE_TTL || '30', 10),
  updateInterval: parseInt(process.env.UPDATE_INTERVAL || '10000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
