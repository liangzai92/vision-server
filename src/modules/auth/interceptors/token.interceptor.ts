import type { Response } from 'express';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { setTokenToCookie } from '@/helpers/tokenInContext';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  constructor() {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const { accessToken } = data;
        const response = context.switchToHttp().getResponse<Response>();
        setTokenToCookie(response, accessToken);
        return data;
      }),
    );
  }
}
