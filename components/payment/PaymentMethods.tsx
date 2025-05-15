
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CreditCard, CalendarDays } from "lucide-react";

interface PaymentMethodsProps {
  price: number;
  isProcessing: boolean;
  onPayment: () => void;
}

const PaymentMethods = ({ price, isProcessing, onPayment }: PaymentMethodsProps) => {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escolha a forma de pagamento</CardTitle>
        <CardDescription>
          Selecione como deseja pagar pela sua consulta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={paymentMethod} 
          onValueChange={setPaymentMethod}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="credit-card" id="credit-card" />
            <Label htmlFor="credit-card" className="flex items-center cursor-pointer">
              <CreditCard className="h-5 w-5 mr-2" />
              Cartão de Crédito
            </Label>
          </div>

          <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="pix" id="pix" />
            <Label htmlFor="pix" className="flex items-center cursor-pointer">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.5,1.5 L6.5,4.5 L9.5,7.5 L12.5,4.5 L9.5,1.5 Z M20.5,10.5 L17.5,7.5 L14.5,10.5 L17.5,13.5 L20.5,10.5 Z M9.5,16.5 L12.5,19.5 L9.5,22.5 L6.5,19.5 L9.5,16.5 Z M1.5,10.5 L4.5,7.5 L7.5,10.5 L4.5,13.5 L1.5,10.5 Z M11,9.5 L14,9.5 L14,14.5 L9,14.5 L9,11.5 L11,11.5 L11,9.5 Z" />
              </svg>
              PIX
            </Label>
          </div>

          <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="boleto" id="boleto" />
            <Label htmlFor="boleto" className="flex items-center cursor-pointer">
              <CalendarDays className="h-5 w-5 mr-2" />
              Boleto Bancário
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onPayment} 
          disabled={isProcessing} 
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            `Pagar R$ ${price?.toFixed(2) || '0.00'}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentMethods;
