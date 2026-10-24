import { CookieOptions, Request, Response } from 'express';

const setCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(key, value, options);
};

// req.cookies is filled by cookie-parser (see app.ts)
const getCookie = (req: Request, key: string): string | undefined => {
  return req.cookies?.[key];
};

// the options must match the ones the cookie was set with, or the browser keeps it
const clearCookie = (res: Response, key: string, options: CookieOptions) => {
  res.clearCookie(key, options);
};

export const CookieUtils = {
  setCookie,
  getCookie,
  clearCookie,
};
