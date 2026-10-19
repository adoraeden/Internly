import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Add it to server/.env');
}

export const COOKIE_NAME = 'internly_token';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const cookieBase = {
  httpOnly: true, // JavaScript in the browser cannot read this cookie
  sameSite: 'lax', // blocks the cookie on most cross-site requests
  secure: process.env.NODE_ENV === 'production', // HTTPS only when deployed
  path: '/',
};

export function signToken(userId, rememberMe) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '1d',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function setAuthCookie(res, userId, rememberMe) {
  const token = signToken(userId, rememberMe);
  res.cookie(COOKIE_NAME, token, {
    ...cookieBase,
    // "Remember me" = lasts 30 days. Otherwise it ends when the browser closes.
    ...(rememberMe ? { maxAge: 30 * ONE_DAY_MS } : {}),
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieBase);
}