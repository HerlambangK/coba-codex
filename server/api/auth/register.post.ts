import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~~/server/utils/prisma'
import { RegisterSchema } from '~~/server/utils/zod'
import argon2 from 'argon2'
import { sendVerificationEmail } from '~~/server/utils/mailer'

function generateCode() {
  return Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message || 'Invalid input' })
  }

  const { email, password, name } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.isVerified) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  const passwordHash = await argon2.hash(password)

  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { name: name || existing.name, password: passwordHash } })
    : await prisma.user.create({ data: { email, name, password: passwordHash } })

  const ttlMin = Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 15)
  const code = generateCode()
  const expiresAt = new Date(Date.now() + ttlMin * 60_000)

  await prisma.emailVerification.create({
    data: { userId: user.id, code, expiresAt },
  })

  try {
    await sendVerificationEmail(email, code)
  } catch (e) {
    // Do not leak email delivery errors; still respond OK so client can retry
  }

  return { ok: true }
})
