"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "../shared/Button";
import { env } from "@/config/application";
import LogoutButton from "../auth/logout-button";
import { useState } from "react";

const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
  const linkClass = isMobile
    ? "block px-3 py-2 text-base text-therapy-dark hover:bg-therapy-light"
    : "text-therapy-dark hover:text-therapy-primary transition-all-200";

  return (
    <>
      <Link href="/professionals" className={linkClass}>
        Encontrar Terapeuta
      </Link>
      <Link href="/howItWorks" className={linkClass}>
        Como Funciona
      </Link>
      <Link href="/resources" className={linkClass}>
        Recursos
      </Link>
      <Link href="/about" className={linkClass}>
        Sobre Nós
      </Link>
    </>
  );
};

const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { data: session, status } = useSession();
  const isLogged = status === "authenticated";

  if (status === "loading") {
    return <span className="text-sm text-gray-400">Carregando...</span>;
  }

  if (isLogged) {
    return (
      <>
        <Link href="/app" className={isMobile ? "w-full" : ""}>
          <Button variant="outline" className={isMobile ? "w-full" : ""}>
            Dashboard
          </Button>
        </Link>
        <LogoutButton>
          <Button variant="primary" className={isMobile ? "w-full" : ""}>
            Sair
          </Button>
        </LogoutButton>
      </>
    );
  }

  return (
    <>
      <Link href="/auth/login" className={isMobile ? "w-full" : ""}>
        <Button variant="outline" className={isMobile ? "w-full" : ""}>
          Entrar
        </Button>
      </Link>
      <Link href="/auth/signup" className={isMobile ? "w-full" : ""}>
        <Button variant="primary" className={isMobile ? "w-full" : ""}>
          Registre-se
        </Button>
      </Link>
    </>
  );
};

const MobileMenu = ({ isOpen }: { isOpen: boolean }) => (
  <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
      <NavLinks isMobile />
      <div className="pt-4 pb-2 border-t border-gray-200 flex flex-col gap-2 px-2">
        <AuthButtons isMobile />
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-therapy-primary">{env.applicationName}</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
            <AuthButtons />
          </div>

          {/* Mobile menu toggle button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-therapy-dark hover:text-therapy-primary focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Abrir menu principal</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu isOpen={isMenuOpen} />
    </nav>
  );
};

export default Navbar;
