import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { INodeService } from './i-node.service';

@Injectable()
export class NodePermissionGuard implements CanActivate {
  constructor(
    private readonly payload,
    private iNodeService: INodeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request?.user?.userId;

    const iNodeId = this.payload.iNodeId;
    const itemId = this.payload.itemId;

    return this.iNodeService.checkUserHasAccessToNode({
      userId,
      iNodeId,
      itemId,
    });
  }
}
