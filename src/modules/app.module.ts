import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { INodeModule } from './i-node/i-node.module';
import { ItemModule } from './item/item.module';

import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';

import { ConfigModule } from '@nestjs/config';
import { dotenvFiles } from '../script/dotenv';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: [...dotenvFiles],
    }),
    UserModule,
    AuthModule,
    INodeModule,
    ItemModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
