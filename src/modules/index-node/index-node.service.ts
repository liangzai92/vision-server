import { Injectable } from '@nestjs/common';

import * as indexNodeRepository from './index-node.repository';

import { throwHttpException } from 'src/utils/throwHttpException';
import { convertToNumber } from '@/utils';
import { UserService } from '../user/user.service';
import { ItemTypes } from '@/constants';
import { getDB } from '@/helpers/mongo';

@Injectable()
export class IndexNodeService {
  constructor(private readonly userService: UserService) {}

  async createDirectory(ownerId, createINodeDto) {
    return indexNodeRepository.createDirectory(ownerId, createINodeDto);
  }

  async updateDirectory(operatorId, iNodeId, updateDirectoryDto: any = {}) {
    return indexNodeRepository.updateDirectory(iNodeId, updateDirectoryDto);
  }

  findAll() {
    return `This action returns all indexNode`;
  }

  async findUnique(id: string) {
    return indexNodeRepository.findUnique(id);
  }

  update(id: string, updateIndexNodeDto: any) {
    return `This action updates a #${id} indexNode`;
  }

  remove(id: string) {
    return indexNodeRepository.remove(id);
  }

  async findUserAllFolderAndItem(ownerId, payload: any = {}) {
    const page = convertToNumber(payload.page) || 1;
    const pageSize = convertToNumber(payload.pageSize) || 10;
    const { parentId, isTemplate } = payload;

    const itemTypes = isTemplate
      ? [ItemTypes.TEMPLATE]
      : [ItemTypes.PROJECT, ItemTypes.PROJECT_CREATED_FROM_TEMPLATE];

    const skip = (page - 1) * pageSize;
    const take = pageSize;
    let condition: any = {
      AND: [
        {
          ownerId: ownerId,
        },
        {
          OR: [
            {
              type: {
                in: ['d'],
              },
            },
            {
              AND: [
                { type: '-' },
                {
                  item: {
                    type: {
                      in: itemTypes,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    if (isTemplate) {
      condition = {
        AND: [
          {
            ownerId: ownerId,
          },
          {
            OR: [
              {
                AND: [
                  { type: '-' },
                  {
                    item: {
                      type: {
                        in: itemTypes,
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
    }
    if (!parentId) {
      condition.AND.push({
        OR: [
          {
            parentId: null,
          },
          {
            parentId: {
              isSet: false,
            },
          },
        ],
      });
    } else {
      condition.AND.push({
        parentId: parentId,
      });
    }
    const totalCount = await getDB().collection('indexNode').count({
      where: condition,
    });
    const totalPages = Math.ceil(totalCount / pageSize);
    const data = await getDB()
      .collection('indexNode')
      .findMany({
        where: condition,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          item: true,
          _count: {
            select: { acls: true },
          },
        },
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

  async getNodePathInTreeByNodeId(id: string) {
    const res = await indexNodeRepository.getNodeParentNodeList(id);
    console.log('allParentNodeList', res);
    return res;
  }

  async setFileAcl(operatorId, aclData: any) {
    const { iNodeId, workcode } = aclData;
    console.log('用户', operatorId, '把', iNodeId, '分享给', workcode);
    const node = await this.findUnique(iNodeId);
    if (!node) {
      return throwHttpException('您要分享的项目不存在');
    }
    if (node.ownerId !== operatorId) {
      throw new Error(
        'You do not have permission to set access for this file.',
      );
    }
    let toUser: any = null;
    if (workcode) {
      toUser = await this.userService.findUserByXDFStaffInfo({
        workcode,
      });
      if (!toUser) {
        const result: any = await this.userService.createUserWithXDFStaff({
          workcode,
        });
        console.log('新添加一个知音楼用户', result);
        toUser = result.userProfile;
      }
    }
    console.log('分享给用户：', toUser);
    if (!toUser) {
      return throwHttpException('没有这个用户啊');
    }
    if (node.ownerId === toUser.userId) {
      return throwHttpException('您是项目的主人，无需再分享给自己');
    }
    const permissions = 'rwx';
    return getDB()
      .collection('acl')
      .upsert({
        where: {
          indexNodeId_userId: {
            indexNodeId: iNodeId,
            userId: toUser.userId,
          },
        },
        create: { indexNodeId: iNodeId, userId: toUser.userId, permissions },
        update: { permissions },
      });
  }

  async getUserNodesSharedByOtherUsers(userId, payload: any = {}) {
    if (!payload.parentId) {
      return this.getTopLevelUserNodesSharedByOtherUsers(userId, payload);
    } else {
      return this.getNonTopLevelUserNodesSharedByOtherUsers(
        userId,
        payload.parentId,
        payload,
      );
    }
  }

  async getTopLevelUserNodesSharedByOtherUsers(userId, payload: any = {}) {
    const page = convertToNumber(payload.page) || 1;
    const pageSize = convertToNumber(payload.pageSize) || 10;

    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const condition = {
      userId: userId,
      permissions: {
        contains: 'r',
      },
    };
    const totalCount = await getDB().collection('acl').count({
      where: condition,
    });
    const totalPages = Math.ceil(totalCount / pageSize);
    const data = await getDB()
      .collection('acl')
      .findMany({
        where: condition,
        include: {
          indexNode: {
            include: {
              item: true,
              acls: true,
              _count: {
                select: { acls: true },
              },
            },
          },
        },
        skip,
        take,
        orderBy: {
          updatedAt: 'desc',
        },
      });

    const list = data.map((item) => {
      return item.indexNode;
    });

    const hasMore = page < totalPages;
    return {
      hasMore,
      list,
      pageSize,
      page,
      nextPage: page + 1,
      totalCount,
      totalPages,
    };
  }

  async getNonTopLevelUserNodesSharedByOtherUsers(
    userId,
    parentId,
    payload: any = {},
  ) {
    const acl = await indexNodeRepository.getSharedNodeAccessControlForUser(
      parentId,
      userId,
    );
    if (!acl || !acl.permissions?.includes('r')) {
      return throwHttpException(
        'You do not have permission to access this directory.',
      );
    }

    const page = convertToNumber(payload.page) || 1;
    const pageSize = convertToNumber(payload.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const condition = {
      parentId: parentId,
      OR: [
        {
          acls: {
            none: {
              userId: userId,
            },
          },
        },
        {
          acls: {
            some: {
              userId: userId,
              permissions: {
                contains: 'r',
              },
            },
          },
        },
      ],
    };
    const totalCount = await getDB().collection('indexNode').count({
      where: condition,
    });
    const totalPages = Math.ceil(totalCount / pageSize);
    const data = await getDB()
      .collection('indexNode')
      .findMany({
        where: condition,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          item: true,
          _count: {
            select: { acls: true },
          },
        },
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

  async checkUserHasAccessToNode({ iNodeId, itemId, userId }: any) {
    if (iNodeId) {
      return indexNodeRepository.checkUserHasAccessToNode(iNodeId, userId);
    } else if (itemId) {
      const node = await getDB()
        .collection('item')
        .findUnique({
          where: {
            id: itemId,
          },
        });
      return indexNodeRepository.checkUserHasAccessToNode(
        node.indexNodeId,
        userId,
      );
    }
  }
}
