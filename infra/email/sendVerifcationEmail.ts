import { sendEmail } from "./sendEmail"

type SendEmailResponse = {
  success: boolean
  data?: any
  error?: string
}

export async function sendVerificationEmail(emailTo: string, verificationUrl: string): Promise<SendEmailResponse> {
  const VERIFICATION_SUBJECT = "Confirme seu e-mail - PsicoMais"
  const currentYear = new Date().getFullYear()

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmação de E-mail</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(107, 68, 140, 0.12); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #6B448C 0%, #8B5CF6 100%); padding: 40px 40px 32px; text-align: center;">
                  <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                    <img src="https://img.icons8.com/fluency/48/approval.png" alt="Check" style="width: 40px; height: 40px;" />
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                    Confirme seu E-mail
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px; color: #111827; font-size: 16px; line-height: 1.6;">
                    Olá! 👋
                  </p>
                  <p style="margin: 0 0 8px; color: #4b5563; font-size: 15px; line-height: 1.7;">
                    Obrigado por se cadastrar no <strong style="color: #6B448C;">PsicoMais</strong>! 🎉
                  </p>
                  <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.7;">
                    Para ativar sua conta e começar a usar nossos serviços, confirme seu e-mail clicando no botão abaixo:
                  </p>

                  <!-- Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding: 8px 0 32px;">
                        <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #6B448C 0%, #8B5CF6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(107, 68, 140, 0.4);">
                          Confirmar meu e-mail
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Info Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="background-color: #EFEBF0; border-left: 4px solid #6B448C; border-radius: 8px; padding: 16px;">
                        <p style="margin: 0; color: #111827; font-size: 13px; line-height: 1.6;">
                          ✨ <strong>Após confirmar</strong>, você terá acesso completo a todas as funcionalidades da plataforma.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Se você não criou uma conta no PsicoMais, pode ignorar este e-mail com segurança.
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 40px;">
                  <hr style="border: none; border-top: 1px solid #EFEBF0; margin: 0;" />
                </td>
              </tr>

              <!-- Alternative Link -->
              <tr>
                <td style="padding: 24px 40px;">
                  <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
                    Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
                  </p>
                  <p style="margin: 0; word-break: break-all;">
                    <a href="${verificationUrl}" style="color: #6B448C; font-size: 12px; text-decoration: underline;">
                      ${verificationUrl}
                    </a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #EFEBF0; padding: 24px 40px; text-align: center; border-top: 1px solid #EFEBF0;">
                  <p style="margin: 0 0 8px; color: #6B448C; font-size: 13px; font-weight: 500;">
                    PsicoMais
                  </p>
                  <p style="margin: 0 0 16px; color: #6b7280; font-size: 12px;">
                    Cuidando da sua saúde mental
                  </p>
                  <div style="margin-bottom: 16px;">
                     <a href="https://www.instagram.com/psicomais.br" style="display: inline-block; margin: 0 6px; color: #9ca3af; text-decoration: none;">
                      <img src="https://img.icons8.com/fluency/24/instagram-new.png" alt="Instagram" style="width: 20px; height: 20px;" />
                    </a>
                  </div>
                  <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                    © ${currentYear} Orostec. Todos os direitos reservados.
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
                    Você recebeu este e-mail porque uma conta foi criada com este endereço.
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
Confirmação de E-mail - PsicoMais

Olá!

Obrigado por se cadastrar no PsicoMais! 🎉

Para ativar sua conta e começar a usar nossos serviços, confirme seu e-mail acessando o link abaixo:
${verificationUrl}

Após confirmar, você terá acesso completo a todas as funcionalidades da plataforma.

Se você não criou uma conta no PsicoMais, pode ignorar este e-mail com segurança.

---
© ${currentYear} Orostec. Todos os direitos reservados.
Este é um e-mail automático, por favor não responda.
  `.trim()

  try {
    const data = await sendEmail({
      from: '"PsicoMais" <noreply@psicomais.com>',
      subject: VERIFICATION_SUBJECT,
      to: emailTo,
      text: textContent,
      html: htmlContent,
    })

    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro desconhecido ao enviar o e-mail.",
    }
  }
}