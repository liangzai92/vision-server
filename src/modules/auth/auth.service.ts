import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(registerInput) {
    return this.userService.createUser(registerInput);
  }

  async loginWithPassword(name, password) {
    const user = await this.userService.authenticateUserByUserNameAndPassword(
      name,
      password,
    );
    if (user) {
      return this.generateTokens({
        userId: user.userId,
      });
    }
    return false;
  }

  async authenticateUser(payload) {
    const { userId } = payload;
    const user: any = await this.userService.findUserByUserId(userId);
    if (!user) {
      console.log('没有查到这个用户', userId);
      return false;
    }
    return user;
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
    return this.generateTokens({
      userId: user.userId,
    });
  }

  generateTokens(payload: { userId: string }) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: { userId: string }) {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }

  refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      return this.generateTokens({
        userId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
