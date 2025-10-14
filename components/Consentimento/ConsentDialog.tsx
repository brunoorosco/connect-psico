import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ConsentDialogProps {
  open: boolean
  onAccept: () => void
  onDecline: () => void
}

export const ConsentDialog = ({ open, onAccept, onDecline }: ConsentDialogProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Termo de Consentimento para Gravação de Sessão</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Conforme o Artigo 9 do Código de Ética Profissional do Psicólogo
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4 text-sm">
            <p className="font-semibold">TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO</p>

            <p>Eu, na condição de paciente, declaro estar ciente e concordo com os seguintes termos:</p>

            <div className="space-y-3">
              <div>
                <p className="font-semibold">1. Finalidade da Gravação</p>
                <p className="text-muted-foreground">
                  As sessões poderão ser gravadas momentaneamente em formato de áudio com a finalidade exclusiva de
                  transcrição automática para auxiliar o profissional de psicologia em suas anotações e registros
                  clínicos.
                </p>
              </div>

              <div>
                <p className="font-semibold">2. Conformidade com o Código de Ética</p>
                <p className="text-muted-foreground">
                  Este procedimento está em conformidade com o Artigo 9 do Código de Ética Profissional do Psicólogo
                  (Resolução CFP nº 010/05), que estabelece o dever do profissional de respeitar o sigilo profissional e
                  obter consentimento prévio para registro de informações.
                </p>
              </div>

              <div>
                <p className="font-semibold">3. Sigilo e Confidencialidade</p>
                <p className="text-muted-foreground">
                  Todas as gravações e transcrições serão mantidas sob sigilo profissional, sendo acessíveis apenas ao
                  psicólogo responsável pelo atendimento. O material não será compartilhado com terceiros sem
                  autorização expressa.
                </p>
              </div>

              <div>
                <p className="font-semibold">4. Armazenamento e Processamento</p>
                <p className="text-muted-foreground">
                  Os áudios serão processados temporariamente apenas para fins de transcrição e não serão armazenados
                  permanentemente no sistema. Apenas as transcrições textuais farão parte do prontuário clínico.
                </p>
              </div>

              <div>
                <p className="font-semibold">5. Direito de Recusa e Revogação</p>
                <p className="text-muted-foreground">
                  Você tem o direito de recusar este consentimento sem qualquer prejuízo ao seu atendimento. Caso
                  aceite, você poderá revogar este consentimento a qualquer momento, mediante comunicação ao seu
                  psicólogo.
                </p>
              </div>

              <div>
                <p className="font-semibold">6. Acesso aos Dados</p>
                <p className="text-muted-foreground">
                  Você tem direito de acessar suas transcrições e solicitar correções ou exclusões conforme previsto na
                  Lei Geral de Proteção de Dados (LGPD).
                </p>
              </div>
            </div>

            <p className="font-semibold mt-6">
              Ao clicar em "Aceitar", você confirma que leu, compreendeu e concorda com todos os termos acima descritos.
            </p>
          </div>
        </ScrollArea>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
            Recusar
          </Button>
          <Button onClick={onAccept} className="w-full sm:w-auto">
            Aceitar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
