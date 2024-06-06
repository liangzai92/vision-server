import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { IndexNodeModule } from './index-node/index-node.module';
import { ItemModule } from './item/item.module';

import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/auth.grard';
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
    IndexNodeModule,
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
