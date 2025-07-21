"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlanCard } from "./PlanCard";

const plans = [
  {
    name: "Mensal",
    price: "89,90",
    period: "mês",
    description: "Ideal para começar",
    badge: null
  },
  {
    name: "Semestral",
    price: "509,40",
    period: "6 meses",
    description: "R$ 84,90/mês - Economize R$ 30",
    badge: "Mais Popular"
  },
  {
    name: "Anual",
    price: "958,80",
    period: "12 meses",
    description: "R$ 79,90/mês - Economize R$ 120",
    badge: "Melhor Valor"
  }
];

const features = [
  "Gestão de pacientes",
  "Evolução clínica do paciente",
  "Chat em tempo real com o paciente",
  "Videochamada com o paciente",
  "Gestão de disponibilidade",
  "Recursos para consultas",
  "Emissão e compartilhamento de receitas",
  "Emissão e compartilhamento de atestados médicos",
  "Confirmação automática 48h antes da consulta",
  "Visibilidade na plataforma"
];

export function PlansGrid() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = (planName: string) => {
    setSelectedPlan(planName);
    router.push(`/checkout?plano=${planName.toLowerCase()}`);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <PlanCard
          key={plan.name}
          plan={plan}
          features={features}
          isSelected={selectedPlan === plan.name}
          onSelect={() => setSelectedPlan(plan.name)}
          onStart={() => handleCheckout(plan.name)}
        />
      ))}
    </div>
  );
}
