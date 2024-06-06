import {
  Controller,
  Request,
  Body,
  Query,
  Response,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';

import { getTicket, verify } from '@/utils/zhiyinlou';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Public } from './public.decorator';
import { ACCESS_TOKEN_COOKIE_NAME } from '@/constants';

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
  @Get('login/zhiyinlou')
  async loginWithZhiYinLou(@Query() query, @Response() response) {
    const { redirect_url, token } = query;

    const ticket = await getTicket({
      vdyooAppId: this.configService.get('NEST_VDYOO_APP_ID'),
      vdyooAppKey: this.configService.get('NEST_VDYOO_APP_KEY'),
    });

    const [err, data] = await verify({
      ticket,
      token,
    });
    if (err) {
      response.redirect(redirect_url);
      return;
    }
    console.log('zhiyinlou verify data res', data);
    const userData = data.data;
    console.log('userData', userData);
    const result = await this.authService.loginWithZhiYinLou(userData);
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
