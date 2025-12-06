import { sendEmail } from "./sendEmail";

type SendEmailResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function sendOtpEmail(
  emailTo: string,
  otpCode: string
): Promise<SendEmailResponse> {
  const OTP_SUBJECT = "Seu código de verificação - PsicoMais";
  const currentYear = new Date().getFullYear();

  // Separa os dígitos do OTP para exibição estilizada
  const otpDigits = otpCode.split("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Código de Verificação</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 40px 32px; text-align: center;">
                  <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                    <img src="https://img.icons8.com/fluency/48/keyhole-shield.png" alt="Shield" style="width: 40px; height: 40px;" />
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                    Código de Verificação
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
                    Use o código abaixo para concluir sua verificação no <strong>PsicoMais</strong>:
                  </p>

                  <!-- OTP Code Display -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding: 24px 0;">
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px dashed #3b82f6; border-radius: 16px; padding: 24px 32px; display: inline-block;">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              ${otpDigits
                                .map(
                                  (digit) => `
                                <td style="padding: 0 6px;">
                                  <div style="width: 48px; height: 56px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: #1e40af; line-height: 56px; text-align: center;">
                                    ${digit}
                                  </div>
                                </td>
                              `
                                )
                                .join("")}
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Copy Code Text -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding: 0 0 24px;">
                        <p style="margin: 0; color: #6b7280; font-size: 13px;">
                          Seu código: <strong style="color: #1e40af; font-size: 16px; letter-spacing: 4px;">${otpCode}</strong>
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Warning Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px;">
                        <p style="margin: 0 0 8px; color: #92400e; font-size: 13px; line-height: 1.6;">
                          ⏱️ <strong>Este código expira em 10 minutos.</strong>
                        </p>
                        <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                          🔒 Nunca compartilhe este código com ninguém.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Se você não solicitou este código, pode ignorar este e-mail. Sua conta permanece segura.
                  </p>
                </td>
              </tr>

              <!-- Security Tips -->
              <tr>
                <td style="padding: 0 40px 32px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td>
                        <p style="margin: 0 0 12px; color: #475569; font-size: 13px; font-weight: 600;">
                          🛡️ Dicas de segurança:
                        </p>
                        <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 12px; line-height: 1.8;">
                          <li>O PsicoMais nunca pedirá seu código por telefone</li>
                          <li>Não compartilhe seu código em redes sociais</li>
                          <li>Verifique sempre se está no site oficial</li>
                        </ul>
                      </td>
                    </tr>
                  </table>
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
                    <a href="#" style="display: inline-block; margin: 0 6px;">
                      <img src="https://img.icons8.com/fluency/24/facebook-new.png" alt="Facebook" style="width: 20px; height: 20px;" />
                    </a>
                    <a href="#" style="display: inline-block; margin: 0 6px;">
                      <img src="https://img.icons8.com/fluency/24/linkedin.png" alt="LinkedIn" style="width: 20px; height: 20px;" />
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
                    Você recebeu este e-mail porque uma verificação foi solicitada para sua conta.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
Código de Verificação - PsicoMais

Olá!

Use o código abaixo para concluir sua verificação no PsicoMais:

═══════════════════
    ${otpCode}
═══════════════════

⚠️ IMPORTANTE:
• Este código expira em 10 minutos
• Nunca compartilhe este código com ninguém
• O PsicoMais nunca pedirá seu código por telefone

Se você não solicitou este código, pode ignorar este e-mail. Sua conta permanece segura.

---
© ${currentYear} Orostec. Todos os direitos reservados.
Este é um e-mail automático, por favor não responda.
  `.trim();

  try {
    const data = await sendEmail({
      from: '"PsicoMais" <noreply@psicomais.com>',
      subject: OTP_SUBJECT,
      to: emailTo,
      text: textContent,
      html: htmlContent,
    });

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro desconhecido ao enviar e-mail OTP.",
    };
  }
}
