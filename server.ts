import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';

import healthRouter from './server/routes/health';
import classesRouter from './server/routes/classes';
import bookingsRouter from './server/routes/bookings';
import clientsRouter from './server/routes/clients';
import financeRouter from './server/routes/finance';
import leadsRouter from './server/routes/leads';
import aiRouter from './server/routes/ai';
import whatsappRouter from './server/routes/whatsapp';

import { securityHeaders, corsMiddleware } from './server/middleware/security';
import { globalApiLimiter, bookingLimiter, aiLimiter, whatsappLimiter } from './server/middleware/rateLimiter';
import { errorHandler } from './server/middleware/errorHandler';
import { store } from './server/data/store';
import { persistence } from './server/data/persistence';

dotenv.config();

export async function createServerApp() {
  const app = express();

  // 1. HTTP Security Headers & CORS Policy
  app.use(securityHeaders);
  app.use(corsMiddleware);

  // 2. High-performance Compression (Gzip / Deflate)
  app.use(compression());

  // 3. Body parsers with safe payload caps
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // 4. API Request Logging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toLocaleTimeString('es-PE')}] ${req.method} ${req.path}`);
    }
    next();
  });

  // 5. Global API Rate Limiter
  app.use('/api', globalApiLimiter);

  // 6. API Routes with dedicated endpoint protection
  app.use('/api/health', healthRouter);
  app.use('/api/classes', classesRouter);
  app.use('/api/bookings', bookingLimiter, bookingsRouter);
  app.use('/api/clients', clientsRouter);
  app.use('/api/finance', financeRouter);
  app.use('/api/leads', leadsRouter);
  app.use('/api/ai', aiLimiter, aiRouter);
  app.use('/api/whatsapp', whatsappLimiter, whatsappRouter);

  // 7. Handle unmatched /api routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `Ruta de API no encontrada: ${req.method} ${req.originalUrl}`,
    });
  });

  // 8. Centralized Error Handler for API routes
  app.use('/api', errorHandler);

  return app;
}

async function startServer() {
  const app = await createServerApp();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  // Vite middleware for development vs Static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1y',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ FIRME STUDIO Full-Stack Backend active on port ${PORT}`);
  });

  // Graceful shutdown
  const handleShutdown = (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Saving state snapshot...`);
    persistence.saveImmediate({
      classes: store.getClasses(),
      bookings: store.getBookings(),
      clients: store.getClients(),
      transactions: store.getTransactions(),
      expenses: store.getExpenses(),
      leads: store.getLeads(),
      cashRegister: store.getCashRegister(),
      whatsappLogs: store.getWhatsAppLogs(),
    });
    server.close(() => {
      console.log('[Server] Server closed gracefully.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

// Only auto-start if executed directly (not imported as a module in tests)
const isDirectRun =
  Boolean(process.argv[1]) &&
  (process.argv[1].endsWith('server.ts') ||
    process.argv[1].endsWith('server.cjs') ||
    process.argv[1].endsWith('server.js'));

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  startServer();
}
