import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~~/server/utils/prisma'
import { ResetPasswordSchema } from '~~/server/utils/zod'
import { checkRateLimit } from '~~/server/utils/rateLimit'
import argon2 from 'argon2'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = ResetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message || 'Invalid input' })
  }

  const { email, code, newPassword } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Avoid enumeration
    return { ok: true }
  }

  // Attempts limit: 5 per 10 minutes
  const rl = await checkRateLimit(`reset:${user.id}`, 5, 600)
  if (!rl.allowed) {
    throw createError({ statusCode: 429, statusMessage: `Too many attempts. Retry in ${rl.retryAfterSec}s` })
  }

  const now = new Date()
  const record = await prisma.passwordReset.findFirst({
    where: { userId: user.id, code, usedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: 'desc' },
  })

  if (!record) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired code' })
  }

  const passwordHash = await argon2.hash(newPassword)

  await prisma.$transaction([
    prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: now } }),
    prisma.user.update({ where: { id: user.id }, data: { password: passwordHash } }),
  ])

  return { ok: true }
})

