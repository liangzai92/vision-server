import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE_NAME } from '@/constants';
import { AuthService } from './auth.service';
import { JWT_CONSTANTS } from './constants';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          const authAccessToken =
            request?.headers?.authorization ||
            request?.cookies?.[ACCESS_TOKEN_COOKIE_NAME];
          return authAccessToken;
        },
      ]),
      secretOrKey: JWT_CONSTANTS.secret,
      ignoreExpiration: false,
    });
  }

  validate(payload: any) {
    return this.authService.authenticateUser(payload);
  }
}
