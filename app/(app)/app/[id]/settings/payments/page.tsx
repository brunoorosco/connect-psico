"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui"

import { useCurrentUser } from "@hooks/use-current-user"

import { getBankAccountAction, saveBankAccountAction } from "@/actions/payment/bankAccount"
import { updatePrepaymentAction } from "@/actions/payment/updatePrepayment"

import { PaymentTermsDialog } from "@/components/payments/PaymentsTermsDialog"
import { FancyLoader } from "@components/LoadingSpinner"

type SessionPackage = {
  id: string
  name: string
  sessions: number
  price: number
}

const PaymentSettings = () => {
  const navigate = useRouter()
  const user = useCurrentUser()

  const [showTermsDialog, setShowTermsDialog] = useState(true)
  const [loading, setLoading] = useState(false)

  const [prepaymentEnabled, setPrepaymentEnabled] = useState(false)
  const [paymentData, setPaymentData] = useState({
    accountType: "",
    bankName: "",
    agency: "",
    account: "",
    pixKey: "",
  })

  // Caso reative os pacotes futuramente
  const [packages, setPackages] = useState<SessionPackage[]>([])
  const [newPackage, setNewPackage] = useState({ name: "", sessions: "", price: "" })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true) // Ative o loading ao iniciar o fetch

      const accepted = localStorage.getItem("payment_terms_accepted")
      if (accepted === "true") {
        setShowTermsDialog(false)
      }

      if (user?.id) {
        await handleGetBankAccount(user.id)
      }
    }

    fetchData()
  }, [user?.id])

  const handleGetBankAccount = async (userId: string) => {
    try {
      setLoading(true)
      const result = await getBankAccountAction(userId)

      if (result?.success && result.data) {
        setPrepaymentEnabled(result.data.prepaymentEnabled)
        setPaymentData({
          accountType: result.data.accountType || "",
          bankName: result.data.bankName || "",
          agency: result.data.branchNumber || "",
          account: result.data.accountNumber || "",
          pixKey: result.data.pixKey || "",
        })
      }
    } catch (error) {
      console.error("Erro ao buscar conta bancária:", error)
      toast.error("Erro ao buscar informações bancárias.")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptTerms = () => {
    localStorage.setItem("payment_terms_accepted", "true")
    setShowTermsDialog(false)
    toast.info("Termos aceitos", {
      description: "Você pode agora configurar suas opções de pagamento.",
    })
  }

  const handleDeclineTerms = () => {
    navigate.push("/app")
  }

  const handlePaymentDataChange = (field: string, value: string) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSavePaymentData = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("accountType", paymentData.accountType)
      formData.append("bankName", paymentData.bankName)
      formData.append("agency", paymentData.agency)
      formData.append("account", paymentData.account)
      formData.append("pixKey", paymentData.pixKey)

      const result = await saveBankAccountAction(formData)

      if (result.success) {
        toast.success("Dados salvos com sucesso!", {
          description: "Suas informações bancárias foram atualizadas.",
        })
      } else {
        toast.error("Erro ao salvar", {
          description: JSON.stringify(result.error),
        })
      }
    } catch (e) {
      toast.error("Erro ao salvar", { description: "Tente novamente em instantes." })
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePrepayment = async (enabled: boolean) => {
    setPrepaymentEnabled(enabled)
    if (!user?.id) return
    try {
      const result = await updatePrepaymentAction(user.id, enabled)
      if (result.success) {
        toast.success(enabled ? "Pagamento prévio ativado" : "Pagamento prévio desativado")
      } else {
        toast.error("Falha ao atualizar configuração de pagamento")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar configuração de pagamento")
    }
  }

  return (
    <>
      {loading ? (
        <FancyLoader title="Carregando dados de pagamento..." />
      ) : (
        <>
          <PaymentTermsDialog
            open={showTermsDialog}
            onAccept={handleAcceptTerms}
            onDecline={handleDeclineTerms}
            blocking
          />

          <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6 max-w-6xl">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">Configurações de Pagamento</h1>
                  <p className="text-muted-foreground mt-2">
                    Gerencie suas preferências de pagamento e crie pacotes de sessões
                  </p>
                </div>

                {/* Pagamento Prévio */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pagamento Prévio</CardTitle>
                    <CardDescription>Exija que os pacientes realizem o pagamento antes da sessão</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Switch checked={prepaymentEnabled} onCheckedChange={handleTogglePrepayment} />
                      <Label>{prepaymentEnabled ? "Ativado" : "Desativado"}</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Dados Bancários */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dados para Recebimento</CardTitle>
                    <CardDescription>Informe seus dados bancários para receber pagamentos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountType">Tipo de Conta</Label>
                        <Select
                          value={paymentData.accountType}
                          onValueChange={(value) => handlePaymentDataChange("accountType", value)}
                        >
                          <SelectTrigger id="accountType">
                            <SelectValue placeholder="Selecione o tipo de conta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CHECKING">Conta Corrente</SelectItem>
                            <SelectItem value="SAVINGS">Conta Poupança</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Banco</Label>
                        <Input
                          id="bankName"
                          placeholder="Nome do Banco"
                          value={paymentData.bankName}
                          onChange={(e) => handlePaymentDataChange("bankName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agency">Agência</Label>
                        <Input
                          id="agency"
                          placeholder="0000"
                          value={paymentData.agency}
                          onChange={(e) => handlePaymentDataChange("agency", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account">Conta</Label>
                        <Input
                          id="account"
                          placeholder="00000-0"
                          value={paymentData.account}
                          onChange={(e) => handlePaymentDataChange("account", e.target.value)}
                        />
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Label htmlFor="pixKey">Chave PIX (opcional)</Label>
                      <Input
                        id="pixKey"
                        placeholder="CPF, e-mail, telefone ou chave aleatória"
                        value={paymentData.pixKey}
                        onChange={(e) => handlePaymentDataChange("pixKey", e.target.value)}
                      />
                    </div>

                    <Button onClick={handleSavePaymentData} disabled={loading} className="mt-4">
                      {loading ? "Salvando..." : "Salvar Dados Bancários"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default PaymentSettings
