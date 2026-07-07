// Transparent Redis Caching client with PostgreSQL fallback

import { Redis } from '@upstash/redis';
import RedisClient from 'ioredis';

let upstashRedis: Redis | null = null;
let ioRedis: RedisClient | null = null;

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    if (redisUrl.startsWith('http')) {
      // Upstash HTTP client
      upstashRedis = new Redis({
        url: redisUrl,
        token: process.env.REDIS_TOKEN || '',
      });
      console.log('[Cache] Upstash Redis initialized.');
    } else {
      // Standard Redis TCP client
      ioRedis = new RedisClient(redisUrl);
      console.log('[Cache] ioredis client initialized.');
    }
  } catch (err) {
    console.error('[Cache] Failed to initialize Redis client:', err);
  }
} else {
  console.log('[Cache] REDIS_URL not configured. Falling back to PostgreSQL caching.');
}

const CACHE_VERSION = 'v3';

export const getCachedData = async (key: string): Promise<any | null> => {
  if (!redisUrl) return null;
  const versionedKey = `${CACHE_VERSION}:${key}`;
  try {
    if (upstashRedis) {
      const data = await upstashRedis.get(versionedKey);
      return data;
    } else if (ioRedis) {
      const data = await ioRedis.get(versionedKey);
      return data ? JSON.parse(data) : null;
    }
  } catch (err) {
    console.error('[Cache] Redis get error:', err);
  }
  return null;
};

export const setCachedData = async (key: string, value: any, ttlSeconds = 7 * 24 * 60 * 60): Promise<void> => {
  if (!redisUrl) return;
  const versionedKey = `${CACHE_VERSION}:${key}`;
  try {
    if (upstashRedis) {
      await upstashRedis.set(versionedKey, value, { ex: ttlSeconds });
    } else if (ioRedis) {
      await ioRedis.set(versionedKey, JSON.stringify(value), 'EX', ttlSeconds);
    }
  } catch (err) {
    console.error('[Cache] Redis set error:', err);
  }
};
