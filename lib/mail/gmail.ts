import { google } from "googleapis";
import { createMimeEmail } from "./mimeEmail";

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI,
  GMAIL_REFRESH_TOKEN,
  GMAIL_SENDER,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: GMAIL_REFRESH_TOKEN,
});

export async function sendRecoveryEmailGmailAPI(to: string, token: string) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const subject = "Recuperação de Senha";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #4CAF50;">Recuperação de Senha</h2>
      <p>Utilize o seguinte token para recuperar sua senha:</p>
      <p style="font-size: 24px; font-weight: bold; color: #333;">${token}</p>
      <p>Se você não solicitou esta recuperação, ignore este email.</p>
    </div>
  `;

  const raw = createMimeEmail(to, subject, htmlContent, GMAIL_SENDER!);

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });
}
