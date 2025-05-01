"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Navbar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const { data:session} = useSession()

  return (
    <header className='bg-white shadow-sm'>
      <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex justify-end'>
        <nav className='flex items-center space-x-4'>
          <Link
            href={`/dashboard/professional/${session?.user.id}/minha-assinatura`}
            className='text-gray-700 hover:text-gray-900'
          >
            <Button
              variant={"link"}
              className={cn(
                pathname === `/dashboard/professional/${session?.user.id}/minha-assinatura` ? "underline" : ""
              )}
            >
              Minha Assinatura
            </Button>
          </Link>
          <Link
            href={`/dashboard/professional/${session?.user.id}/profile`}
            className='text-gray-700 hover:text-gray-900'
          >
            <Button
              variant={"link"}
              className={cn(
                pathname === `/dashboard/professional/${session?.user.id}/profile`? "underline" : ""
              )}
            >
              Perfil
            </Button>
          </Link>
{/* 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='text-gray-700 hover:text-gray-900'>
                <User size={24} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='mr-4'>
              <DropdownMenuLabel className='font-light uppercase text-xs'>
                {userName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button>
                  <LogoutButton>Logout</LogoutButton>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </nav>
      </div>
    </header>
  );
}
