import { Module } from '@nestjs/common';
import { INodeService } from './i-node.service';
import { INodeController } from './i-node.controller';

import { UserService } from '../user/user.service';
import { ItemService } from '../item/item.service';

@Module({
  controllers: [INodeController],
  providers: [INodeService, UserService, ItemService],
})
export class INodeModule {}
