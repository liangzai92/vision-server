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
    const workcode = payload?.xdfStaffInfo?.workcode;
    const user: any = await this.userService.findUserByXDFStaff({ workcode });
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
    const { workcode } = xdfStaffUserData;
    let user: any = await this.userService.findUserByXDFStaff({ workcode });
    console.log('findUserByXDFStaff', user);
    if (!user) {
      const result: any =
        await this.userService.createUserWithXDFStaff(xdfStaffUserData);
      console.log('新的 xdf staff 用户', result);
      user = result.userProfile;
    } else {
      const xdfStaffInfo =
        await this.userService.updateUserXDFStaffInfo(xdfStaffUserData);
      console.log('更新用户 xdf staff 数据', xdfStaffInfo);
      user.xdfStaffInfo = xdfStaffInfo;
    }
    const access_token = await this.jwtService.signAsync(user);
    return {
      access_token,
    };
  }
}
