import { Request, Response, NextFunction, RequestHandler } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per windowMs
  message?: string;
}

interface ClientRecord {
  timestamps: number[];
}

/**
 * Creates an in-memory sliding window rate limiter
 */
export function createRateLimiter(options: RateLimitOptions): RequestHandler {
  const { windowMs, max, message = 'Demasiadas solicitudes. Por favor intente más tarde.' } = options;
  const hits = new Map<string, ClientRecord>();

  // Periodically cleanup stale entries every 5 minutes to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (validTimestamps.length === 0) {
        hits.delete(key);
      } else {
        record.timestamps = validTimestamps;
      }
    }
  }, 5 * 60 * 1000);

  // Allow Node to exit even if interval is active
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client IP
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-client';

    const now = Date.now();
    let record = hits.get(clientIp);

    if (!record) {
      record = { timestamps: [] };
      hits.set(clientIp, record);
    }

    // Filter out timestamps older than the sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    const currentHits = record.timestamps.length;

    // Headers
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - (currentHits + 1)));

    if (currentHits >= max) {
      const oldestTimestamp = record.timestamps[0] || now;
      const retryAfterSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
      res.setHeader('Retry-After', Math.max(1, retryAfterSeconds));

      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.max(1, retryAfterSeconds),
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}

// Pre-configured rate limiters for FIRME STUDIO
export const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  message: 'Límite de solicitudes excedido en la API de FIRME STUDIO. Intente en unos momentos.',
});

export const bookingLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 40, // 40 booking actions per minute
  message: 'Demasiadas operaciones de reserva concurrentes. Por favor espere un momento.',
});

export const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20, // 20 AI generations/chat per minute to protect quota
  message: 'Has alcanzado el límite de consultas al Asistente Virtual por este minuto.',
});

export const whatsappLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30, // 30 WhatsApp triggers per minute
  message: 'Demasiados envíos de notificaciones solicitados.',
});
