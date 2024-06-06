import { Module } from '@nestjs/common';
import { IndexNodeService } from './index-node.service';
import { IndexNodeController } from './index-node.controller';

import { UserService } from '../user/user.service';
import { ItemService } from '../item/item.service';

@Module({
  controllers: [IndexNodeController],
  providers: [IndexNodeService, UserService, ItemService],
})
export class IndexNodeModule { }
