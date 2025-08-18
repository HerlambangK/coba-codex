import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~~/server/utils/prisma'
import { ForgotPasswordSchema } from '~~/server/utils/zod'
import { checkRateLimit } from '~~/server/utils/rateLimit'
import { sendPasswordResetEmail } from '~~/server/utils/mailer'

function generateCode() {
  return Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = ForgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message || 'Invalid input' })
  }

  const { email } = parsed.data

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'Email tidak terdaftar' })
    }

    // Blokir jika belum terverifikasi
    if (!user.isVerified) {
      throw createError({ statusCode: 403, statusMessage: 'Email belum terverifikasi. Silakan verifikasi terlebih dahulu.' })
    }

    // Cooldown: 1 per 60s and daily cap 5/day
    const cooldown = await checkRateLimit(`forgot:${user.id}`, 1, 60)
    if (!cooldown.allowed) {
      throw createError({ statusCode: 429, statusMessage: `Please wait ${cooldown.retryAfterSec}s before requesting again` })
    }
    const daily = await checkRateLimit(`forgotday:${user.id}`, 5, 86400)
    if (!daily.allowed) {
      throw createError({ statusCode: 429, statusMessage: 'Daily limit reached' })
    }

    const ttlMin = Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 15)
    const code = generateCode()
    const expiresAt = new Date(Date.now() + ttlMin * 60_000)

    await prisma.passwordReset.create({ data: { userId: user.id, code, expiresAt } })

    if (process.env.NODE_ENV !== 'production' || String(process.env.MAIL_LOG || '').toLowerCase() === 'true') {
      console.log(`[mail][dev] Password reset code for ${email}:`, code)
    }

    const base = (process.env.NUXT_PUBLIC_BASE_URL || '').replace(/\/$/, '')
    const link = base ? `${base}/reset?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}` : ''
    try {
      await sendPasswordResetEmail(email, { code, link, expiresMin: ttlMin })
    } catch (e: any) {
      console.error('[mail] reset send failed:', e?.message || String(e))
    }

    return { ok: true }
  } catch (err) {
    const e: any = err
    const msg: string = e?.message || String(e)
    const codeP: string | undefined = e?.code
    if (codeP === 'P2021' || /relation .* does not exist|table .* does not exist|does not exist/i.test(msg)) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Service Unavailable',
        message: 'Database not initialized. Run: npx prisma db push, then npx prisma db seed',
      })
    }
    if (codeP === 'P1001' || codeP === 'P1002' || /ECONNREFUSED|ENOTFOUND|timeout|getaddrinfo/i.test(msg)) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Service Unavailable',
        message: 'Database not reachable. Ensure Postgres is running and run migrations (npx prisma migrate dev).',
      })
    }
    if (e?.statusCode) throw e
    throw createError({ statusCode: 500, statusMessage: 'internal server error' })
  }
})
