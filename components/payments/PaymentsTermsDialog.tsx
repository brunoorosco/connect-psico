"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle } from "lucide-react"

type PaymentTermsDialogProps = {
  open: boolean
  onAccept: () => void
  onDecline: () => void
  // Se true, impede fechar por clique fora/ESC (padrão: true)
  blocking?: boolean
  // Opcionalmente, permita reagir a mudanças de open (quando blocking = false)
  onOpenChange?: (open: boolean) => void
}

export function PaymentTermsDialog({
  open,
  onAccept,
  onDecline,
  blocking = true,
  onOpenChange,
}: PaymentTermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={blocking ? undefined : onOpenChange}>
      <DialogContent
        className="max-w-3xl"
        onPointerDownOutside={blocking ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={blocking ? (e) => e.preventDefault() : undefined}
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
                A plataforma atua exclusivamente como intermediadora de pagamentos entre profissionais e pacientes, não
                assumindo responsabilidade pelos serviços profissionais prestados. O profissional é o único responsável
                pela qualidade, legalidade e conformidade dos serviços oferecidos.
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
                Todos os dados financeiros e pessoais são tratados em conformidade com a Lei Geral de Proteção de Dados
                (LGPD - Lei nº 13.709/2018). O profissional autoriza o armazenamento e processamento de seus dados
                bancários exclusivamente para fins de processamento de pagamentos.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Limitação de Responsabilidade</h3>
              <p className="text-muted-foreground">
                A plataforma não se responsabiliza por: (a) problemas técnicos de terceiros que impeçam o processamento
                de pagamentos; (b) incorreções nos dados bancários fornecidos pelo profissional; (c) disputas
                relacionadas à qualidade dos serviços prestados; (d) questões tributárias relacionadas aos recebimentos
                do profissional.
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
          <Button variant="outline" onClick={onDecline}>
            Recusar
          </Button>
          <Button onClick={onAccept}>Aceitar e Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
