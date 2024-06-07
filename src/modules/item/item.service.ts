import { Injectable } from '@nestjs/common';

import { publishResources } from 'src/utils/publish';
import { IndexNodeService } from '../index-node/index-node.service';
import * as indexNodeRepository from '../index-node/index-node.repository';
import { throwHttpException } from '@/utils/throwHttpException';
import { getDB } from '@/helpers/mongo';

@Injectable()
export class ItemService {
  constructor(private readonly indexNodeService: IndexNodeService) {}

  async createProject(ownerId, createProjectDto: any, recordData?: any) {
    return indexNodeRepository.createProject(
      ownerId,
      createProjectDto,
      recordData,
    );
  }

  async updateProject(operatorId, iNodeId, createProjectDto: any = {}) {
    return indexNodeRepository.updateProject(iNodeId, createProjectDto);
  }

  async createProjectByCopyProject(
    ownerId,
    copyFromNodeId,
    createProjectDto: any = {},
  ) {
    const node = await this.indexNodeService.findUnique(copyFromNodeId);
    if (!node) {
      return throwHttpException('您要复制的项目不存在');
    }
    const record: any = node.item.records[0] || {};
    return indexNodeRepository.createProject(
      ownerId,
      createProjectDto,
      record.data,
    );
  }

  async createProjectFromTemplate(
    ownerId,
    templateNodeId,
    createProjectDto: any = {},
  ) {
    return indexNodeRepository.createProjectFromTemplate(
      ownerId,
      {
        ...createProjectDto,
        typeData: {
          templateNodeId: templateNodeId,
        },
      },
      {},
    );
  }

  async upsertTemplate(ownerId, createINodeDto) {
    return indexNodeRepository.upsertTemplate(ownerId, createINodeDto);
  }

  async isCanAddTemplate(ownerId, createINodeDto) {
    return indexNodeRepository.isTemplateVersionHasExisted(
      ownerId,
      createINodeDto,
    );
  }

  async findAll(payload: any = {}) {
    const { ownerId, parentId, page, pageSize } = payload;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const totalCount = await getDB().collection('item').count();
    const totalPages = Math.ceil(totalCount / pageSize);
    const data = await getDB().collection('item').findMany({
      skip,
      take,
    });

    const hasMore = page < totalPages;
    return {
      hasMore,
      list: data,
      pageSize,
      page,
      nextPage: page + 1,
      totalCount,
      totalPages,
    };
  }

  async findUserAllFolderAndItem(ownerId, payload: any = {}) {
    return this.indexNodeService.findUserAllFolderAndItem(ownerId, payload);
  }

  async findUnique(itemId: string) {
    return getDB()
      .collection('item')
      .findUnique({
        where: { id: itemId },
        include: {
          records: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
  }

  async remove(itemId: string) {
    const res = await getDB()
      .collection('item')
      .delete({
        where: { id: itemId },
      });
    return res;
  }

  async update(userId, itemId: string, updateProjectDto: any) {
    const nextVersion = new Date().getTime() + '';
    const cover = updateProjectDto?.screenshot;
    const published = updateProjectDto?.published;
    return getDB()
      .collection('item')
      .update({
        where: { id: itemId },
        data: {
          published,
          version: nextVersion,
          cover,
          records: {
            create: [
              {
                version: nextVersion,
                data: updateProjectDto,
              },
            ],
          },
        },
        include: {
          records: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
  }

  async publish(userId, itemId: string, updateProjectDto: any) {
    const res = await publishResources(itemId, updateProjectDto);
    console.log('publishResources', res);
    await this.update(userId, itemId, {
      ...updateProjectDto,
      published: true,
      screenshot: res.screenshot?.fullFileUrl,
    });
    return res;
  }
}
