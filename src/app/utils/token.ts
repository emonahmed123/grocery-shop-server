import { CookieOptions, Request, Response } from 'express';
import config from '../config';
import { CookieUtils } from './cookie';
import { jwtUtils } from './jwt';

export const AUTH_COOKIE_NAMES = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
} as const;

const isProduction = config.node_env === 'production';

// the same options are used to set and to clear, so a logout always removes them.
// In production the store and the API are on different sites, which needs
// sameSite "none" (and that only works with secure); locally both are on localhost.
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

// the cookie lives exactly as long as the token inside it
const maxAgeFor = (token: string) => {
  const exp = jwtUtils.decodeToken(token)?.exp;
  return exp ? Math.max(exp * 1000 - Date.now(), 0) : undefined;
};

const setAccessTokenCookie = (res: Response, token: string) => {
  CookieUtils.setCookie(res, AUTH_COOKIE_NAMES.accessToken, token, {
    ...baseCookieOptions,
    maxAge: maxAgeFor(token),
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  CookieUtils.setCookie(res, AUTH_COOKIE_NAMES.refreshToken, token, {
    ...baseCookieOptions,
    maxAge: maxAgeFor(token),
  });
};

/** sets whichever tokens a login, refresh or password change produced */
const setAuthCookies = (
  res: Response,
  tokens: { accessToken?: string; refreshToken?: string },
) => {
  if (tokens.accessToken) setAccessTokenCookie(res, tokens.accessToken);
  if (tokens.refreshToken) setRefreshTokenCookie(res, tokens.refreshToken);
};

const clearAuthCookies = (res: Response) => {
  CookieUtils.clearCookie(res, AUTH_COOKIE_NAMES.accessToken, baseCookieOptions);
  CookieUtils.clearCookie(
    res,
    AUTH_COOKIE_NAMES.refreshToken,
    baseCookieOptions,
  );
};

/**
 * The access token from the `Authorization: Bearer` header (what the store's
 * server sends) or, failing that, from the cookie (a browser calling directly).
 */
const getAccessTokenFromRequest = (req: Request) =>
  req.headers.authorization?.split(' ')[1] ||
  CookieUtils.getCookie(req, AUTH_COOKIE_NAMES.accessToken);

export const tokenUtils = {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setAuthCookies,
  clearAuthCookies,
  getAccessTokenFromRequest,
};
