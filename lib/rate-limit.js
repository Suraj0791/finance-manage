import { db } from "@/lib/prisma";

/**
 * Custom Postgres-backed rate limiter.
 * @param {string} ip - Client IP address
 * @param {string} route - The route or action being rate limited
 * @param {number} limit - Maximum allowed requests in the window
 * @param {number} windowMs - Time window in milliseconds (default: 1 minute)
 * @returns {Promise<{success: boolean, limit: number, remaining: number}>}
 */
export async function rateLimit(ip, route, limit = 10, windowMs = 60000) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  try {
    // 1. Prune expired entries to keep the table clean (self-cleaning)
    await db.rateLimit.deleteMany({
      where: {
        timestamp: {
          lt: windowStart,
        },
      },
    });

    // 2. Count active requests in the current window
    const requestCount = await db.rateLimit.count({
      where: {
        ip,
        route,
        timestamp: {
          gte: windowStart,
        },
      },
    });

    if (requestCount >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
      };
    }

    // 3. Log this request
    await db.rateLimit.create({
      data: {
        ip,
        route,
        timestamp: now,
      },
    });

    return {
      success: true,
      limit,
      remaining: limit - requestCount - 1,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open in case of DB connection issues to avoid blocking real users
    return {
      success: true,
      limit,
      remaining: 1,
    };
  }
}
