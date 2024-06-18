import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { throwHttpException } from '@/utils/throwHttpException';
import { hashPassword, verifyPassword } from '@/utils/password';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as userRepository from './user.repository';

@Injectable()
export class UserService {
  async createUser(createUserDto: CreateUserDto) {
    const { name = '', password = '' } = createUserDto;
    const isUserNameExists = await userRepository.checkUserNameExists(name);
    if (isUserNameExists) {
      throw new ConflictException('用户名已存在');
    }
    const hashedPassword = await hashPassword(password);
    const result = await userRepository.createUser({
      name: name,
      password: hashedPassword,
    });
    if (result.insertedId) {
      const user = await userRepository.findOne({
        _id: result.insertedId,
      });
      delete user.password;
      delete user._id;
      return user;
    }
    return result;
  }

  async findAll() {
    const res = await userRepository.findMany();
    return {
      list: res,
    };
  }

  findUserByUserId(userId: string) {
    return userRepository.findUserByUserId(userId);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const res = await userRepository.update(id, {
      ...updateUserDto,
      name: updateUserDto.name,
      nickname: updateUserDto.nickname,
    });
    return res;
  }

  async remove(id: string) {
    const res = await userRepository.remove(id);
    return {
      ...res,
    };
  }

  async authenticateUserByUserNameAndPassword(name, password) {
    const user: any = await userRepository.findUserByUserName(name);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user?.password) {
      throw new Error('用户还没有设置过密码');
    }
    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      return throwHttpException('Invalid username or password');
    }
    return userRepository.findUserByUserId(user.userId);
  }

  async createUserWithXDFStaff(xdfStaff: any) {
    const result = await userRepository.createUserWithXDFStaff(xdfStaff);
    return userRepository.findOne({
      _id: result.insertedId,
    });
  }

  async findUserByXDFStaff(xdfStaff: any) {
    return userRepository.findUserByXDFStaff(xdfStaff);
  }

  async updateUserXDFStaffInfoByUserId(userId, xdfStaff: any) {
    const updateResult = await userRepository.updateUserXDFStaffInfoByUserId(
      userId,
      xdfStaff,
    );
    if (updateResult?.acknowledged) {
      return userRepository.findUserByUserId(userId);
    }
    return false;
  }

  async getUserList(payload) {
    return userRepository.getUserList(payload);
  }
}
