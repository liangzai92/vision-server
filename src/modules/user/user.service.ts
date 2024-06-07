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

  async findUserByUserId(id: string) {
    const res = await userRepository.findUserByUserId(id);
    if (!res) throwHttpException('用户id不存在');
    return res;
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

  // 知音楼登录
  async createUserWithXDFStaff(xdfStaff: any) {
    const result = await userRepository.createUserWithXDFStaff(xdfStaff);
    return userRepository.findOne({
      _id: result.insertedId,
    });
  }

  async findUserByXDFStaffInfo(xdfStaff: any) {
    return userRepository.findUserByXDFStaffInfo(xdfStaff);
  }

  async updateUserXDFStaffInfo(userId, xdfStaff: any) {
    const result = await userRepository.updateUserXDFStaffInfo(
      userId,
      xdfStaff,
    );
    return userRepository.findUserByUserId(userId);
  }
}
