import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import Navbar from "./app/navbar"
import { CallFloatingWindow } from "@components/videoChat/CallFloatingWindow"
import { SocketProvider } from "@/infra/contexts/SocketContext"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) return redirect("/")

  if (session.user.isNewProfile === true) return redirect(`/onboarding/${session.user.id}`)
  console.log("layout.tsx:14", session.user)

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      <SocketProvider>
        {" "}
        {/* ✅ Aqui é onde o provider é adicionado */}
        <SidebarProvider>
          <AppSidebar />
          <div className="flex-1">
            <Navbar />
            <main className="max-w-8xl mx-auto">{children}</main>
          </div>
          <CallFloatingWindow />
        </SidebarProvider>
      </SocketProvider>
    </div>
  )
}
