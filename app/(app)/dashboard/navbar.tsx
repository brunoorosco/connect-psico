"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import MobileDrawer from "@/components/MobileDrawer";
import { useEffect, useState } from "react";

export default function Navbar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleResize();
    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex justify-end">
        {isMobile ? (
          <MobileDrawer
            userRole={session?.user.role.toLowerCase() as "admin" | "supervisor" | "default"}
          />
        ) : (
          <nav className="flex items-center space-x-4">
            {session?.user.role === "SUPERVISOR" && (
              <>
                <Link
                  href={`/dashboard/professional/${session?.user.id}/minha-assinatura`}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Button
                    variant={"link"}
                    className={cn(
                      pathname === `/dashboard/professional/${session?.user.id}/minha-assinatura`
                        ? "underline"
                        : ""
                    )}
                  >
                    Minha Assinatura
                  </Button>
                </Link>
                <Link
                  href={`/dashboard/professional/${session?.user.id}/profile`}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Button
                    variant={"link"}
                    className={cn(
                      pathname === `/dashboard/professional/${session?.user.id}/profile`
                        ? "underline"
                        : ""
                    )}
                  >
                    Perfil
                  </Button>
                </Link>
              </>
            )}
            {session?.user.role === "DEFAULT" && (
              <>
                <Link
                  href={`/dashboard/users/${session?.user.id}/minha-assinatura`}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Button
                    variant={"link"}
                    className={cn(
                      pathname === `/dashboard/users/${session?.user.id}/minha-assinatura`
                        ? "underline"
                        : ""
                    )}
                  >
                    Minha Assinatura
                  </Button>
                </Link>
                <Link
                  href={`/dashboard/users/${session?.user.id}/profile`}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Button
                    variant={"link"}
                    className={cn(
                      pathname === `/dashboard/users/${session?.user.id}/profile` ? "underline" : ""
                    )}
                  >
                    Perfil
                  </Button>
                </Link>
              </>
            )}
              {session?.user.role === "ADMIN" && (
              <>
                <Link
                  href={`/dashboard/admin/${session?.user.id}/minha-assinatura`}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Button
                    variant={"link"}
                    className={cn(
                      pathname === `/dashboard/admin/${session?.user.id}/minha-assinatura`
                        ? "underline"
                        : ""
                    )}
                  >
                    Minha Assinatura
                  </Button>
                </Link>
                <Link
                  href={`/dashboard/admin/${session?.user.id}/profile`}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Button
                    variant={"link"}
                    className={cn(
                      pathname === `/dashboard/admin/${session?.user.id}/profile` ? "underline" : ""
                    )}
                  >
                    Perfil
                  </Button>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
