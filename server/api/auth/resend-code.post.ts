import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~~/server/utils/prisma'
import { checkRateLimit } from '~~/server/utils/rateLimit'
import { z } from 'zod'
import { sendVerificationEmail } from '~~/server/utils/mailer'

const ResendSchema = z.object({ email: z.string().email() })

function generateCode() {
  return Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = ResendSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message || 'Invalid input' })
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Avoid enumeration; pretend success
    return { ok: true }
  }

  // Cooldown 1/min and daily cap 10/day
  const cooldown = await checkRateLimit(`resend:${user.id}`, 1, 60)
  if (!cooldown.allowed) {
    throw createError({ statusCode: 429, statusMessage: `Please wait ${cooldown.retryAfterSec}s before requesting again` })
  }
  const daily = await checkRateLimit(`resendday:${user.id}`, 10, 86400)
  if (!daily.allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Daily limit reached' })
  }

  const ttlMin = Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 15)
  const code = generateCode()
  const expiresAt = new Date(Date.now() + ttlMin * 60_000)
  await prisma.emailVerification.create({ data: { userId: user.id, code, expiresAt } })

  try {
    await sendVerificationEmail(email, code)
  } catch {}

  return { ok: true }
})
