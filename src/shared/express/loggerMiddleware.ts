import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';

export default function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = new Date().getTime();
  // logger.http('loggerMiddleware Request Enter', {
  //   method: req.method,
  //   url: req.originalUrl,
  //   ts: start,
  // });
  res.on('finish', () => {
    const end = new Date().getTime();
    const duration = end - start;
    // logger.http('loggerMiddleware Response Finish', {
    //   method: req.method,
    //   url: req.originalUrl,
    //   ts: end,
    //   duration: `${duration}ms`,
    // });
  });
  next();
}
