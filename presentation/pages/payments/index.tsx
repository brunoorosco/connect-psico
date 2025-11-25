"use client"
import React, { startTransition, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, Smartphone, Building, DollarSignIcon, Landmark, Banknote } from "lucide-react"
import { useRouter } from "next/navigation"
import { PaymentModel } from "@/domain/model/payment"
import { getPaymentsByPatient } from "@/actions/payment/getPaymentByPatient"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const PaymentHistory = () => {
  const router = useRouter()
  const [listPayments, setListPayments] = useState<PaymentModel[]>([])

  useEffect(() => {
    startTransition(() => {
      getPaymentsByPatient()
        .then((data) => {
          setListPayments(data)
          //   toast.dismiss(toastId);
        })
        .catch(() => {
          // toast.dismiss(toastId);
          toast.error("Erro ao carregar disponibilidade")
        })
    })
  }, [])

  const getStatusLabel = (status: PaymentModel["status"]) => {
    switch (status) {
      case "PAID":
        return "Pago"
      case "CANCELED":
        return "Cancelado"
      case "PENDING":
        return "Pendente"
      case "REFUNDED":
        return "Devolução"
      case "FAILED":
        return "Falha no Pagamento"
      default:
        return "-"
    }
  }

  const getStatusBadge = (status: PaymentModel["status"]) => {
    const baseStyle = "text-xs font-semibold px-4 py-2 rounded-full"

    switch (status) {
      case "PAID":
        return cn(baseStyle, "bg-green-100 text-green-700")

      case "CANCELED":
        return cn(baseStyle, "bg-gray-100 text-gray-400")

      case "PENDING":
        return cn(baseStyle, "bg-yellow-100 text-yellow-700")

      case "REFUNDED":
        return cn(baseStyle, "bg-blue-100 text-blue-700")

      case "FAILED":
        return cn(baseStyle, "bg-red-100 text-red-700")

      default:
        return cn(baseStyle, "bg-gray-100 text-gray-700")
    }
  }

  const getPaymentTypeLabel = (type: PaymentModel["type"]) => {
    if (!type) return "-"

    switch (type) {
      case "PIX":
        return (
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span>PIX</span>
          </div>
        )
      case "CREDIT_CARD":
        return (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Cartão de Crédito</span>
          </div>
        )
      case "DEBIT_CARD":
        return (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Cartão de Débito</span>
          </div>
        )
      case "TRANSFER_BANK":
        return (
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            <span>Transferência Bancária</span>
          </div>
        )
      case "CASH":
        return (
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            <span>Dinheiro</span>
          </div>
        )
      default:
        return "-"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back button */}
          <Button variant="ghost" onClick={() => router.push("/professional-dashboard")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>

          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Histórico de Pagamentos</h2>
            <p className="text-gray-600 dark:text-gray-400">Visualize todos os pagamentos realizados e pendentes</p>
          </div>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Pagamentos
              </CardTitle>
              <CardDescription>Histórico completo de pagamentos de sessões</CardDescription>
            </CardHeader>
            <CardContent>
              {listPayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead>Sessão</TableHead> */}
                      <TableHead>Data da Sessão</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Terapeuta</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data do Pagamento</TableHead>
                      <TableHead>Tipo de Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listPayments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        {/* <pre>{JSON.stringify(payment)}</pre> */}
                        {/* <TableCell className="font-medium">{payment.id}</TableCell> */}
                        <TableCell>{new Date(payment.appointmentDate).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="font-bold">
                          R$ {(payment.payment.amountCents / 100).toFixed(2) ?? 0}
                        </TableCell>
                        <TableCell>{payment.professional.name}</TableCell>
                        <TableCell>
                          <span className={getStatusBadge(payment.payment.status)}>
                            {getStatusLabel(payment.payment.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment.payment.paidAt ? new Date(payment.payment.paidAt).toLocaleDateString("pt-BR") : "-"}
                        </TableCell>
                        <TableCell>{getPaymentTypeLabel(payment.payment.type)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhum pagamento registrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default PaymentHistory
