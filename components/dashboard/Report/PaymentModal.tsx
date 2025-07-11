import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, Building } from 'lucide-react';
import { PaymentMethod, PendingPayment } from './types';
import { mockPaymentMethods } from './mockDashboardData';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PendingPayment | null;
}

const PaymentModal = ({ isOpen, onClose, payment }: PaymentModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const getPaymentIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'pix':
        return <Smartphone className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const handlePayment = () => {
    // Aqui seria integrada a operadora de pagamento
    console.log('Processando pagamento:', {
      payment,
      method: selectedMethod,
      cardDetails: selectedMethod.includes('card') ? cardDetails : null
    });
    
    // Simular sucesso do pagamento
    alert('Pagamento processado com sucesso!');
    onClose();
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Processar Pagamento</DialogTitle>
          <DialogDescription>
            Complete o pagamento da consulta pendente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detalhes do Pagamento */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Paciente:</span>
                <span className="font-medium">{payment.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Data:</span>
                <span className="font-medium">{new Date(payment.consultationDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Descrição:</span>
                <span className="font-medium text-sm">{payment.description}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>R$ {payment.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Métodos de Pagamento */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Método de Pagamento</Label>
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              {mockPaymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="flex items-center space-x-2 flex-1">
                    {getPaymentIcon(method.type)}
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      {method.name}
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Formulário de Cartão */}
          {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
            <div className="space-y-4 border-t pt-4">
              <Label className="text-base font-medium">Dados do Cartão</Label>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="cardName">Nome no Cartão</Label>
                  <Input
                    id="cardName"
                    placeholder="Nome conforme impresso no cartão"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cardExpiry">Validade</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/AA"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      placeholder="000"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              {/* Espaço para integração com operadora */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Área de Integração:</strong> Aqui será inserido o checkout da operadora de pagamento (Stripe, PagSeguro, etc.)
                </p>
              </div>
            </div>
          )}

          {/* PIX */}
          {selectedMethod === 'pix' && (
            <div className="border-t pt-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>PIX:</strong> Após confirmar, será gerado um QR Code para pagamento via PIX.
                </p>
              </div>
            </div>
          )}

          {/* Transferência Bancária */}
          {selectedMethod === 'bank_transfer' && (
            <div className="border-t pt-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <strong>Transferência:</strong> Dados bancários serão enviados para o paciente após confirmação.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={!selectedMethod}
            className="bg-psychology-primary hover:bg-psychology-primary/90"
          >
            Processar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;