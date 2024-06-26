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

  @Post()
  async createItem(@Req() request, @Body() itemDto: any) {
    const ownerId = request.user?.userId;
    console.log('createItem', itemDto);
    return this.itemService.createItem(itemDto, { ownerId });
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.itemService.findOneById(id);
  }

  @Patch(':id')
  updateItem(
    @Req() request,
    @Param('id') id: string,
    @Query('action') action,
    @Body() updateProjectDto: any,
  ) {
    const operatorId = request.user?.userId;
    if (action === 'publish') {
      return this.itemService.publishItem(id, updateProjectDto, {
        operatorId,
      });
    }
    return this.itemService.updateItem(id, updateProjectDto, {
      operatorId,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
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
