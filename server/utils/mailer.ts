import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || 'localhost'
const SMTP_PORT = Number(process.env.SMTP_PORT || 1025)
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const SMTP_FROM = process.env.SMTP_FROM || 'no-reply@example.com'
const APP_NAME = process.env.NUXT_APP_NAME || 'App'

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
})

export async function sendVerificationEmail(to: string, code: string) {
  const baseUrl = (process.env.NUXT_PUBLIC_BASE_URL || '').replace(/\/$/, '')
  const link = `${baseUrl}/verify?email=${encodeURIComponent(to)}&code=${encodeURIComponent(code)}`

  const subject = `${APP_NAME} - Email Verification`
  const text = `Your ${APP_NAME} verification code is ${code}.\n\nYou can also click the link to verify: ${link}`
  const html = `
    <p>Your ${APP_NAME} verification code is <strong>${code}</strong>.</p>
    <p>You can also click the link below to verify:</p>
    <p><a href="${link}">${link}</a></p>
  `

  return transporter.sendMail({ from: SMTP_FROM, to, subject, text, html })
}

