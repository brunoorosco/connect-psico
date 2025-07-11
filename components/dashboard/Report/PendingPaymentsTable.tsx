import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { PendingPayment } from './types';
import { mockPendingPayments } from './mockDashboardData';


type Props = {
  onPaymentClick: (payment: PendingPayment) => void;
};

const PendingPaymentsTable = ({ onPaymentClick }: Props) => {
  const getStatusBadge = (status: PendingPayment['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pendente</Badge>;
      case 'overdue': return <Badge variant="destructive">Vencido</Badge>;
      case 'paid': return <Badge variant="default">Pago</Badge>;
      default: return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Pagamentos Pendentes
        </CardTitle>
        <CardDescription>Consultas com pagamento em aberto</CardDescription>
      </CardHeader>
      <CardContent>
        {mockPendingPayments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Data da Consulta</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPendingPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.patientName}</TableCell>
                  <TableCell>{new Date(payment.consultationDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell title={payment.description} className="truncate max-w-xs">{payment.description}</TableCell>
                  <TableCell className="font-bold">R$ {payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      className="bg-psychology-primary hover:bg-psychology-primary/90"
                      onClick={() => onPaymentClick(payment)}
                    >
                      Processar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum pagamento pendente no momento
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingPaymentsTable;
