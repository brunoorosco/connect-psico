import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const hmtlEmail = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333;">Código de Verificação</h2>
      <p>Olá,</p>
      <p>Use o código abaixo para concluir sua verificação:</p>
      <div style="font-size: 32px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0;">
        testetetete
      </div>
      <p>Este código é válido por apenas alguns minutos. Não compartilhe com ninguém.</p>
      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">Se você não solicitou este código, ignore este e-mail.</p>
      <p style="font-size: 12px; color: #999;">Orostec - Todos os direitos reservados.</p>
    </div>
  `

export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: 'relay.mailbaby.net',
    port: 465,
    auth: {
      user: 'mb78416',
      pass: 'GEjU5gT9ewUgv6rSHCdZ',
    },
  });

  const mailOptions = {
    from: '"Bruno Orosco" <contato@orostec.online>',
    to,
    subject,
    text,
    html:hmtlEmail,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}
