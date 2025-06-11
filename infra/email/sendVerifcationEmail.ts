import axios, { AxiosError } from "axios";
import { env } from "@/config/application";

type SendEmailResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
): Promise<SendEmailResponse> {
  const VERIFICATION_SUBJECT = "Confirme seu e-mail - Psiconnect";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333;">Confirmação de E-mail</h2>
      <p>Olá,</p>
      <p>Obrigado por se registrar. Para ativar sua conta, confirme seu e-mail clicando no botão abaixo:</p>
      <p style="text-align: center;">
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
          Confirmar E-mail
        </a>
      </p>
      <p>Ou copie e cole este link no navegador:</p>
      <p style="word-break: break-all; color: #555;">${verificationUrl}</p>
      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">Se você não solicitou este e-mail, pode ignorá-lo.</p>
      <p style="font-size: 12px; color: #999;">Orostec - Todos os direitos reservados.</p>
    </div>
  `;

  try {
    const { data } = await axios.post(
      "https://api.mailbaby.net/mail/send",
      {
        from: "onboarding@orostec.online",
        to: email,
        subject: VERIFICATION_SUBJECT,
        body: htmlContent,
      },
      {
        headers: {
          "X-API-KEY": env.apiKeyBabyMail || "",
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, data };
  } catch (err) {
    const error = err as AxiosError;

    return {
      success: false,
      error: error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message || "Erro desconhecido ao enviar o e-mail.",
    };
  }
}
