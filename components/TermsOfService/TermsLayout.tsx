'use client'
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type Section = {
  id: string;
  title: string;
  icon?: React.ReactNode;
};

const sections: Section[] = [
  { id: "introduction", title: "Introdução", icon: <FileText className="h-4 w-4" /> },
  { id: "definitions", title: "Definições" },
  { id: "user-eligibility", title: "Elegibilidade do Usuário" },
  { id: "accounts", title: "Contas" },
  { id: "services", title: "Serviços" },
  { id: "data-privacy", title: "Privacidade de Dados" },
  { id: "confidentiality", title: "Confidencialidade" },
  { id: "user-obligations", title: "Obrigações do Usuário" },
  { id: "professional-obligations", title: "Obrigações do Profissional" },
  { id: "term-termination", title: "Prazo & Rescisão" },
  { id: "liability", title: "Responsabilidade" },
  { id: "intellectual-property", title: "Propriedade Intelectual" },
  { id: "governing-law", title: "Lei Aplicável" },
  { id: "changes", title: "Alterações nos Termos" },
  { id: "contact", title: "Informações de Contato" },
];

interface TermsLayoutProps {
  children: React.ReactNode;
}

export const TermsLayout: React.FC<TermsLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      if (isMobile) {
        setSidebarOpen(false);
      }
    }
  };

  return (
      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <aside 
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block bg-accent border-r border-border w-full md:w-64 flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out bg-slate-200`}
        >
          <div className="p-4 sticky top-0">
            <h2 className="text-lg font-semibold mb-4">Conteúdo</h2>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <nav>
                <ul className="space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-medium"
                        onClick={() => scrollToSection(section.id)}
                      >
                        {section.icon && <span className="mr-2">{section.icon}</span>}
                        {section.title}
                      </Button>
                    </li>
                  ))}
                </ul>
              </nav>
            </ScrollArea>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-4 md:p-6 ${sidebarOpen && isMobile ? "hidden" : "block"}`}>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="max-w-3xl mx-auto">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>
    
  );
};