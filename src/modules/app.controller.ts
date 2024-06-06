import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

import { proxyZhiYinLouApi } from '@/utils/zhiyinlou';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('zhiyinlou')
  proxyZhiYinLouApi(@Body() body) {
    return proxyZhiYinLouApi(body.method, body.path, body.params);
  }
}
