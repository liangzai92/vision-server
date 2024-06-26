import { ItemTypes } from '@/constants';
import { throwServiceException, ServiceStatus } from '@/helpers/exception';
import {
  getDB,
  convertToObjectId,
  withTransaction,
} from '@/helpers/mongo/index';
import { isEmpty } from 'lodash';

/**
 * inode
 */
export const createINode = ({ ownerId, parentId, ...nodeDto }) => {
  const now = new Date();
  const doc: any = {
    type: 'd',
    createdAt: now,
    updatedAt: now,
    records: [],
    ...nodeDto,
  };
  if (parentId) {
    doc.parentId = convertToObjectId(parentId);
  }
  doc.ownerId = convertToObjectId(ownerId);
  console.log('createINode', doc);
  return getDB().collection('iNode').insertOne(doc);
};

export const updateINodeById = (id, { $set, ...rest }) => {
  return getDB()
    .collection('iNode')
    .updateOne(
      {
        _id: convertToObjectId(id),
      },
      {
        $set: {
          updatedAt: new Date(),
          ...$set,
        },
        ...rest,
      },
    );
};

export const createLeafNode = (nodeDto: any = {}) => {
  return createINode({
    type: '-',
    ...nodeDto,
  });
};

export const createParentNode = (nodeDto: any = {}) => {
  return createINode({
    type: 'd',
    ...nodeDto,
  });
};

/**
 * directory
 */
export const createDirectory = ({
  ownerId,
  parentId,
  name,
  description,
}: any = {}) => {
  const doc: any = {
    ownerId: ownerId,
    parentId: parentId,
    item: {
      name: name,
      description: description,
    },
  };
  return createINode(doc);
};

export const updateDirectory = (iNodeId, { name, description }: any = {}) => {
  return updateINodeById(iNodeId, {
    $set: {
      'item.name': name,
      'item.description': description,
    },
  });
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

export const createItem = async ({
  ownerId,
  parentId,
  ...itemDto
}: any = {}) => {
  const doc: any = {
    ownerId: ownerId,
    parentId: parentId,
    item: {
      ...itemDto,
      type: ItemTypes.PROJECT,
    },
  };
  return createLeafNode(doc);
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
      return throwServiceException(ServiceStatus.VersionAlreadyPresent);
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
  return withTransaction(async () => {
    await Promise.all([deleteChildren, deleteAcl, deleteCurrent]);
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

/**
 * acl
 */
export const setFileAcl = async ({ iNodeId, toUserId }) => {
  const permissions = 'rwx';
  const query = {
    iNodeId: convertToObjectId(iNodeId),
    userId: convertToObjectId(toUserId),
  };
  const update = {
    $set: {
      iNodeId: convertToObjectId(iNodeId),
      userId: convertToObjectId(toUserId),
      permissions,
    },
  };
  const options = { upsert: true };
  return getDB().collection('acl').updateOne(query, update, options);
};

/**
 * query
 */

export const findOneById = (id) => {
  return getDB()
    .collection('iNode')
    .findOne({
      _id: convertToObjectId(id),
    });
};

export const findOne = (...args) => {
  return getDB()
    .collection('iNode')
    .findOne(...args);
};
