import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { IndexNodeService } from './index-node.service';

@Injectable()
export class NodePermissionGuard implements CanActivate {
  constructor(
    private readonly payload,
    private indexNodeService: IndexNodeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request?.user?.userId;
    const iNodeId = this.payload.iNodeId;
    const itemId = this.payload.itemId;
    return this.indexNodeService.checkUserHasAccessToNode({
      userId,
      iNodeId,
      itemId,
    });
  }
}
