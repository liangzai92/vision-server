import { Injectable } from '@nestjs/common';

import { trimWhiteSpace } from 'src/utils';
import { throwHttpException } from 'src/utils/throwHttpException';
import { hashPassword, verifyPassword } from 'src/utils/password';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as userRepository from './user.repository';

@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto) {
    const { name = '', password = '' } = createUserDto;
    const isUserNameExists = await userRepository.checkUserNameExists(
      trimWhiteSpace(name),
    );
    if (isUserNameExists) throwHttpException('用户名已存在');
    const hashedPassword = await hashPassword(password);
    const res = await userRepository.create({
      name: trimWhiteSpace(name),
      password: hashedPassword,
    });
    console.log(res);
    return res?.userProfile;
  }

  async findAll() {
    const res = await userRepository.findMany();
    return {
      list: res,
    };
  }

  async findUserByUserId(userId: string) {
    return userRepository.findUserByUserId(userId);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const res = await userRepository.update(id, {
      ...updateUserDto,
      name: trimWhiteSpace(updateUserDto.name),
      nickname: trimWhiteSpace(updateUserDto.nickname),
    });
    return res;
  }

  async remove(id: string) {
    const res = await userRepository.remove(id);
    return {
      ...res,
    };
  }

  async authenticateUserByUserNameAndPassword(username, password) {
    const user: any = await userRepository.findUserByUserName(
      trimWhiteSpace(username),
    );
    // throw new UnauthorizedException();
    if (!user) throwHttpException('Invalid username or password');
    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) throwHttpException('Invalid username or password');
    const userInfo = await userRepository.findUserByUserId(user.userId);
    return userInfo;
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
