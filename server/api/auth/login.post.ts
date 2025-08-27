import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~~/server/utils/prisma'
import { LoginSchema } from '~~/server/utils/zod'
import argon2 from 'argon2'
import { setAuthCookie, signToken } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message || 'Invalid input' })
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Email tidak terdaftar' })
  }

  const valid = await argon2.verify(user.password, password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Password salah' })
  }

  if (!user.isVerified) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: { needsVerification: true },
    })
  }

  const token = signToken({ sub: user.id, role: user.role })
  setAuthCookie(event, token)
  return { role: user.role }
})
