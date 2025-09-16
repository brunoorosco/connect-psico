import { Alert, AlertDescription, AlertTitle, Button } from "@components/ui"
import { AlertCircle } from "lucide-react"

export function LoginBanner({ onOpenLogin }: { onOpenLogin: () => void }) {
  return (
    <Alert className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>É necessário estar logado</AlertTitle>
      <AlertDescription>
        Para finalizar o agendamento você precisa estar logado.{" "}
        <Button variant="link" onClick={onOpenLogin}>
          Fazer login
        </Button>
      </AlertDescription>
    </Alert>
  )
}
