import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  public logger = new Logger(LoggerMiddleware.name);
  use(req: Request, res: Response, next: NextFunction) {
    // ["body", "query"].map((v) => {
    //   this.logger.log(`${v}:${JSON.stringify(req[v])}`);
    // });
    next();
  }
}
