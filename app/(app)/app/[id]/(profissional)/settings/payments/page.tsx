"use client"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveBankAccountAction } from "@/actions/payment/bankAccount"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui"

interface SessionPackage {
  id: string
  name: string
  sessions: number
  price: number
}

const PaymentSettings = () => {
  const navigate = useRouter()
  const [showTermsDialog, setShowTermsDialog] = useState(true)
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)
  const [prepaymentEnabled, setPrepaymentEnabled] = useState(false)
  const [paymentData, setPaymentData] = useState({
    accountType: "",
    bankName: "",
    agency: "",
    account: "",
    pixKey: "",
  })

  const [packages, setPackages] = useState<SessionPackage[]>([])
  const [newPackage, setNewPackage] = useState({
    name: "",
    sessions: "",
    price: "",
  })

  useEffect(() => {
    const accepted = localStorage.getItem("payment_terms_accepted")
    if (accepted === "true") {
      setHasAcceptedTerms(true)
      setShowTermsDialog(false)
    }
  }, [])

  const handleAcceptTerms = () => {
    localStorage.setItem("payment_terms_accepted", "true")
    setHasAcceptedTerms(true)
    setShowTermsDialog(false)
    toast.info("Termos aceitos", {
      description: "Você pode agora configurar suas opções de pagamento.",
    })
  }

  const handleDeclineTerms = () => {
    navigate.push("/professional-dashboard")
  }

  const handlePaymentDataChange = (field: string, value: string) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSavePaymentData = async () => {
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
  }

  const handleAddPackage = () => {
    if (!newPackage.name || !newPackage.sessions || !newPackage.price) {
      toast.error("Erro!", {
        description: "Preencha todos os campos do pacote.",
      })
      return
    }

    const packageToAdd: SessionPackage = {
      id: Date.now().toString(),
      name: newPackage.name,
      sessions: parseInt(newPackage.sessions),
      price: parseFloat(newPackage.price),
    }

    setPackages((prev) => [...prev, packageToAdd])
    setNewPackage({ name: "", sessions: "", price: "" })

    toast("Pacote criado", { description: "O pacote de sessões foi adicionado com sucesso." })
  }

  const handleDeletePackage = (id: string) => {
    setPackages((prev) => prev.filter((pkg) => pkg.id !== id))
    toast("Pacote removido", {
      description: "O pacote foi excluído com sucesso.",
    })
  }

  return (
    <>
      <Dialog open={showTermsDialog} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-3xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-6 w-6 text-primary" />
              <DialogTitle className="text-2xl">Termos de Uso - Sistema de Pagamentos</DialogTitle>
            </div>
            <DialogDescription>Leia atentamente os termos abaixo antes de prosseguir</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold text-base mb-2">1. Taxas de Transação</h3>
                <p className="text-muted-foreground">
                  Ao aceitar estes termos, você está ciente e concorda que será aplicada uma taxa de{" "}
                  <strong>4,99%</strong> sobre todas as transações financeiras processadas através da plataforma. Esta
                  taxa será automaticamente deduzida do valor bruto de cada pagamento recebido.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">2. Prestação de Serviços de Intermediação</h3>
                <p className="text-muted-foreground">
                  A plataforma atua exclusivamente como intermediadora de pagamentos entre profissionais e pacientes,
                  não assumindo responsabilidade pelos serviços profissionais prestados. O profissional é o único
                  responsável pela qualidade, legalidade e conformidade dos serviços oferecidos.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">3. Responsabilidades do Profissional</h3>
                <p className="text-muted-foreground mb-2">O profissional declara e garante que:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Possui todas as licenças, certificações e autorizações necessárias para exercer sua profissão</li>
                  <li>Está em conformidade com todas as leis aplicáveis, incluindo o Código de Ética Profissional</li>
                  <li>As informações bancárias fornecidas são verdadeiras e de sua titularidade</li>
                  <li>Informará seus pacientes sobre todas as condições de pagamento</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">4. Processamento de Pagamentos</h3>
                <p className="text-muted-foreground">
                  Os pagamentos serão processados e transferidos para a conta bancária cadastrada em até 2 (dois) dias
                  úteis após a confirmação da transação, já deduzidas as taxas aplicáveis. A plataforma não se
                  responsabiliza por atrasos causados por instituições financeiras terceiras.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">5. Política de Cancelamento e Reembolso</h3>
                <p className="text-muted-foreground">
                  Em caso de cancelamento de sessão ou solicitação de reembolso, o profissional deve seguir sua própria
                  política de cancelamento previamente informada ao paciente. A plataforma poderá intermediar disputas,
                  mas a decisão final sobre reembolsos cabe ao profissional, conforme legislação vigente e normas do
                  conselho de classe.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">6. Proteção de Dados</h3>
                <p className="text-muted-foreground">
                  Todos os dados financeiros e pessoais são tratados em conformidade com a Lei Geral de Proteção de
                  Dados (LGPD - Lei nº 13.709/2018). O profissional autoriza o armazenamento e processamento de seus
                  dados bancários exclusivamente para fins de processamento de pagamentos.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">7. Limitação de Responsabilidade</h3>
                <p className="text-muted-foreground">
                  A plataforma não se responsabiliza por: (a) problemas técnicos de terceiros que impeçam o
                  processamento de pagamentos; (b) incorreções nos dados bancários fornecidos pelo profissional; (c)
                  disputas relacionadas à qualidade dos serviços prestados; (d) questões tributárias relacionadas aos
                  recebimentos do profissional.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">8. Modificações nos Termos</h3>
                <p className="text-muted-foreground">
                  A plataforma se reserva o direito de modificar estes termos mediante notificação prévia de 30 (trinta)
                  dias. O uso continuado dos serviços após as modificações constitui aceitação dos novos termos.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">9. Foro</h3>
                <p className="text-muted-foreground">
                  Fica eleito o foro da comarca da sede da plataforma para dirimir quaisquer questões oriundas destes
                  termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
                </p>
              </section>

              <section className="pt-2 border-t">
                <p className="text-muted-foreground italic">
                  Ao clicar em "Aceitar e Continuar", você declara ter lido, compreendido e concordado integralmente com
                  todos os termos acima descritos.
                </p>
              </section>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleDeclineTerms}>
              Recusar
            </Button>
            <Button onClick={handleAcceptTerms}>Aceitar e Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-6xl">
          <Button variant="ghost" onClick={() => navigate.push("/professional-dashboard")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>

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
                  <Switch checked={prepaymentEnabled} onCheckedChange={setPrepaymentEnabled} />
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

                <Button onClick={handleSavePaymentData} className="mt-4">
                  Salvar Dados Bancários
                </Button>
              </CardContent>
            </Card>

            {/* Pacotes de Sessões */}
            <Card>
              <CardHeader>
                <CardTitle>Pacotes de Sessões</CardTitle>
                <CardDescription>Crie pacotes com quantidade de sessões e valores fechados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="packageName">Nome do Pacote</Label>
                    <Input
                      id="packageName"
                      placeholder="Ex: Pacote Mensal"
                      value={newPackage.name}
                      onChange={(e) => setNewPackage((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessions">Qtd. de Sessões</Label>
                    <Input
                      id="sessions"
                      type="number"
                      min="1"
                      placeholder="4"
                      value={newPackage.sessions}
                      onChange={(e) => setNewPackage((prev) => ({ ...prev, sessions: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Valor (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="400.00"
                      value={newPackage.price}
                      onChange={(e) => setNewPackage((prev) => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={handleAddPackage} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Pacote
                </Button>

                {packages.length > 0 && (
                  <>
                    <Separator />
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome do Pacote</TableHead>
                            <TableHead className="text-center">Sessões</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {packages.map((pkg) => (
                            <TableRow key={pkg.id}>
                              <TableCell className="font-medium">{pkg.name}</TableCell>
                              <TableCell className="text-center">{pkg.sessions}</TableCell>
                              <TableCell className="text-right">R$ {pkg.price.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePackage(pkg.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default PaymentSettings
