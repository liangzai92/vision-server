import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { getDB } from '@/shared/mongo';

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

export const findUnique = (userId: string) => {
  return getDB()
    .collection('userProfile')
    .findUnique({
      where: { userId: userId },
      select: {
        userId: true,
        xdfStaffInfo: true,
      },
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

// 知音楼登录：绑定知音楼账号
export function createUserWithXDFStaff(xdfStaffUser: any) {
  return getDB()
    .collection('user')
    .create({
      data: {
        userProfile: {
          create: {
            xdfStaffInfo: {
              create: {
                ...xdfStaffUser,
              },
            },
          },
        },
      },
      select: {
        userProfile: {
          select: {
            userId: true,
            xdfStaffInfo: true,
          },
        },
      },
    });
}

export function findUserByXDFStaff({ workcode }) {
  return getDB()
    .collection('userProfile')
    .findFirst({
      where: {
        xdfStaffInfo: {
          workcode,
        },
      },
      select: {
        userId: true,
        xdfStaffInfo: true,
      },
    });
}

export function updateUserXDFStaffInfo(xdfStaffUser: any = {}) {
  return getDB()
    .collection('xdfStaffInfo')
    .update({
      where: {
        workcode: xdfStaffUser.workcode,
      },
      data: {
        ...xdfStaffUser,
      },
    });
}
