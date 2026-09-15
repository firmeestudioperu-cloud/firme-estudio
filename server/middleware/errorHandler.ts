import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  // If response has already started streaming, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const isDev = process.env.NODE_ENV !== 'production';

  // Handle invalid JSON body syntax errors from express.json()
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'Formato JSON inválido en el cuerpo de la solicitud',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const statusCode = Number.isInteger(err.status) ? err.status : Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const errorMessage = err.message || 'Error interno del servidor';

  if (statusCode >= 500) {
    console.error(`[API Error 500] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(`[API Warning ${statusCode}] ${req.method} ${req.originalUrl}: ${errorMessage}`);
  }

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString(),
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  });
}
