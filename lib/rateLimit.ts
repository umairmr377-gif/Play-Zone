import { NextRequest } from "next/server";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (for serverless, consider Redis/Upstash)
const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, 5 * 60 * 1000);
}

/**
 * Simple in-memory rate limiter
 * For production, use Redis/Upstash for distributed rate limiting
 */
export class RateLimiter {
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = options;
  }

  /**
   * Check if request should be rate limited
   * Returns { allowed: boolean, remaining: number, resetTime: number }
   */
  check(req: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const key = this.options.keyGenerator
      ? this.options.keyGenerator(req)
      : this.getDefaultKey(req);

    const now = Date.now();
    const windowMs = this.options.windowMs;
    const max = this.options.max;

    // Get or create entry
    let entry = store[key];

    if (!entry || entry.resetTime < now) {
      // Create new window
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      store[key] = entry;
    }

    // Increment count
    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    const allowed = entry.count <= max;
    const retryAfter = allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000);

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  /**
   * Get default key from request (IP address)
   */
  private getDefaultKey(req: NextRequest): string {
    // Try to get IP from various headers
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || "unknown";

    return `rate-limit:${ip}`;
  }
}

/**
 * Rate limiters for different endpoints
 */
export const bookingRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  keyGenerator: (req) => {
    // Use IP address for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || "unknown";
    return `booking:${ip}`;
  },
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  keyGenerator: (req) => {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || "unknown";
    return `auth:${ip}`;
  },
});

/**
 * User-based rate limiter (requires user ID)
 */
export function getUserRateLimiter(userId: string) {
  return new RateLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 50, // 50 bookings per day per user
    keyGenerator: () => `user:${userId}`,
  });
}

/**
 * Redis-based rate limiter (for production)
 * Uncomment and configure if using Redis/Upstash
 */
/*
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RedisRateLimiter {
  async check(key: string, windowMs: number, max: number) {
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = `rate-limit:${key}:${window}`;
    
    const count = await redis.incr(redisKey);
    await redis.expire(redisKey, Math.ceil(windowMs / 1000));
    
    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      resetTime: (window + 1) * windowMs,
    };
  }
}
*/

