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
        {/* Pixel da Meta */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'SEU_PIXEL_ID_AQUI'); 
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=SEU_PIXEL_ID_AQUI&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className={roboto.className} suppressHydrationWarning>
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
