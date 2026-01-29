import { sendEmail } from "./sendEmail";

type SendEmailResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

type WelcomeEmailParams = {
  emailTo: string;
  userName: string;
  userType: "DEFAULT" | "SUPERVISOR"; // paciente ou profissional
};

export async function sendWelcomeEmail({
  emailTo,
  userName,
  userType,
}: WelcomeEmailParams): Promise<SendEmailResponse> {
  const WELCOME_SUBJECT = "Bem-vindo à PsicoMais! 🎉";
  const currentYear = new Date().getFullYear();

  // Conteúdo personalizado por tipo de usuário
  const isProfessional = userType === "SUPERVISOR";
  const greeting = isProfessional
    ? `Olá, ${userName}! 👋`
    : `Olá, ${userName}! 👋`;
  
  const introText = isProfessional
    ? "Seja bem-vindo(a) à plataforma que vai transformar a forma como você gerencia seus atendimentos!"
    : "Seja bem-vindo(a) à plataforma que vai cuidar da sua saúde mental!";

  const features = isProfessional
    ? [
        { icon: "📅", title: "Agenda Digital", desc: "Gerencie seus atendimentos com praticidade" },
        { icon: "🎥", title: "Videochamadas", desc: "Realize sessões online com qualidade" },
        { icon: "📝", title: "Prontuário Eletrônico", desc: "Registre e organize suas consultas" },
        { icon: "📊", title: "Relatórios", desc: "Acompanhe seu desempenho profissional" },
      ]
    : [
        { icon: "🔍", title: "Encontre seu Terapeuta", desc: "Profissionais qualificados esperando por você" },
        { icon: "📅", title: "Agende Online", desc: "Marque suas sessões com facilidade" },
        { icon: "🎥", title: "Sessões Remotas", desc: "Atendimento de onde você estiver" },
        { icon: "🔒", title: "Privacidade Total", desc: "Seus dados protegidos e confidenciais" },
      ];

  const ctaText = isProfessional
    ? "Completar Meu Perfil"
    : "Encontrar Meu Terapeuta";

  const ctaLink = isProfessional
    ? "https://psicomais.com/app/configuracoes/perfil"
    : "https://psicomais.com/app/profissionais";

  // Features HTML
  const featuresHtml = features
    .map(
      (feature) => `
        <tr>
          <td style="padding: 12px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;">
                  <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #EFEBF0 0%, #f3eff5 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                    ${feature.icon}
                  </div>
                </td>
                <td style="vertical-align: top; padding-left: 12px;">
                  <p style="margin: 0 0 4px; color: #1f2937; font-size: 14px; font-weight: 600; line-height: 1.4;">
                    ${feature.title}
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                    ${feature.desc}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo à PsicoMais</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f6fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f6fa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(107, 68, 140, 0.08);">
              
              <!-- Header -->
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #6B448C 0%, #533568 100%); padding: 48px 40px 40px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.15); border-radius: 20px; backdrop-filter: blur(10px);">
                        <img src="https://img.icons8.com/fluency/64/brain.png" alt="Brain" width="48" height="48" style="display: block;" />
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    Bem-vindo ao PsicoMais! 🎉
                  </h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 15px;">
                    Estamos felizes em ter você conosco
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px; color: #1f2937; font-size: 17px; line-height: 1.6;">
                    ${greeting}
                  </p>
                  <p style="margin: 0 0 32px; color: #4b5563; font-size: 15px; line-height: 1.7;">
                    ${introText}
                  </p>

                  <!-- Welcome Card -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background: linear-gradient(135deg, #EFEBF0 0%, #f3eff5 100%); border-radius: 16px; padding: 28px; border: 2px solid #d8cfe0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td align="center" style="padding-bottom: 20px;">
                              <div style="width: 56px; height: 56px; background-color: #ffffff; border-radius: 14px; box-shadow: 0 4px 12px rgba(107, 68, 140, 0.15); display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                <img src="https://img.icons8.com/fluency/48/rocket.png" alt="Rocket" width="32" height="32" style="display: block;" />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <h2 style="margin: 0 0 12px; color: #6B448C; font-size: 20px; font-weight: 600;">
                                Tudo pronto para começar!
                              </h2>
                              <p style="margin: 0; color: #5a4a6a; font-size: 14px; line-height: 1.6;">
                                ${isProfessional 
                                  ? "Complete seu perfil profissional e comece a atender seus pacientes."
                                  : "Explore nossa plataforma e encontre o profissional ideal para você."
                                }
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" style="padding: 32px 0;">
                        <a href="${ctaLink}" style="display: inline-block; background: linear-gradient(135deg, #6B448C 0%, #533568 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(107, 68, 140, 0.35);">
                          ${ctaText} →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Features Section -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding: 8px 0 16px;">
                        <h3 style="margin: 0; color: #1f2937; font-size: 17px; font-weight: 600;">
                          O que você pode fazer:
                        </h3>
                      </td>
                    </tr>
                    ${featuresHtml}
                  </table>
                </td>
              </tr>

              <!-- Help Section -->
              <tr>
                <td style="padding: 0 40px 32px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 12px;">
                    <tr>
                      <td style="padding: 24px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="padding-right: 16px; vertical-align: top;">
                              <div style="width: 40px; height: 40px; background-color: #EFEBF0; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                💡
                              </div>
                            </td>
                            <td>
                              <p style="margin: 0 0 8px; color: #6B448C; font-size: 14px; font-weight: 600;">
                                Precisa de ajuda?
                              </p>
                              <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                                Nossa equipe está pronta para ajudar você. Entre em contato pelo chat ou envie um e-mail para 
                                <a href="mailto:suporte@psicomais.com" style="color: #6B448C; text-decoration: none;">suporte@psicomais.com</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; font-weight: 600;">
                          PsicoMais
                        </p>
                        <p style="margin: 0 0 20px; color: #9ca3af; font-size: 13px;">
                          Cuidando da sua saúde mental
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="padding: 0 8px;">
                              <a href="https://instagram.com/psicomais" style="text-decoration: none;">
                                <img src="https://img.icons8.com/fluency/24/instagram-new.png" alt="Instagram" width="24" height="24" style="display: block;" />
                              </a>
                            </td>
                            <td style="padding: 0 8px;">
                              <a href="https://facebook.com/psicomais" style="text-decoration: none;">
                                <img src="https://img.icons8.com/fluency/24/facebook-new.png" alt="Facebook" width="24" height="24" style="display: block;" />
                              </a>
                            </td>
                            <td style="padding: 0 8px;">
                              <a href="https://linkedin.com/company/psicomais" style="text-decoration: none;">
                                <img src="https://img.icons8.com/fluency/24/linkedin.png" alt="LinkedIn" width="24" height="24" style="display: block;" />
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 20px 0 0; color: #9ca3af; font-size: 11px;">
                          © ${currentYear} Orostec. Todos os direitos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>

            <!-- Sub Footer -->
            <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px;">
              <tr>
                <td align="center" style="padding: 24px 20px;">
                  <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.6;">
                    Você recebeu este e-mail porque criou uma conta no PsicoMais.<br />
                    Se você não criou esta conta, por favor ignore este e-mail.
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
Bem-vindo ao PsicoMais! 🎉

${greeting}

${introText}

═══════════════════════════════════════════

🚀 TUDO PRONTO PARA COMEÇAR!

${isProfessional 
  ? "Complete seu perfil profissional e comece a atender seus pacientes."
  : "Explore nossa plataforma e encontre o profissional ideal para você."
}

➜ ${ctaText}: ${ctaLink}

═══════════════════════════════════════════

O QUE VOCÊ PODE FAZER:

${features.map(f => `${f.icon} ${f.title}\n   ${f.desc}`).join('\n\n')}

═══════════════════════════════════════════

💡 PRECISA DE AJUDA?

Nossa equipe está pronta para ajudar você.
Entre em contato: suporte@psicomais.com

---
PsicoMais - Cuidando da sua saúde mental
© ${currentYear} Orostec. Todos os direitos reservados.

Você recebeu este e-mail porque criou uma conta no PsicoMais.
Se você não criou esta conta, por favor ignore este e-mail.
  `.trim();

  try {
    const data = await sendEmail({
      from: '"PsicoMais" <noreply@psicomais.com>',
      subject: WELCOME_SUBJECT,
      to: emailTo,
      text: textContent,
      html: htmlContent,
    });

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: (err as Error)?.message || "Erro desconhecido ao enviar e-mail de boas-vindas.",
    };
  }
}