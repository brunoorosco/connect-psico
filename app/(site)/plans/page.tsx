"use client"
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PlansGrid } from "@/components/plans/PlansGrid";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Escolha o Plano Ideal</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Potencialize seu atendimento com uma plataforma completa e simples de usar
          </p>
        </div>

        <PlansGrid />

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Tem dúvidas? Fale conosco!</p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              window.location.href = "/agendar-demonstracao";
            }}
          >
            Agendar Demonstração
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
