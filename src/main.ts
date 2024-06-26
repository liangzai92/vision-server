import './script/dotenv';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import loggerMiddleware from './shared/express/loggerMiddleware';
import { ErrorFilter } from './shared/filters/error.filter';
import { ServiceExceptionFilter } from './shared/filters/service-exception.filter';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { AppModule } from './modules/app.module';
import './test'; // todo just for test can be removed

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.use(loggerMiddleware);
  app.use(cookieParser());
  app.useStaticAssets(path.join(__dirname, '..', '.public'));
  app.useStaticAssets(path.join(__dirname, '..', 'public'));
  app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalFilters(new ErrorFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ServiceExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.setGlobalPrefix('api');
  await app.listen(configService.get('PORT'));
}
bootstrap();
