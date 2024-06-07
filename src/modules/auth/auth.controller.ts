import { Request } from 'express';
import {
  Controller,
  Body,
  Query,
  Response,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { Public } from './public.decorator';
import { ACCESS_TOKEN_COOKIE_NAME } from '@/constants';
import { verifyAuthCode } from '@/helpers/xdf-staff-sso';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Public()
  @Post('login')
  login(@Body() body: { name: string; password: string }) {
    const { name, password } = body;
    return this.authService.signIn(name, password);
  }

  @Get('check/login')
  checkLogin(@Req() request: Request) {
    // return this.userService.checkLogin(id);
  }

  @Public()
  @Get('/xdf/staff/login')
  async loginWithXDFStaff(
    @Req() request: Request,
    @Response() response,
    @Query() query,
  ) {
    const { code, e2e } = query;
    const userAgent = request.headers['user-agent'];
    const ip = request.ip || '0.0.0.0';
    const [err, xdfStaffInfo] = await verifyAuthCode({
      code,
      e2e,
      userAgent,
      ip,
    });
    console.log('verifyAuthCode controller', [err, xdfStaffInfo]);
    const defaultRedirectUrl = 'http://localhost:8000/vision-admin';
    const redirect_url = query.redirect_url || defaultRedirectUrl;
    if (err) {
      return response.redirect(redirect_url);
    }
    const result = await this.authService.loginWithXDFStaff(xdfStaffInfo);
    const access_token = result.access_token;
    console.log('access_token', access_token);
    response.cookie(ACCESS_TOKEN_COOKIE_NAME, access_token, {
      maxAge: 24 * 60 * 1000,
      // secure: true,
      // sameSite: 'none',
    });
    response.redirect(redirect_url + `?token=${access_token}`);
  }
}
