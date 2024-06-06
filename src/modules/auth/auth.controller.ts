import {
  Controller,
  Request,
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
import { verifyAuthCode } from '@/shared/sso/xdf-staff';
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
    // console.log(request.cookies); // or "request.cookies['cookieKey']"
    // or console.log(request.signedCookies);
    // return this.userService.checkLogin(id);
  }

  @Public()
  @Get('login/xdf/staff')
  async loginWithXDFStaff(@Query() query, @Response() response) {
    const { code, e2e, userAgent, ip } = query;
    const { redirect_url } = query;
    const [err, data] = await verifyAuthCode({
      code,
      e2e,
      userAgent,
      ip,
    });
    console.log('verifyAuthCode----', [err, data]);
    if (err) {
      response.redirect(redirect_url);
      return;
    }
    const userData = data.data;
    const result = await this.authService.loginWithXDFStaff(userData);
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
