"use client";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlanCardProps {
  plan: {
    name: string;
    price: string;
    period: string;
    description: string;
    badge: string | null;
  };
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
  onStart: () => void;
}

export function PlanCard({ plan, features, isSelected, onSelect, onStart }: PlanCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={`relative cursor-pointer transition-transform ${
        plan.badge === "Mais Popular" ? "border-primary" : ""
      } ${isSelected ? "ring-2 ring-primary shadow-lg scale-105" : "hover:scale-105"}`}
    >
      {plan.badge && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          {plan.badge}
        </Badge>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <div className="mt-4">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-foreground">R$ {plan.price}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">por {plan.period}</p>
        </div>
        <CardDescription className="mt-4 font-medium text-primary">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isSelected ? "default" : "outline"}
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
        >
          {isSelected ? "Selecionado ✓" : "Começar Agora"}
        </Button>
      </CardFooter>
    </Card>
  );
}
