import { Request, Response } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ServiceException } from '@/helpers/exception';

@Catch(ServiceException)
export class ServiceExceptionFilter implements ExceptionFilter {
  catch(exception: ServiceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { code, message, error } = exception.getResponse() as any;
    response.status(HttpStatus.OK).json({
      code: code,
      message: message,
      error: error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
