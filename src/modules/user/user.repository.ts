import { ObjectId } from 'mongodb';
import { trimWhiteSpace } from '@/utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { convertToObjectId, findWithPagination, getDB } from '@/helpers/mongo';

export async function checkUserNameExists(name = '') {
  const user = await getDB()
    .collection('user')
    .findOne({
      name: trimWhiteSpace(name),
    });

  return user !== null;
}

export function findUserByUserName(name = '') {
  return getDB()
    .collection('user')
    .findOne({
      name: trimWhiteSpace(name),
    });
}

export const createUser = async (createUserDto: CreateUserDto) => {
  const { name = '', password = '' } = createUserDto;
  return getDB()
    .collection('user')
    .insertOne({
      userId: new ObjectId(),
      name: trimWhiteSpace(name),
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
};

export const findMany = () => {
  return getDB().collection('user').find().toArray();
};

export const findOne = (...args) => {
  return getDB()
    .collection('user')
    .findOne(...args);
};

export const findUserByUserId = (userId: string) => {
  if (!userId) {
    throw new Error('userId is required');
  }
  return getDB()
    .collection('user')
    .findOne({
      userId: convertToObjectId(userId),
    });
};

export const update = (id: string, updateUserDto: UpdateUserDto) => {
  // const { name } = updateUserDto;
  const { email = '', nickname = '' } = updateUserDto;
  return getDB()
    .collection('userProfile')
    .update({
      where: { id: id },
      data: {
        email,
        nickname,
      },
    });
};

export const remove = (id: string) => {
  return getDB()
    .collection('user')
    .delete({
      where: { id: id },
    });
};

export const getUserList = ({ name }) => {
  function createRegexQuery(field, value) {
    return {
      [field]: {
        $regex: '.*' + value + '.*',
        $options: 'i',
      },
    };
  }
  return findWithPagination(getDB().collection('user'), {
    $or: [
      createRegexQuery('xdfStaff.email', name),
      createRegexQuery('xdfStaff.realName', name),
    ],
  });
};

export function createUserWithXDFStaff(xdfStaff: any) {
  return getDB().collection('user').insertOne({
    userId: new ObjectId(),
    name: xdfStaff.ac,
    nickName: xdfStaff.nickName,
    xdfStaff: xdfStaff,
  });
}

export const findUserByXDFStaff = ({ email }: any) => {
  return getDB().collection('user').findOne({
    'xdfStaff.email': email,
  });
};

export function updateUserXDFStaffInfoByUserId(userId, xdfStaff: any = {}) {
  return getDB()
    .collection('user')
    .updateOne(
      {
        userId: convertToObjectId(userId),
      },
      {
        $set: {
          xdfStaff: xdfStaff,
          lastLoginAt: new Date(),
        },
      },
    );
}
