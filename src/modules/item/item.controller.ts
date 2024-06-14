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
} from '@nestjs/common';
import { ItemService } from './item.service';
import { convertToNumber } from '@/utils';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post('copy')
  createProjectByCopyProject(
    @Req() request,
    @Body('copyFromProjectId') copyFromProjectId: string,
    @Body() createINodeDto: any,
  ) {
    const ownerId = request.user?.userId;
    return this.itemService.createProjectByCopyProject(
      ownerId,
      copyFromProjectId,
      createINodeDto,
    );
  }

  @Post('fromTemplate')
  createProjectFromTemplate(
    @Req() request,
    @Body('templateNodeId') templateNodeId: string,
    @Body() createINodeDto: any,
  ) {
    const ownerId = request.user?.userId;
    return this.itemService.createProjectFromTemplate(
      ownerId,
      templateNodeId,
      createINodeDto,
    );
  }

  @Post('template')
  upsertTemplate(@Req() request, @Body() createINodeDto: any) {
    const ownerId = request.user?.userId;
    return this.itemService.upsertTemplate(ownerId, createINodeDto);
  }

  @Post('isCanAddTemplate')
  isCanAddTemplate(@Req() request, @Body() createINodeDto: any) {
    const ownerId = request.user?.userId;
    return this.itemService.isCanAddTemplate(ownerId, createINodeDto);
  }

  @Get()
  findUserAllFolderAndItem(
    @Req() request,
    @Query('parentId') parentId,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('isTemplate') isTemplate: string = '',
  ) {
    const ownerId = request.user?.userId;
    return this.itemService.findUserAllFolderAndItem(ownerId, {
      parentId: parentId,
      page: convertToNumber(page),
      pageSize: convertToNumber(pageSize),
      isTemplate: isTemplate === 'true' ? true : false,
    });
  }

  @Get(':id')
  findUnique(@Param('id') id: string) {
    return this.itemService.findUnique(id);
  }

  @Patch(':id')
  update(
    @Req() request,
    @Param('id') id: string,
    @Query('action') action,
    @Body() updateProjectDto: any,
  ) {
    if (action === 'publish') {
      return this.itemService.publish(
        request.user?.userId,
        id,
        updateProjectDto,
      );
    }
    return this.itemService.update(request.user?.userId, id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }

  @Post('project')
  async createPage(@Req() request, @Body() pageDto: any) {
    const ownerId = request.user?.userId;
    return this.itemService.createItem(pageDto, ownerId);
  }

  @Patch('project/:id')
  updateItemInfo(
    @Req() request,
    @Param('id') id: string,
    @Body() updateProjectDto: any,
  ) {
    const operatorId = request.user?.userId;
    return this.itemService.updateItemInfo(id, updateProjectDto, operatorId);
  }
}
