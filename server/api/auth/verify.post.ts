import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~~/server/utils/prisma'
import { VerifySchema } from '~~/server/utils/zod'
import { checkRateLimit } from '~~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = VerifySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message || 'Invalid input' })
  }

  const { email, code } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Avoid user enumeration
    return { ok: true }
  }

  const rl = await checkRateLimit(`verify:${user.id}`, 5, 600)
  if (!rl.allowed) {
    throw createError({ statusCode: 429, statusMessage: `Too many attempts. Retry in ${rl.retryAfterSec}s` })
  }

  const now = new Date()
  const record = await prisma.emailVerification.findFirst({
    where: { userId: user.id, code, usedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: 'desc' },
  })

  if (!record) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired code' })
  }

  await prisma.$transaction([
    prisma.emailVerification.update({ where: { id: record.id }, data: { usedAt: now } }),
    prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
  ])

  return { ok: true }
})
