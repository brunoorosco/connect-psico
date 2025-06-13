import { env } from "@/config/application";
import nodemailer from "nodemailer";

interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async ({ from, to, subject, text, html }: SendEmailParams) => {
 
  const transporter = nodemailer.createTransport({
    host: env.nodemailerHost,
    port: env.nodemailerPort,
    auth: {
      user: env.nodemailerUser,
      pass: env.nodemailerPassword,
    },
  });

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return { error };
  }
};
