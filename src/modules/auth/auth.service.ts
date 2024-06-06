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
    const workcode = payload?.zhiYinLouInfo?.workcode;
    const user: any = await this.userService.findUserByZhiYinLou({ workcode });
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

  async loginWithZhiYinLou(zhiyinlouUserData) {
    const { workcode } = zhiyinlouUserData;
    let user: any = await this.userService.findUserByZhiYinLou({ workcode });
    console.log('findUserByZhiYinLou', user);
    if (!user) {
      const result: any =
        await this.userService.createUserWithZhiYinLou(zhiyinlouUserData);
      console.log('新的知音楼用户', result);
      user = result.userProfile;
    } else {
      const zhiYinLouInfo =
        await this.userService.updateUserZhiYinLouInfo(zhiyinlouUserData);
      console.log('更新用户知音楼数据', zhiYinLouInfo);
      user.zhiYinLouInfo = zhiYinLouInfo;
    }
    const access_token = await this.jwtService.signAsync(user);
    return {
      access_token,
    };
  }
}
