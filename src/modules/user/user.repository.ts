import { ObjectId } from 'mongodb';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { getDB } from '@/helpers/mongo';

export async function checkUserNameExists(name = '') {
  const user = await getDB().collection('user').findOne({
    name: name,
  });

  return user !== null;
}

export function findUserByUserName(name = '') {
  return getDB().collection('user').findOne({
    name: name,
  });
}

export const create = async (createUserDto: CreateUserDto) => {
  const { name = '', password = '' } = createUserDto;
  return getDB()
    .collection('user')
    .create({
      data: {
        name,
        password,
        userProfile: {
          create: {},
        },
      },
      select: {
        userProfile: {
          select: {
            userId: true,
          },
        },
      },
    });
};

export const findMany = () => {
  return getDB().collection('user').findMany();
};

export const findOne = (...args) => {
  return getDB()
    .collection('user')
    .findOne(...args);
};

export const findUserByUserId = (userId: string) => {
  return getDB()
    .collection('user')
    .findOne({ userId: new ObjectId(userId) });
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

export function createUserWithXDFStaff(xdfStaffInfo: any) {
  return getDB().collection('user').insertOne({
    userId: new ObjectId(),
    xdfStaffInfo: xdfStaffInfo,
  });
}

export const findUserByXDFStaffInfo = (xdfStaffInfo) => {
  return getDB().collection('user').findOne({
    'xdfStaffInfo.email': xdfStaffInfo.email,
  });
};

export function updateUserXDFStaffInfo(userId, xdfStaffInfo: any = {}) {
  return getDB()
    .collection('user')
    .updateOne(
      {
        userId: userId,
      },
      {
        $set: {
          xdfStaffInfo: xdfStaffInfo,
        },
      },
    );
}
