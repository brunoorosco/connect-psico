"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/logout-button";

export default function Navbar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className='bg-white shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-3 flex justify-end'>
        <nav className='flex items-center space-x-4'>
          <Link href='/dashboard' className='text-gray-700 hover:text-gray-900'>
            <Button
              variant={"link"}
              className={cn(pathname === "/dashboard" ? "underline" : "")}
            >
              Supervisor
            </Button>
          </Link>
          <Link
            href='/dashboard/minha-assinatura'
            className='text-gray-700 hover:text-gray-900'
          >
            <Button
              variant={"link"}
              className={cn(
                pathname === "/dashboard/minha-assinatura" ? "underline" : ""
              )}
            >
              Minha Assinatura
            </Button>
          </Link>

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
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
