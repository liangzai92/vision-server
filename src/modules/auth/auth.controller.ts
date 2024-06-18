import { Request } from 'express';
import {
  Controller,
  Body,
  Query,
  Response,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setTokenToCookie } from '@/helpers/tokenInContext';
import { verifyAuthCode } from '@/helpers/xdf-staff-sso';
import { getUserByAccount } from '@/helpers/xdf-staff-A2';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Public } from './public.decorator';
import { TokenInterceptor } from './interceptors/token.interceptor';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  register(@Body() createUserInput: CreateUserDto) {
    return this.authService.register(createUserInput);
  }

  @UseInterceptors(TokenInterceptor)
  @Public()
  @Post('login')
  async login(@Body() body: { name: string; password: string }) {
    const { name, password } = body;
    return this.authService.login(name, password);
  }

  @Public()
  @Get('check/login')
  checkLogin(@Req() request) {
    return request.user?.userId;
  }

  @UseInterceptors(TokenInterceptor)
  @Get('refreshToken')
  async refreshToken(@Query('token') token) {
    return this.authService.refreshToken(token);
  }

  @Public()
  @Get('/xdf/staff/login')
  async loginWithXDFStaff(
    @Req() request: Request,
    @Response() response,
    @Query() query,
  ) {
    const defaultRedirectUrl = 'http://localhost:8000/vision-admin';
    const redirect_url = query.redirect_url || defaultRedirectUrl;

    const { code, e2e } = query;
    const userAgent = request.headers['user-agent'];
    const ip = request.ip || '0.0.0.0';
    const [err, res] = await verifyAuthCode({
      code,
      e2e,
      userAgent,
      ip,
    });
    console.log('verifyAuthCode', [err, res]);
    if (err) {
      if (res?.data?.msg) {
        throw new Error(res.data.msg);
      }
      return response.redirect(redirect_url);
    }
    const xdfStaffLoginData = res;
    const [err2, res2] = await getUserByAccount(
      {
        accountid: xdfStaffLoginData.email.split('@')[0],
      },
      {
        ip: ip,
        ua: userAgent,
      },
    );
    console.log('getUserByAccount', [err2, res2]);
    let xdfStaffAccountInfo: any = {};
    if (!err2 && res2) {
      xdfStaffAccountInfo = res2;
    }
    const xdfStaff = {
      ...xdfStaffLoginData,
      ...xdfStaffAccountInfo,
      deptName: xdfStaffAccountInfo?.DeptName || '',
      realName: xdfStaffAccountInfo?.RealName || '',
      ac: xdfStaffAccountInfo?.Ac || '',
    };
    const { accessToken } = await this.authService.loginWithXDFStaff(xdfStaff);
    setTokenToCookie(response, accessToken);
    response.redirect(redirect_url);
  }
}
