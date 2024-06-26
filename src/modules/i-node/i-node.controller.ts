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

import { INodeService } from './i-node.service';

@Controller('inode')
export class INodeController {
  constructor(private readonly iNodeService: INodeService) {}

  @Post('directory')
  createDirectory(@Req() request, @Body() createINodeDto: any) {
    const ownerId = request.user?.userId;
    return this.iNodeService.createDirectory(createINodeDto, { ownerId });
  }

  @Patch('directory/:id')
  async updateDirectory(
    @Req() request,
    @Param('id') id: string,
    @Body() updateDirectoryDto: any,
  ) {
    const operatorId = request.user?.userId;
    const res = await this.iNodeService.updateDirectory(
      id,
      updateDirectoryDto,
      operatorId,
    );
    if (!res) {
      throw new Error('Update directory failed');
    }
    return res;
  }

  @Get()
  findAll() {
    return this.iNodeService.findAll();
  }

  @Get('node-path-in-tree')
  getNodePathInTreeByNodeId(@Query('id') id: string) {
    return this.iNodeService.getNodePathInTreeByNodeId(id);
  }

  @Post('acl')
  setFileAcl(@Req() request, @Body() aclData: any) {
    const operatorId = request.user?.userId;
    return this.iNodeService.setFileAcl(aclData, { operatorId });
  }

  @Get('acl')
  getUserNodesSharedByOtherUsers(@Req() request, @Query() params) {
    const operatorId = request.user?.userId;
    return this.iNodeService.getUserNodesSharedByOtherUsers(params, {
      operatorId,
    });
  }

  @Get(':id')
  async findOneById(@Req() request, @Param('id') id: string) {
    const hasPermission = await this.iNodeService.checkUserHasAccessToNode({
      userId: request?.user?.userId,
      iNodeId: id,
    });
    if (!hasPermission) {
      throw new ForbiddenException();
    }
    return this.iNodeService.findOneById(id);
  }

  @Patch(':id')
  async update(
    @Req() request,
    @Param('id') id: string,
    @Body() updateIndexNodeDto: any,
  ) {
    console.log('updateIndexNodeDto', updateIndexNodeDto);
    const operatorId = request.user?.userId;
    const hasPermission = await this.iNodeService.checkUserHasAccessToNode({
      userId: operatorId,
      itemId: id,
    });
    if (!hasPermission) {
      throw new ForbiddenException();
    }
    return this.iNodeService.update(id, updateIndexNodeDto, operatorId);
  }

  @Delete(':id')
  remove(@Req() request, @Param('id') id: string) {
    return this.iNodeService.remove(id);
  }
}
