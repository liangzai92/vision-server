import { ItemTypes } from '@/constants';
import { throwHttpException } from '@/utils/throwHttpException';
import { getClient, getDB, convertToObjectId } from '@/helpers/mongo/index';
import { isEmpty } from 'lodash';

export const findOne = (...args) => {
  return getDB()
    .collection('iNode')
    .findOne(...args);
};

export const findOneById = (id) => {
  return getDB()
    .collection('iNode')
    .findOne({
      _id: convertToObjectId(id),
    });
};

export const createDirectory = async (ownerId, createINodeDto: any = {}) => {
  const parentId = createINodeDto.parentId;
  const name = createINodeDto.name;
  const description = createINodeDto.description;

  const doc: any = {
    type: 'd',
    ownerId: convertToObjectId(ownerId),
    item: {
      name: name,
      description: description,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  if (parentId) {
    doc.parentId = convertToObjectId(parentId);
  }

  return getDB().collection('iNode').insertOne(doc);
};

export const updateDirectory = (iNodeId, updateDirectoryDto: any = {}) => {
  const name = updateDirectoryDto.name;
  const description = updateDirectoryDto.description;
  return getDB()
    .collection('iNode')
    .updateOne(
      {
        _id: convertToObjectId(iNodeId),
      },
      {
        $set: {
          'item.name': name,
          'item.description': description,
          updatedAt: new Date(),
        },
      },
    );
};

export const updateItem = async (
  iNodeDto: any = {},
  itemDto: any = {},
  recordData?: any,
) => {
  const ownerId = iNodeDto.ownerId;
  const parentId = iNodeDto.parentId;
  const iNode = {
    type: '-',
    ownerId,
    parentId,
  };

  const name = itemDto.name;
  const description = itemDto.description;
  const templateId = itemDto.templateId;
  const type = itemDto.type;
  const typeData = itemDto.typeData;
  const item: any = {
    name,
    description,
    templateId,
    type,
    typeData,
  };

  const options: any = {
    where: {
      id: itemDto.iNodeId,
    },
    data: {
      ...iNode,
      item: {
        update: {
          ...item,
        },
      },
    },
    include: {
      item: {
        include: {
          records: true,
        },
      },
    },
  };

  if (!isEmpty(recordData)) {
    options.data.item.update.records = {
      create: [
        {
          data: recordData,
        },
      ],
    };
  }
  if (item.type === ItemTypes.TEMPLATE) {
    options.data.item.update.records = {
      create: [
        {
          version: typeData.version,
          data: typeData,
        },
      ],
    };
  }

  return getDB().collection('iNode').update(options);
};

export const createItem = async (itemDto: any = {}, ownerId) => {
  const parentId = itemDto.parentId;
  const doc: any = {
    type: '-',
    item: {
      ...itemDto,
      type: ItemTypes.PROJECT,
    },
    records: [],
    createdAt: new Date(),
  };
  doc.ownerId = convertToObjectId(ownerId);
  if (parentId) {
    doc.parentId = convertToObjectId(parentId);
  }
  console.log('createItem', doc);
  return getDB().collection('iNode').insertOne(doc);
};

export const updateItemInfo = (iNodeId, createProjectDto: any = {}) => {
  return getDB()
    .collection('iNode')
    .updateOne(
      {
        _id: convertToObjectId(iNodeId),
      },
      {
        $set: {
          'item.name': createProjectDto.name,
          'item.description': createProjectDto.description,
          updatedAt: new Date(),
        },
      },
    );
};

export const createProjectFromTemplate = async (
  ownerId,
  createProjectDto: any = {},
) => {
  const parentId = createProjectDto.parentId;
  return getDB()
    .collection('iNode')
    .insertOne({
      ownerId,
      parentId,
      type: '-',
      item: {
        ...createProjectDto,
        type: ItemTypes.PROJECT_CREATED_FROM_TEMPLATE,
      },
      records: [],
    });
};

export const upsertTemplate = async (ownerId, templateDto: any = {}) => {
  console.log('upsertTemplate', templateDto);
  const typeData = templateDto.typeData;
  const templateName = typeData?.name; // 唯一的名字
  const templateVersion = typeData?.version; // 唯一的版本
  if (!templateName) {
    throw new Error('模板名称不能为空');
  }
  const result = await findTemplateNodeByTemplateName(templateName);
  const itemNode: any = result[0];
  console.log('upsertTemplate itemNode', itemNode);
  if (itemNode) {
    const versionRecord = await getDB()
      .collection('itemRecord')
      .findMany({
        where: {
          version: templateVersion,
        },
      });
    if (versionRecord?.length) {
      return throwHttpException('数据库里已经存在该版本了，请修改后重新提交');
    }
    return updateItem(
      { ownerId },
      {
        iNodeId: itemNode?.iNodeId?.$oid,
        ...templateDto,
        type: ItemTypes.TEMPLATE,
        name: templateDto.showName,
        typeData: {
          ...typeData,
        },
      },
      {},
    );
  } else {
    return createItem(
      { ownerId },
      {
        ...templateDto,
        type: ItemTypes.TEMPLATE,
        name: templateDto.showName,
        typeData: {
          ...typeData,
        },
      },
    );
  }
};

export const isTemplateVersionHasExisted = async (
  ownerId,
  templateDto: any = {},
) => {
  console.log('upsertTemplate', templateDto);
  const typeData = templateDto.typeData;
  const templateName = typeData?.name; // 唯一的名字
  const templateVersion = typeData?.version; // 唯一的版本
  if (!templateName) {
    throw new Error('模板名称不能为空');
  }
  const result = await findTemplateNodeByTemplateName(templateName);
  const itemNode: any = result[0];
  console.log('upsertTemplate itemNode', itemNode);
  if (itemNode) {
    const versionRecord = await getDB()
      .collection('itemRecord')
      .findMany({
        where: {
          version: templateVersion,
        },
      });
    if (versionRecord?.length) {
      return {
        isCanAddTemplate: false,
      };
    } else {
      return {
        isCanAddTemplate: true,
      };
    }
  } else {
    return {
      isCanDeleteTemplate: false,
    };
  }
};

export const remove = async (iNodeId: string) => {
  console.log('remove', iNodeId);
  const deleteChildren = getDB()
    .collection('iNode')
    .deleteMany({
      where: {
        parentId: iNodeId,
      },
    });
  const deleteAcl = getDB()
    .collection('acl')
    .deleteMany({
      where: {
        iNodeId: iNodeId,
      },
    });
  const deleteCurrent = getDB()
    .collection('iNode')
    .delete({
      where: { id: iNodeId },
    });

  const session = getClient().startSession();
  session.startTransaction();
  try {
    await Promise.all([deleteChildren, deleteAcl, deleteCurrent]);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const findUnique = async (id: string) => {
  return getDB()
    .collection('iNode')
    .findUnique({
      where: { id },
      include: {
        item: {
          include: {
            records: {
              take: 10,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });
};

export const findTemplateNodeByTemplateName = async (templateName?: string) => {
  console.log('findTemplateNodeByTemplateName', templateName);
  return getDB()
    .collection('item')
    .findRaw({
      filter: {
        'typeData.name': templateName,
      },
    });
};

export const getParentNodeList = async (id: string) => {
  const node = await getDB().collection('iNode').findOne({ _id: id });
  if (!node) {
    return [];
  } else if (node && !node.parentId) {
    return [node];
  }
  const parentNodeList = await getParentNodeList(node.parentId);
  return [...parentNodeList, node];
};

export const getNodeParentNodeList = (id: string) => {
  return getParentNodeList(id);
};

export const getSharedNodeAccessControlForUser = async (
  iNodeId: string,
  userId: string,
) => {
  const acl = await getDB()
    .collection('acl')
    .findUnique({
      where: {
        indexNodeId_userId: {
          iNodeId: iNodeId,
          userId: userId,
        },
      },
    });
  if (acl) {
    return acl;
  } else {
    const node = await getDB()
      .collection('iNode')
      .findUnique({
        where: {
          id: iNodeId,
        },
      });
    if (node.parentId) {
      return getSharedNodeAccessControlForUser(node.parentId, userId);
    } else {
      return acl;
    }
  }
};

export const checkUserHasAccessToNode = async (
  iNodeId: string,
  userId: string,
) => {
  const node = await getDB().collection('iNode').findOne({
    _id: iNodeId,
  });
  if (!node) {
    return false;
  }
  if (node?.item?.type === ItemTypes.TEMPLATE) {
    return true;
  }
  if (node.ownerId === userId) {
    return true;
  } else {
    const acl = await getSharedNodeAccessControlForUser(iNodeId, userId);
    if (!acl || !acl.permissions?.includes('r')) {
      return false;
    }
  }
};
