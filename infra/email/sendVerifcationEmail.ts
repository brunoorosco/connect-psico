import { sendEmail } from "./sendEmail";

type SendEmailResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function sendVerificationEmail(
  emailTo: string,
  verificationUrl: string
): Promise<SendEmailResponse> {
  const VERIFICATION_SUBJECT = "Confirme seu e-mail - Psiconnect";
  const url = "https://api.orostec.online/psiconnect/" + verificationUrl.replace("https://", "");
  console.log(url);
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333;">Confirmação de E-mail</h2>
      <p>Olá,</p>
      <p>Obrigado por se registrar. Para ativar sua conta, confirme seu e-mail clicando no botão abaixo:</p>
      <p style="text-align: center;">
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
          Confirmar E-mail
        </a>
      </p>
      <p>Ou copie e cole este link no navegador:</p>
     <div style="display: flex; align-items: center; gap: 8px; max-width: 400px;">
      <p id="link-text" title=${url}
        style="margin: 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">
        ${url}
      </p>

      <button onclick="copyLink()" style="border: none; background: transparent; cursor: pointer;" title="Copiar">
        📋
      </button>
    </div>
      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">Se você não solicitou este e-mail, pode ignorá-lo.</p>
      <p style="font-size: 12px; color: #999;">Orostec - Todos os direitos reservados.</p>
    </div>
  `;
  try {
    const data = await sendEmail({
      from: '"Psiconnect" <noreply@orostec.online>',
      subject: VERIFICATION_SUBJECT,
      to: emailTo,
      text: "Validação de E-mail",
      html: htmlContent,
    });
    console.log(data);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      //@ts-ignore
      error: err?.message || "Erro desconhecido ao enviar o e-mail.",
    };
  }
}
