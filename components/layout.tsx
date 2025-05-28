import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/app/(app)/app/navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    return redirect("/");
  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1">
          <Navbar />
          <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-6 py-2">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
