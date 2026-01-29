// app/app/layout.tsx (ajuste o caminho conforme seu projeto)
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import Navbar from "./app/navbar"
import { CallFloatingWindow } from "@components/videoChat/CallFloatingWindow"
import { SocketProvider } from "@/infra/contexts/SocketContext"
import ConsentGate from "@components/Consentimento/ConsentGate"
import { acceptConsent, declineConsent, getConsentStatus } from "@/actions/consent"
import { cache } from "react"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/")
  if (session.user.isNewProfile) redirect(`/onboarding/${session.user.id}`)

  // Decide SSR se abrir modal
  const getConsent = cache(getConsentStatus)
  const status = await getConsent()
  const shouldOpen = !!(status.loggedIn && session.user.role === "DEFAULT" && !status.hasRecordedChoice)

  // Bind das actions p/ uso no cliente via startTransition/FormData
  const acceptAction = async (fd: FormData) => {
    "use server"
    const version = String(fd.get("consentVersion") ?? "v1")
    await acceptConsent(version)
  }
  const declineAction = async (fd: FormData) => {
    "use server"
    const version = String(fd.get("consentVersion") ?? "v1")
    await declineConsent(version)
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      <SocketProvider>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex-1">
            <Navbar />
            {/* Gate do consentimento logo abaixo da navbar, sem bloquear o restante */}
            <ConsentGate shouldOpen={shouldOpen} acceptAction={acceptAction} declineAction={declineAction} />
            <main className="max-w-8xl mx-auto">{children}</main>
          </div>
          <CallFloatingWindow />
        </SidebarProvider>
      </SocketProvider>
    </div>
  )
}
