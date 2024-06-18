import type { Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE_NAME } from '@/constants';

export const setTokenToCookie = (response: Response, accessToken: string) => {
  response.setHeader('Authorization', `Bearer ${accessToken}`);
  response.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    // sameSite: 'none',
    // sameSite: 'strict',
  });
};

export const getTokenFromRequestCookie = (request) => {
  return request?.cookies?.[ACCESS_TOKEN_COOKIE_NAME];
};

export const getTokenFromRequest = (request) => {
  const extractors = [
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    ExtractJwt.fromHeader('Authorization'),
    ExtractJwt.fromBodyField('Authorization'),
    ExtractJwt.fromUrlQueryParameter('Authorization'),
    getTokenFromRequestCookie,
  ];
  const tokenExtractor = ExtractJwt.fromExtractors(extractors);
  const token = tokenExtractor(request);
  return token;
};
