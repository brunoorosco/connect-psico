import { sendEmail } from "./sendEmail";

type SendEmailResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function sendOtpEmail(emailTo: string, otpCode: string): Promise<SendEmailResponse> {
  const OTP_SUBJECT = "Seu código de verificação - PsicoMais";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333;">Código de Verificação</h2>
      <p>Olá,</p>
      <p>Use o código abaixo para concluir sua verificação:</p>
      <div style="font-size: 32px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0;">
        ${otpCode}
      </div>
      <p>Este código é válido por apenas alguns minutos. Não compartilhe com ninguém.</p>
      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">Se você não solicitou este código, ignore este e-mail.</p>
      <p style="font-size: 12px; color: #999;">Orostec - Todos os direitos reservados.</p>
    </div>
  `;

  try {
      
 const data = await sendEmail({
    from: '"PsicoMais" <noreply@orostec.online>',
    subject: OTP_SUBJECT,
    to: emailTo,
    text: "Verificação de Código OTP",
    html: htmlContent,
  });

    return { success: true, data };
  } catch (err) {
    
    return {
      success: false,
    //@ts-ignore
      error: err?.message || "Erro desconhecido ao enviar e-mail OTP.",
    };
  }
}
