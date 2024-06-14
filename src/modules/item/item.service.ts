import { Injectable } from '@nestjs/common';

import { publishResources } from 'src/utils/publish';
import { INodeService } from '../i-node/i-node.service';
import * as iNodeRepository from '../i-node/i-node.repository';
import { throwHttpException } from '@/utils/throwHttpException';
import { findWithPagination, getDB } from '@/helpers/mongo';
import { convertToNumber } from '@/utils';

@Injectable()
export class ItemService {
  constructor(private readonly iNodeService: INodeService) {}

  async createItem(itemDto: any, ownerId) {
    const result = await iNodeRepository.createItem(itemDto, ownerId);
    return iNodeRepository.findOneById(result.insertedId);
  }

  async updateItemInfo(iNodeId, createProjectDto: any = {}, operatorId) {
    const updateResult = await iNodeRepository.updateItemInfo(
      iNodeId,
      createProjectDto,
    );
    if (updateResult?.acknowledged) {
      return iNodeRepository.findOneById(iNodeId);
    }
    return null;
  }

  async createProjectByCopyProject(
    ownerId,
    copyFromNodeId,
    createProjectDto: any = {},
  ) {
    const node = await this.iNodeService.findUnique(copyFromNodeId);
    if (!node) {
      return throwHttpException('您要复制的项目不存在');
    }
    const record: any = node.item.records[0] || {};
    return iNodeRepository.createItem(ownerId, createProjectDto);
  }

  async createProjectFromTemplate(
    ownerId,
    templateNodeId,
    createProjectDto: any = {},
  ) {
    return iNodeRepository.createProjectFromTemplate(ownerId, {
      ...createProjectDto,
      typeData: {
        templateNodeId: templateNodeId,
      },
    });
  }

  async upsertTemplate(ownerId, createINodeDto) {
    return iNodeRepository.upsertTemplate(ownerId, createINodeDto);
  }

  async isCanAddTemplate(ownerId, createINodeDto) {
    return iNodeRepository.isTemplateVersionHasExisted(ownerId, createINodeDto);
  }

  async findAll(payload: any = {}) {
    const { ownerId, parentId } = payload;
    const condition: any = {};
    return findWithPagination(getDB().collection('item'), condition, {
      page: convertToNumber(payload.page),
      pageSize: convertToNumber(payload.pageSize),
    });
  }

  async findUserAllFolderAndItem(ownerId, payload: any = {}) {
    return this.iNodeService.findUserAllFolderAndItem(ownerId, payload);
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
      .updateOne(
        { id: itemId },
        {
          $set: {
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
        },
      );
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
