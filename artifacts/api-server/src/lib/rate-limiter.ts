import rateLimit from "express-rate-limit";

/**
 * Rate limiter for authentication endpoints.
 * Allows 5 requests per IP per minute (per D-05).
 * Returns 429 with a meaningful error and Retry-After header on breach.
 * In-memory store — acceptable for single-instance Replit deployment (per D-06).
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1-minute rolling window
  max: 5,              // 5 attempts per window per IP
  standardHeaders: "draft-7", // Adds RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset headers
  legacyHeaders: false,       // Disable X-RateLimit-* headers
  handler: (_req, res) => {
    res.status(429).json({
      error: "too_many_requests",
      message: "Too many attempts. Please wait 1 minute before trying again.",
    });
  },
});
