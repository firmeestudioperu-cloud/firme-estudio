import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { persistence } from '../data/persistence';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = store.getStats();
    const mem = process.memoryUsage();
    const persistTelemetry = persistence.getTelemetry();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'FIRME STUDIO Backend API',
      environment: process.env.NODE_ENV || 'development',
      version: '1.1.0',
      uptimeSeconds: Math.floor(process.uptime()),
      system: {
        nodeVersion: process.version,
        rssMemoryMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      },
      persistence: persistTelemetry,
      studio: {
        name: 'FIRME STUDIO — Pilates Reformer & Boutique',
        location: 'Jr. Akapana 1261, San Juan de Lurigancho (Lima - SJL), Perú',
        capacityPerClass: 8,
        bedType: 'Allegro 2 Balanced Body',
      },
      metrics: stats,
    });
  })
);

export default router;
