import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

const sanitize = (obj: any): any => {
  if (!obj) return obj;
  const sanitized = { ...obj };
  const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, path, query, headers, body } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method,
      path,
      statusCode: res.statusCode,
      durationMs: duration,
      query: sanitize(query),
      body: sanitize(body),
      headers: {
        ...sanitize(headers),
        host: headers.host,
        'user-agent': headers['user-agent']
      }
    };
    logger.info('Request completed', logData);
  });

  next();
};
