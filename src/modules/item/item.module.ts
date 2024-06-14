import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { INodeService } from '../i-node/i-node.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [ItemController],
  providers: [ItemService, INodeService, UserService],
})
export class ItemModule {}
