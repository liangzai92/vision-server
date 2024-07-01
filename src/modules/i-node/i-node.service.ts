import { Injectable } from '@nestjs/common';
import { convertToNumber } from '@/utils';
import { throwServiceException, ServiceStatus } from '@/helpers/exception';
import { convertToObjectId, findWithPagination, getDB } from '@/helpers/mongo';
import { ItemTypes } from '@/constants';
import { UserService } from '../user/user.service';
import * as iNodeRepository from './i-node.repository';

@Injectable()
export class INodeService {
  constructor(private readonly userService: UserService) {}

  async createDirectory(createINodeDto, { ownerId }) {
    const result = await iNodeRepository.createDirectory({
      ...createINodeDto,
      ownerId: ownerId,
    });
    return iNodeRepository.findOne({
      _id: result.insertedId,
    });
  }

  async updateDirectory(iNodeId, updateDirectoryDto: any = {}, operatorId) {
    const updateResult = await iNodeRepository.updateDirectory(
      iNodeId,
      updateDirectoryDto,
    );
    if (updateResult?.acknowledged) {
      return iNodeRepository.findOneById(iNodeId);
    }
    return false;
  }

  findAll() {
    return `This action returns all iNode`;
  }

  async update(iNodeId, updateIndexNodeDto: any = {}, operatorId) {
    const result = await iNodeRepository.updateDirectory(
      iNodeId,
      updateIndexNodeDto,
    );
    console.log('updateDirectory result', result);
    return iNodeRepository.findOne({
      _id: result.insertedId,
    });
  }

  async remove(id: string) {
    return iNodeRepository.remove(id);
  }

  async findUserAllFolderAndItem(ownerId, payload: any = {}) {
    const { parentId, isTemplate } = payload;
    const itemTypes = isTemplate
      ? [ItemTypes.TEMPLATE]
      : [ItemTypes.PROJECT, ItemTypes.PROJECT_CREATED_FROM_TEMPLATE];

    let condition: any = {
      $and: [
        {
          ownerId: ownerId,
        },
        {
          $or: [
            {
              type: {
                $in: ['d'],
              },
            },
            {
              $and: [
                { type: '-' },
                {
                  'item.type': {
                    $in: itemTypes,
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
        $and: [
          {
            ownerId: ownerId,
          },
          {
            $or: [
              {
                $and: [
                  { type: '-' },
                  {
                    'item.type': {
                      $in: itemTypes,
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
      condition.$and.push({
        $or: [
          {
            parentId: null,
          },
          {
            parentId: {
              $exists: false,
            },
          },
        ],
      });
    } else {
      condition.$and.push({
        parentId: convertToObjectId(parentId),
      });
    }
    return findWithPagination(getDB().collection('iNode'), condition, {
      page: convertToNumber(payload.page),
      pageSize: convertToNumber(payload.pageSize),
    });
  }

  async getNodePathInTreeByNodeId(id: string) {
    const res = await iNodeRepository.getNodeParentNodeList(id);
    console.log('allParentNodeList', res);
    return res;
  }

  findOneById(id: string) {
    return iNodeRepository.findOneById(id);
  }

  async setFileAcl(aclData: any, { operatorId }) {
    const { iNodeId, to } = aclData;
    const toUserId = to.userId;
    console.log(
      '用户：',
      operatorId,
      '把项目',
      iNodeId,
      '分享给用户：',
      toUserId,
    );
    const node = await this.findOneById(iNodeId);
    if (!node) {
      return throwServiceException(ServiceStatus.ItemNotFound);
    }
    if (!node.ownerId.equals(convertToObjectId(operatorId))) {
      return throwServiceException(ServiceStatus.YouDontHaveSharePermission);
    }
    let toUser: any = null;
    if (toUserId) {
      toUser = await this.userService.findUserByUserId(toUserId);
    }
    if (!toUser) {
      return throwServiceException(ServiceStatus.UserNotFound);
    }
    if (node.ownerId.equals(toUser.userId)) {
      return throwServiceException(ServiceStatus.OwnerNoNeedToShare);
    }
    const updateResult = await iNodeRepository.setFileAcl({
      iNodeId,
      toUserId: toUser.userId,
    });
    if (updateResult?.acknowledged) {
      return true;
    }
    return false;
  }

  async getUserNodesSharedByOtherUsers(
    payload: any = {},
    { operatorId: userId },
  ) {
    if (!payload?.parentId) {
      return this.getTopLevelUserNodesSharedByOtherUsers(payload, { userId });
    } else {
      return this.getNonTopLevelUserNodesSharedByOtherUsers(
        userId,
        payload.parentId,
        payload,
      );
    }
  }

  async getTopLevelUserNodesSharedByOtherUsers(payload: any = {}, { userId }) {
    const condition = {
      userId: userId,
      permissions: {
        $regex: '.*r.*',
      },
    };
    return findWithPagination(getDB().collection('acl'), condition, {
      page: convertToNumber(payload.page),
      pageSize: convertToNumber(payload.pageSize),
    });
  }

  async getNonTopLevelUserNodesSharedByOtherUsers(
    userId,
    parentId,
    payload: any = {},
  ) {
    const acl = await iNodeRepository.getSharedNodeAccessControlForUser(
      parentId,
      userId,
    );
    if (!acl || !acl.permissions?.includes('r')) {
      return throwServiceException(ServiceStatus.PermissionDenied);
    }
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
    return findWithPagination(getDB().collection('iNode'), condition, {
      page: convertToNumber(payload.page),
      pageSize: convertToNumber(payload.pageSize),
    });
  }

  async checkUserHasAccessToNode({ iNodeId, itemId, userId }: any) {
    if (iNodeId) {
      return iNodeRepository.checkUserHasAccessToNode(iNodeId, userId);
    } else if (itemId) {
      const node = await getDB().collection('item').findOne({
        _id: itemId,
      });
      return iNodeRepository.checkUserHasAccessToNode(node.iNodeId, userId);
    }
  }
}
