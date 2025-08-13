import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'
import jwt from 'jsonwebtoken'
import prisma from './prisma'
import type { Role } from '@prisma/client'

export const COOKIE_NAME = 'auth_token'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

type JwtPayload = {
  sub: string
  role: Role
}

export function signToken(payload: JwtPayload, expiresIn: string = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): (JwtPayload & { iat: number; exp: number }) | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

export async function getUserFromEvent(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return null
  const decoded = verifyToken(token)
  if (!decoded) return null
  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    select: { id: true, email: true, name: true, role: true, isVerified: true },
  })
  return user
}

export function setAuthCookie(event: H3Event, token: string) {
  const isProd = process.env.NODE_ENV === 'production'
  // Default to 7d if we can't infer from token
  const defaultMaxAge = 7 * 24 * 60 * 60
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: defaultMaxAge,
  })
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

