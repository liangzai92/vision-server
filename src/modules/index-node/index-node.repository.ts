import { ItemTypes } from '@/constants';
import { getClient, getDB } from '@/shared/mongo';
import { throwHttpException } from '@/utils/throwHttpException';
import { isEmpty } from 'lodash';

export const createDirectory = async (ownerId, createINodeDto: any = {}) => {
  const parentId = createINodeDto.parentId;

  const name = createINodeDto.name;
  const description = createINodeDto.description;

  const indexNode = await getDB().collection('indexNode').create({
    data: {
      type: 'd',
      ownerId: ownerId,
      parentId: parentId,
      item: {
        create: {
          name,
          description,
        },
      },
    },
  });

  return indexNode;
};

export const updateDirectory = async (
  iNodeId,
  updateDirectoryDto: any = {},
) => {
  const name = updateDirectoryDto.name;
  const description = updateDirectoryDto.description;

  console.log('dfdfdf');
  const indexNode = await getDB().collection('indexNode').update({
    where: {
      id: iNodeId,
    },
    data: {
      item: {
        update: {
          name,
          description,
        },
      },
    },
  });

  return indexNode;
};

export const createItem = async (
  iNodeDto: any = {},
  itemDto: any = {},
  recordData?: any,
) => {
  console.log('createItem iNodeDto', iNodeDto);
  console.log('createItem itemDto', itemDto);
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
    data: {
      ...iNode,
      item: {
        create: {
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
    options.data.item.create.records = {
      create: [
        {
          data: recordData,
        },
      ],
    };
  }
  if (item.type === ItemTypes.TEMPLATE) {
    options.data.item.create.records = {
      create: [
        {
          version: typeData.version,
          data: typeData,
        },
      ],
    };
  }

  return getDB().collection('indexNode').create(options);
};

export const updateItem = async (
  iNodeDto: any = {},
  itemDto: any = {},
  recordData?: any,
) => {
  console.log('updateItem iNodeDto', iNodeDto);
  console.log('updateItem itemDto', itemDto);
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
      id: itemDto.indexNodeId,
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

  return getDB().collection('indexNode').update(options);
};

export const createProject = async (
  ownerId,
  createProjectDto: any = {},
  recordData?: any,
) => {
  const parentId = createProjectDto.parentId;
  return createItem(
    {
      ownerId,
      parentId,
    },
    { ...createProjectDto, type: ItemTypes.PROJECT },
    recordData,
  );
};

export const updateProject = async (iNodeId, createProjectDto: any = {}) => {
  const name = createProjectDto.name;
  const description = createProjectDto.description;
  return updateItem({}, { name, description, indexNodeId: iNodeId });
};

export const createProjectFromTemplate = async (
  ownerId,
  createProjectDto: any = {},
  recordData?: any,
) => {
  const parentId = createProjectDto.parentId;
  return createItem(
    {
      ownerId,
      parentId,
    },
    { ...createProjectDto, type: ItemTypes.PROJECT_CREATED_FROM_TEMPLATE },
    recordData,
  );
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
    const versionRecord = await getDB().collection('itemRecord').findMany({
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
        indexNodeId: itemNode?.indexNodeId?.$oid,
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
      {},
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
    const versionRecord = await getDB().collection('itemRecord').findMany({
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
  const deleteChildren = getDB().collection('indexNode').deleteMany({
    where: {
      parentId: iNodeId,
    },
  });
  const deleteAcl = getDB().collection('acl').deleteMany({
    where: {
      indexNodeId: iNodeId,
    },
  });
  const deleteCurrent = getDB().collection('indexNode').delete({
    where: { id: iNodeId },
  });

  const session = getClient().startSession();
  session.startTransaction();
  try {
    await Promise.all([
      deleteChildren,
      deleteAcl,
      deleteCurrent,
    ]);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const findUnique = async (id: string) => {
  return getDB().collection('indexNode').findUnique({
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
  return getDB().collection('item').findRaw({
    filter: {
      'typeData.name': templateName,
    },
  });
};

export const getParentNodeList = async (id: string) => {
  const node = await getDB().collection('indexNode').findUnique({
    where: { id: id },
    include: {
      item: {},
    },
  });
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
  const acl = await getDB().collection('acl').findUnique({
    where: {
      indexNodeId_userId: {
        indexNodeId: iNodeId,
        userId: userId,
      },
    },
  });
  if (acl) {
    return acl;
  } else {
    const node = await getDB().collection('indexNode').findUnique({
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
  const node = await getDB().collection('indexNode').findUnique({
    where: {
      id: iNodeId,
    },
    include: {
      item: true,
    },
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
