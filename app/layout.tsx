import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Roboto } from "next/font/google"
import { Toaster } from "sonner"
import AuthProvider from "@/components/auth/auth-provider"
import type { Metadata } from "next"
import Script from "next/script"
import { metadados } from "@/config/metadados"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"], // choose the required font weights
})

export const metadata: Metadata = metadados

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a73e8" />
        {/* Pixel da Meta */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),
      dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-N4G8M847');
  `}
        </Script>

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),
      dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-N4G8M847');
  `}
        </Script>

        {/* End Google Tag Manager */}
      </head>
      <body className={roboto.className} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1213333984238010&ev=PageView&noscript=1"
          />
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N4G8M847"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <AuthProvider>
          <Toaster expand={true} richColors closeButton={true} />
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
