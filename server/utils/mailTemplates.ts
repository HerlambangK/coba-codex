export type MailTemplate = 'verify-code' | 'reset-password'

export interface MailTemplateData {
  appName: string
  baseUrl?: string
  to?: string
  code?: string
  link?: string
  expiresMin?: number
}

export function renderMail(template: MailTemplate, data: MailTemplateData) {
  function emailLayout(subject: string, appName: string, bodyHtml: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body{background:#f7fafc;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;color:#111827;margin:0;padding:0}
    .container{max-width:600px;margin:24px auto;padding:24px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb}
    .header{font-weight:700;font-size:18px;margin-bottom:16px;color:#111827}
    .content{font-size:14px;line-height:1.6;color:#111827}
    .footer{margin-top:24px;font-size:12px;color:#6b7280}
    a{color:#2563eb}
  </style>
  </head>
  <body>
    <div class="container">
      <div class="header">${appName}</div>
      <div class="content">${bodyHtml}</div>
      <div class="footer">This is an automated message. Please do not reply.</div>
    </div>
  </body>
</html>`
  }
  switch (template) {
    case 'verify-code': {
      const subject = `${data.appName} - Email Verification`
      const text = [
        `Your ${data.appName} verification code is ${data.code}.`,
        data.link ? `You can also click the link to verify: ${data.link}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const innerHtml =
        `<p>Your ${data.appName} verification code is <strong>${data.code}</strong>.</p>` +
        (data.link
          ? `<p>You can also click the link below to verify:</p><p><a href="${data.link}">${data.link}</a></p>`
          : '')

      const html = emailLayout(subject, data.appName, innerHtml)

      return { subject, text, html }
    }
    case 'reset-password': {
      const subject = `${data.appName} - Password Reset`
      const text = [
        `We received a request to reset your password.`,
        data.code ? `Reset code: ${data.code}` : '',
        data.link ? `You can reset using this link: ${data.link}` : '',
        data.expiresMin ? `This request expires in ${data.expiresMin} minutes.` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const innerHtml =
        `<p>We received a request to reset your password.</p>` +
        (data.code ? `<p>Reset code: <strong>${data.code}</strong></p>` : '') +
        (data.link ? `<p>You can reset using this link:</p><p><a href="${data.link}">${data.link}</a></p>` : '') +
        (data.expiresMin ? `<p>This request expires in ${data.expiresMin} minutes.</p>` : '')

      const html = emailLayout(subject, data.appName, innerHtml)

      return { subject, text, html }
    }
  }
}
