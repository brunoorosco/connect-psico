import { sendEmail } from "./sendEmail"

type SendEmailResponse = {
  success: boolean
  data?: any
  error?: string
}

export async function sendPasswordResetEmail(emailTo: string, resetUrl: string): Promise<SendEmailResponse> {
  const RESET_SUBJECT = "Redefinição de Senha - PsicoMais"
  const currentYear = new Date().getFullYear()

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinição de Senha</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 32px; text-align: center;">
                  <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                    <img src="https://img.icons8.com/fluency/48/lock-2.png" alt="Lock" style="width: 40px; height: 40px;" />
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                    Redefinição de Senha
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                    Olá! 👋
                  </p>
                  <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.7;">
                    Recebemos uma solicitação para redefinir a senha da sua conta <strong>PsicoMais</strong>. Clique no botão abaixo para criar uma nova senha:
                  </p>

                  <!-- Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding: 8px 0 32px;">
                        <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); transition: all 0.2s ease;">
                          Redefinir minha senha
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Warning Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px;">
                        <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                          ⏱️ <strong>Este link expira em 1 hora</strong> por motivos de segurança.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Se você não solicitou essa alteração, pode ignorar este e-mail com segurança. Sua senha permanecerá a mesma.
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 40px;">
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;" />
                </td>
              </tr>

              <!-- Alternative Link -->
              <tr>
                <td style="padding: 24px 40px;">
                  <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                    Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
                  </p>
                  <p style="margin: 0; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #6366f1; font-size: 12px; text-decoration: underline;">
                      ${resetUrl}
                    </a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; font-weight: 500;">
                    PsicoMais
                  </p>
                  <p style="margin: 0 0 16px; color: #9ca3af; font-size: 12px;">
                    Cuidando da sua saúde mental
                  </p>
                  <div style="margin-bottom: 16px;">
                    <a href="https://www.instagram.com/psicomais.oficial" style="display: inline-block; margin: 0 6px; color: #9ca3af; text-decoration: none;">
                      <img src="https://img.icons8.com/fluency/24/instagram-new.png" alt="Instagram" style="width: 20px; height: 20px;" />
                    </a>
                    <a href="#" style="display: inline-block; margin: 0 6px; color: #9ca3af; text-decoration: none;">
                      <img src="https://img.icons8.com/fluency/24/facebook-new.png" alt="Facebook" style="width: 20px; height: 20px;" />
                    </a>
                    <a href="#" style="display: inline-block; margin: 0 6px; color: #9ca3af; text-decoration: none;">
                      <img src="https://img.icons8.com/fluency/24/linkedin.png" alt="LinkedIn" style="width: 20px; height: 20px;" />
                    </a>
                  </div>
                  <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                    © ${currentYear} Psicomais. Todos os direitos reservados.
                  </p>
                </td>
              </tr>

            </table>

            <!-- Sub Footer -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px;">
              <tr>
                <td style="padding: 24px 20px; text-align: center;">
                  <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.6;">
                    Este é um e-mail automático, por favor não responda.<br />
                    Você recebeu este e-mail porque há uma conta PsicoMais associada a este endereço.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textContent = `
Redefinição de Senha - PsicoMais

Olá!

Recebemos uma solicitação para redefinir a senha da sua conta PsicoMais.

Para criar uma nova senha, acesse o link abaixo:
${resetUrl}

⚠️ Este link expira em 1 hora por motivos de segurança.

Se você não solicitou essa alteração, pode ignorar este e-mail com segurança. Sua senha permanecerá a mesma.

---
© ${currentYear} Orostec. Todos os direitos reservados.
Este é um e-mail automático, por favor não responda.
  `.trim()

  try {
    const data = await sendEmail({
      from: '"PsicoMais" <noreply@psicomais.com>',
      subject: RESET_SUBJECT,
      to: emailTo,
      text: textContent,
      html: htmlContent,
    })

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro desconhecido ao enviar e-mail de redefinição.",
    }
  }
}
