import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";
import AuthProvider from "@/components/auth/auth-provider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"], // choose the required font weights
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Psico Mais | Psicologia online e presencial",
  description:
    "Atendimento psicológico com profissionais qualificados. Marque sua consulta online ou presencial. Psicólogos especializados em saúde mental.",
  keywords: [
    "psicologia",
    "psicólogo",
    "terapia online",
    "atendimento psicológico",
    "psicólogo em São Paulo",
    "psicólogo no Rio de Janeiro",
    "psicólogo em Minas Gerais",
    "psicólogo no Brasil",
  ],
  authors: [{ name: "Psico Mais", url: "https://psicomais.com" }],
  creator: "Psico Mais",
  openGraph: {
    title: "Psico Mais | Psicologia online e presencial",
    description:
      "Plataforma de atendimento psicológico com profissionais especializados. Terapia com segurança e privacidade.",
    url: "https://psicomais.com",
    siteName: "Psico Mais",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Psico Mais | Psicologia online",
    description:
      "Terapia online com psicólogos especializados. Privacidade, acolhimento e segurança.",
  },
  metadataBase: new URL("https://psicomais.com"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={roboto.className} suppressHydrationWarning>
        <AuthProvider>
          <Toaster />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
