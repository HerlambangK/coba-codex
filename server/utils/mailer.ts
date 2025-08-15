import nodemailer, { Transporter } from "nodemailer";
import { renderMail, type MailTemplate, type MailTemplateData } from './mailTemplates'

const env = {
  SMTP_HOST: process.env.SMTP_HOST || "localhost",
  SMTP_PORT: Number(process.env.SMTP_PORT || 1025),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "",
  APP_NAME: process.env.NUXT_APP_NAME || "App",
  MAIL_LOG: String(process.env.MAIL_LOG || "").toLowerCase() === "true",
  MAIL_USE_ETHEREAL: String(process.env.MAIL_USE_ETHEREAL || "").toLowerCase() === "true",
  SMTP_SECURE:
    String(process.env.SMTP_SECURE || "").toLowerCase() === "true" ||
    Number(process.env.SMTP_PORT) === 465,
  SMTP_TLS_INSECURE: String(process.env.SMTP_TLS_INSECURE || "").toLowerCase() === "true",
  BASE_URL: (process.env.NUXT_PUBLIC_BASE_URL || "").replace(/\/$/, ""),
};

const isGmail = /@gmail\.com$/i.test(env.SMTP_USER);

/** Buat transporter dari env (SMTP real). */
function createEnvTransport() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE, // true untuk 465, false untuk 587
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    // Jangan longgarkan TLS kecuali kamu sadar risikonya (local/dev)
    tls: env.SMTP_TLS_INSECURE ? { rejectUnauthorized: false } : undefined,
  });
}

/** Buat transporter Ethereal (testing, tidak benar-benar mengirim). */
async function createEtherealTransport() {
  const test = await nodemailer.createTestAccount();
  const t = nodemailer.createTransport({
    host: test.smtp.host,
    port: test.smtp.port,
    secure: test.smtp.secure,
    auth: { user: test.user, pass: test.pass },
  });
  if (env.MAIL_LOG) {
    console.log("[mail] Using Ethereal test account:", test.user);
  }
  // Simpan user/pass di closure untuk di-log saat kirim jika diperlukan
  (t as any).__ethereal = test;
  return t;
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

/** Ambil transporter siap pakai. Ethereal akan diprioritaskan jika diaktifkan. */
async function getTransporter() {
  if (transporter) return transporter;

  if (env.MAIL_USE_ETHEREAL || !env.SMTP_USER) {
    transporter = await createEtherealTransport();
    return transporter;
  }

  transporter = createEnvTransport();
  try {
    await transporter.verify();
    if (env.MAIL_LOG) {
      console.log(
        "[mail] SMTP ready on",
        `${env.SMTP_HOST}:${env.SMTP_PORT}`,
        "(secure:",
        env.SMTP_SECURE,
        ")"
      );
    }
    return transporter;
  } catch (err: any) {
    if (env.MAIL_LOG) {
      console.warn("[mail] SMTP verify failed:", err?.response || err?.message || String(err));
    }
    // Fallback ke Ethereal kalau verify gagal
    transporter = await createEtherealTransport();
    return transporter;
  }
}

/** Dapatkan alamat FROM yang aman untuk provider tertentu (misal Gmail). */
function getFrom() {
  let from = env.SMTP_FROM || env.SMTP_USER || "no-reply@example.com"
  if (isGmail) from = env.SMTP_USER
  return from
}

/** Kirim email berbasis template, termasuk logging dan Ethereal preview. */
export async function sendMailTemplate(to: string, template: MailTemplate, data: Partial<MailTemplateData>) {
  const tx = await getTransporter()
  const filled = { appName: env.APP_NAME, baseUrl: env.BASE_URL || undefined, to, ...data } as MailTemplateData
  const { subject, text, html } = renderMail(template, filled)
  try {
    const info = await tx.sendMail({
      from: getFrom(),
      to,
      subject,
      text,
      html,
      headers: isGmail ? { "X-Priority": "3", "X-Mailer": "Nodemailer" } : undefined,
    })
    if (env.MAIL_LOG) {
      console.log("[mail] MessageId:", info.messageId)
      const preview = nodemailer.getTestMessageUrl(info as any)
      if (preview) console.log("[mail] Preview URL:", preview)
      const eth = (tx as any).__ethereal
      if (eth) {
        console.log("[mail] Ethereal inbox:", eth.user)
        console.log("[mail] Ethereal preview:", nodemailer.getTestMessageUrl(info as any))
      }
    }
    return info
  } catch (err: any) {
    const details = err?.response || err?.message || String(err)
    if (env.MAIL_LOG) console.error("[mail] sendMail error:", details)
    if (isGmail) {
      console.error(
        "[mail] Gmail hint: Pastikan pakai APP PASSWORD (bukan password biasa) dan 2FA aktif. " +
          "Gunakan port 465 + SMTP_SECURE=true atau 587 + SMTP_SECURE=false."
      )
    }
    throw err
  }
}

export async function sendVerificationEmail(to: string, code: string) {
  const link = env.BASE_URL
    ? `${env.BASE_URL}/verify?email=${encodeURIComponent(to)}&code=${encodeURIComponent(code)}`
    : ''
  return sendMailTemplate(to, 'verify-code', {
    to,
    code,
    link,
    expiresMin: Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 15),
  })
}

export async function sendPasswordResetEmail(
  to: string,
  opts: { code?: string; link?: string; expiresMin?: number } = {}
) {
  return sendMailTemplate(to, 'reset-password', { to, ...opts })
}
