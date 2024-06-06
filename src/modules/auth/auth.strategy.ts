import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { ACCESS_TOKEN_COOKIE_NAME } from '@/constants';

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
      secretOrKey: jwtConstants.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    return this.authService.authenticateUser(payload);
  }
}
