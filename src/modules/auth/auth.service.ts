import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '@/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async authenticateUser(payload) {
    const { userId } = payload;
    const user: any = await this.userService.findUserByUserId(userId);
    return user;
  }

  async signup(user) {
    return this.userService.create(user);
  }

  async signIn(username, password) {
    return this.userService.authenticateUserByUserNameAndPassword(
      username,
      password,
    );
  }

  async loginWithXDFStaff(xdfStaffUserData) {
    const { email } = xdfStaffUserData;
    let user: any = await this.userService.findUserByXDFStaffInfo({ email });
    console.log('findUserByXDFStaffInfo', user);
    if (!user) {
      const result: any =
        await this.userService.createUserWithXDFStaff(xdfStaffUserData);
      console.log('新的 xdf staff 用户', result);
      user = result.userProfile;
    } else {
      user = await this.userService.updateUserXDFStaffInfo(
        user.userId,
        xdfStaffUserData,
      );
      console.log('更新用户数据', user);
    }
    const access_token = await this.jwtService.signAsync({
      userId: user.userId,
    });
    return {
      access_token,
    };
  }
}
