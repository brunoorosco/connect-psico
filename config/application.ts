export const env = {
  applicationName: process.env.NEXT_PUBLIC_APPLICATION_NAME,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  apikeyMailerSender: process.env.TOKEN_MAILERSEND,
  version: "1.0.0",
  apiKeyBabyMail: process.env.API_KEY_BABY_MAIL,
  nodemailerHost: process.env.NODEMAILER_HOST,
  nodemailerPort: Number(process.env.NODEMAILER_PORT),
  nodemailerUser: process.env.NODEMAILER_USER,
  nodemailerPassword: process.env.NODEMAILER_PASS,
  baseUrlPsicomaisApi: process.env.NEXT_PUBLIC_BASE_URL_API_PSICOMAIS as string,
}
