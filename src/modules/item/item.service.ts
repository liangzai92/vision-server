import { Injectable } from '@nestjs/common';
import { publishResources } from '@/utils/publish';
import { findWithPagination, getDB } from '@/helpers/mongo';
import { convertToNumber } from '@/utils';
import { INodeService } from '../i-node/i-node.service';
import * as iNodeRepository from '../i-node/i-node.repository';

@Injectable()
export class ItemService {
  constructor(private readonly iNodeService: INodeService) {}

  async createItem({ name, description }: any, { ownerId }) {
    const result = await iNodeRepository.createItem({
      ownerId: ownerId,
      name: name,
      description: description,
    });
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
    // const node = await this.iNodeService.findOneById(copyFromNodeId);
    // if (!node) {
    //   return throwServiceException(2323,'您要复制的项目不存在');
    // }
    // const record: any = node.item.records[0] || {};
    // return iNodeRepository.createItem(ownerId, createProjectDto);
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

  async findOneById(id: string) {
    return iNodeRepository.findOneById(id);
  }

  async remove(itemId: string) {
    const res = await getDB()
      .collection('item')
      .delete({
        where: { id: itemId },
      });
    return res;
  }

  async updateItem(id: string, { schema, screenshot }: any, { operatorId }) {
    const now = new Date();
    const nextVersion = now.getTime() + '';
    const update = {
      $set: {
        'item.updatedAt': now,
        'item.version': nextVersion,
        'item.schema': schema,
      },
    };
    const updateResult = await iNodeRepository.updateINodeById(id, update);
    if (updateResult?.acknowledged) {
      return iNodeRepository.findOneById(id);
    }
    return null;
  }

  async publishItem(id: string, { schema, screenshot }: any, { operatorId }) {
    const res = await publishResources(id, { schema, screenshot });
    // console.log('publishResources', res);
    const now = new Date();
    const nextVersion = now.getTime() + '';
    const record = {
      updatedAt: now,
      version: nextVersion,
      schema: schema,
    };
    const update = {
      $set: {
        'item.updatedAt': now,
        'item.published': true,
        'item.cover': screenshot,
        'item.version': nextVersion,
        'item.schema': schema,
      },
      $push: {
        records: {
          $each: [record],
          $position: 0,
        },
      },
    };
    const updateResult = await iNodeRepository.updateINodeById(id, update);
    if (updateResult?.acknowledged) {
      return iNodeRepository.findOneById(id);
    }
    return null;
  }
}
