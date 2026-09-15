import { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware
 * Protects against MIME-sniffing, Clickjacking, and common web vulnerabilities
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking by restricting framing to same-origin
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Enable XSS filter in legacy browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information sent in headers
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features and APIs
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Remove fingerprinting headers
  res.removeHeader('X-Powered-By');

  next();
}

/**
 * CORS middleware
 * Controls cross-origin access safely with sensible development defaults
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.APP_ORIGIN,
  ].filter(Boolean) as string[];

  // If origin is in allowed list or during local development
  if (origin) {
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}
