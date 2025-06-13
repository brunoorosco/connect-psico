import { sendEmail } from "./sendEmail";

type SendEmailResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function sendPasswordResetEmail(
  emailTo: string,
  resetUrl: string
): Promise<SendEmailResponse> {
  const RESET_SUBJECT = "Redefinição de Senha - Psiconnect";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333;">Redefinir sua Senha</h2>
      <p>Olá,</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Para continuar, clique no botão abaixo:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 5px;">
          Redefinir Senha
        </a>
      </p>
      <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
      <p style="word-break: break-all; color: #555;">${resetUrl}</p>
      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">Este link expira em 1 hora por motivos de segurança.</p>
      <p style="font-size: 12px; color: #999;">Orostec - Todos os direitos reservados.</p>
    </div>
  `;

  try {
    const data = await sendEmail({
        from: '"Psiconnect" <noreply@orostec.online>',
        subject: RESET_SUBJECT,
        to: emailTo,
        text: "Verificação de Código OTP",
        html: htmlContent,
      });
    
        return { success: true, data };
      } catch (err) {
        
        return {
          success: false,
        //@ts-ignore
          error: err?.message || "Erro desconhecido ao enviar e-mail de redefinição.",
    };
  }
}
