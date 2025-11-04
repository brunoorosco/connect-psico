import { env } from "@/config/application"
import nodemailer, { SendMailOptions } from "nodemailer"

interface SendEmailParams {
  from?: string
  to: string
  subject: string
  text?: string
  html?: string
  attachments?: SendMailOptions["attachments"]
}

export const sendEmail = async ({ from, to, subject, text, html, attachments }: SendEmailParams) => {
  try {
    const transporter = nodemailer.createTransport({
      host: env.nodemailerHost,
      port: env.nodemailerPort,
      secure: env.nodemailerPort === 465, // SSL se porta 465
      auth: {
        user: env.nodemailerUser,
        pass: env.nodemailerPassword,
      },
      tls: {
        rejectUnauthorized: false, // opcional, mas útil para ambientes dev
      },
    })

    // Valida conexão
    await transporter.verify().catch((err) => {
      console.warn("⚠️ SMTP não verificado:", err.message)
    })

    const mailOptions: SendMailOptions = {
      from: from || `"PsicoMais" <${env.nodemailerUser}>`,
      to,
      subject,
      text,
      html,
      attachments,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`📧 E-mail enviado para ${to}: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error("❌ Erro ao enviar e-mail:", error.message)
    return { success: false, error: error.message }
  }
}
