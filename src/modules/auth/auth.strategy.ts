import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JWT_CONSTANTS } from './constants';
import { getTokenFromRequest } from '../../helpers/tokenInContext';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: getTokenFromRequest,
      secretOrKey: JWT_CONSTANTS.secret,
      ignoreExpiration: false,
    });
  }

  validate(payload: any) {
    return this.authService.authenticateUser(payload);
  }
}
