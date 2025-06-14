"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // ou troque pela sua lib de auth

export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
console.log(session)
  useEffect(() => {
    if (status !== "loading" && session?.user?.role === "SUPERVISOR" && !session.user.isProfileCompleted) {
      const profilePath = `/app/professional/${session.user.id}/profile`;

      if (!pathname.startsWith(profilePath)) {
        router.replace(profilePath);
      }
    }
  }, [status, session, pathname, router]);

  if (status === "loading") return null; // ou spinner

  return <>{children}</>;
}
