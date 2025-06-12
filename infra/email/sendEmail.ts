import nodemailer from "nodemailer";

interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ from, to, subject, text, html }: SendEmailParams): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: "relay.mailbaby.net",
    port: 465,
    auth: {
      user: "mb78416",
      pass: "GEjU5gT9ewUgv6rSHCdZ",
    },
  });

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado:", info.messageId);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw error;
  }
}
