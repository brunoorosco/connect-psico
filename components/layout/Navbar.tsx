"use client"
import { useState } from "react";
import Link from "next/link";
import Button from "../shared/Button";
import { env } from "@/config/application";

const Navbar1 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-therapy-primary">{`${env.applicationName}`}</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/professionals" className="text-therapy-dark hover:text-therapy-primary transition-all-200">
              Encontrar Terapeuta
            </Link>
            <Link href="/howItWorks" className="text-therapy-dark hover:text-therapy-primary transition-all-200">
              Como Funciona
            </Link>
            <Link href="/resources" className="text-therapy-dark hover:text-therapy-primary transition-all-200">
              Recursos
            </Link>
            <Link href="/about" className="text-therapy-dark hover:text-therapy-primary transition-all-200">
              Sobre Nós
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">Entrar</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="primary" size="sm">Registra-se</Button>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-therapy-dark hover:text-therapy-primary focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menu principal</span>
              {/* Menu closed icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Menu open icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
          <Link href="/professionals" className="block px-3 py-2 rounded-md text-base font-medium text-therapy-dark hover:bg-therapy-light">
            Encontrar Terapeuta
          </Link>
          <Link href="/howItWorks" className="block px-3 py-2 rounded-md text-base font-medium text-therapy-dark hover:bg-therapy-light">
            Como Funciona
          </Link>
          <Link href="/resources" className="block px-3 py-2 rounded-md text-base font-medium text-therapy-dark hover:bg-therapy-light">
            Recursos
          </Link>
          <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-therapy-dark hover:bg-therapy-light">
            Sobre Nós
          </Link>
          <div className="pt-4 pb-2 border-t border-gray-200">
            <div className="flex items-center px-3 space-x-3">
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full">Entrar</Button>
              </Link>
              <Link href="/auth/signup" className="w-full">
                <Button variant="primary" className="w-full">Registre-se</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar1;
