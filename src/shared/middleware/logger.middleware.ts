import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  public logger = new Logger(LoggerMiddleware.name);
  use(req: Request, res: Response, next: NextFunction) {
    const start = new Date().getTime();
    this.logger.log(`${req.method} ${req.originalUrl} - Start`);
    res.on('finish', () => {
      const end = new Date().getTime();
      const duration = end - start;
      this.logger.log(
        `${req.method} ${req.originalUrl} - End - Duration: ${duration}ms`,
      );
    });
    next();
  }
}
