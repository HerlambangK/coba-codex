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
  switch (template) {
    case 'verify-code': {
      const subject = `${data.appName} - Email Verification`
      const text = [
        `Your ${data.appName} verification code is ${data.code}.`,
        data.link ? `You can also click the link to verify: ${data.link}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const html =
        `<p>Your ${data.appName} verification code is <strong>${data.code}</strong>.</p>` +
        (data.link
          ? `<p>You can also click the link below to verify:</p><p><a href="${data.link}">${data.link}</a></p>`
          : '')

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

      const html =
        `<p>We received a request to reset your password.</p>` +
        (data.code ? `<p>Reset code: <strong>${data.code}</strong></p>` : '') +
        (data.link ? `<p>You can reset using this link:</p><p><a href="${data.link}">${data.link}</a></p>` : '') +
        (data.expiresMin ? `<p>This request expires in ${data.expiresMin} minutes.</p>` : '')

      return { subject, text, html }
    }
  }
}

