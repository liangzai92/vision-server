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
    if (!user) {
      throw new Error('User not found');
    }
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
    let user: any = await this.userService.findUserByXDFStaff({ email });
    if (!user) {
      user = await this.userService.createUserWithXDFStaff(xdfStaffUserData);
      console.log('loginWithXDFStaff 新用户 首次登录', user);
    } else {
      user = await this.userService.updateUserXDFStaffInfoByUserId(
        user.userId,
        xdfStaffUserData,
      );
      console.log('loginWithXDFStaff 老用户', user);
    }
    const access_token = await this.jwtService.signAsync({
      userId: user.userId,
    });
    return {
      access_token,
    };
  }
}
