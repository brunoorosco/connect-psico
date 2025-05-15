import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const SubscriptionPlansPreview = () => {
  const navigate = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planos de Assinatura</CardTitle>
        <CardDescription>Economize com nossos planos de assinatura mensal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full justify-between py-8"
          onClick={() => navigate.push("/subscription-plans")}
        >
          <div className="text-left">
            <h3 className="font-semibold text-lg">Plano Básico</h3>
            <p className="text-muted-foreground">2 consultas por mês</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">R$ 199,90/mês</p>
            <p className="text-muted-foreground text-sm">Economize 15%</p>
          </div>
        </Button>

        <Button
          className="w-full justify-between py-8"
          onClick={() => navigate.push("/subscription-plans")}
        >
          <div className="text-left">
            <h3 className="font-semibold text-lg">Plano Premium</h3>
            <p className="text-primary-foreground">4 consultas por mês</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">R$ 349,90/mês</p>
            <p className="text-primary-foreground text-sm">Economize 25%</p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPlansPreview;
