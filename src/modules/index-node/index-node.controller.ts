import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { IndexNodeService } from './index-node.service';

@Controller('inode')
export class IndexNodeController {
  constructor(private readonly indexNodeService: IndexNodeService) {}

  @Post('directory')
  createDirectory(@Req() request, @Body() createINodeDto: any) {
    const ownerId = request.user?.userId;
    return this.indexNodeService.createDirectory(ownerId, createINodeDto);
  }

  @Patch('directory/:id')
  updateDirectory(
    @Req() request,
    @Param('id') id: string,
    @Body() updateINodeDto: any,
  ) {
    const operatorId = request.user?.userId;
    return this.indexNodeService.updateDirectory(
      operatorId,
      id,
      updateINodeDto,
    );
  }

  @Get()
  findAll() {
    return this.indexNodeService.findAll();
  }

  @Get('node-path-in-tree')
  getNodePathInTreeByNodeId(@Query('id') id: string) {
    return this.indexNodeService.getNodePathInTreeByNodeId(id);
  }

  @Post('acl')
  setFileAcl(@Req() request, @Body() aclData: any) {
    return this.indexNodeService.setFileAcl(request.user?.userId, aclData);
  }

  @Get('acl')
  getUserNodesSharedByOtherUsers(@Req() request, @Query() params) {
    return this.indexNodeService.getUserNodesSharedByOtherUsers(
      request.user?.userId,
      params,
    );
  }

  @Get(':id')
  async findUnique(@Req() request, @Param('id') id: string) {
    const hasPermission = await this.indexNodeService.checkUserHasAccessToNode({
      userId: request?.user?.userId,
      iNodeId: id,
    });
    if (!hasPermission) {
      throw new ForbiddenException();
    }
    return this.indexNodeService.findUnique(id);
  }

  @Patch(':id')
  async update(
    @Req() request,
    @Param('id') id: string,
    @Body() updateIndexNodeDto: any,
  ) {
    const hasPermission = await this.indexNodeService.checkUserHasAccessToNode({
      userId: request?.user?.userId,
      itemId: id,
    });
    if (!hasPermission) {
      throw new ForbiddenException();
    }
    return this.indexNodeService.update(id, updateIndexNodeDto);
  }

  @Delete(':id')
  remove(@Req() request, @Param('id') id: string) {
    return this.indexNodeService.remove(id);
  }
}
