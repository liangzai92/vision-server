import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { IndexNodeService } from '../index-node/index-node.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [ItemController],
  providers: [ItemService, IndexNodeService, UserService],
})
export class ItemModule {}
