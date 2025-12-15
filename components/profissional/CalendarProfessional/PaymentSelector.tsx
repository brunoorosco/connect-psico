"use client"

import InputMask from "react-input-mask"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface PaymentSelectorProps {
  paymentMethod: "pix" | "credit" | null
  setPaymentMethod: (method: "pix" | "credit" | null) => void
  errorPayment: boolean
  setErrorPayment: (value: boolean) => void
  pixCpf: string
  onChangePixCpf: (value: string) => void
  setCpfError: (value: string | null) => void
  cpfError?: string | null
}

export function PaymentSelector({
  paymentMethod,
  setPaymentMethod,
  errorPayment,
  setErrorPayment,
  pixCpf,
  onChangePixCpf,
  setCpfError,
  cpfError,
}: PaymentSelectorProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3 rounded-md border transition-all mt-4",
        errorPayment ? "border-red-500 bg-red-50" : "border-gray-200"
      )}
    >
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            setPaymentMethod("pix")
            setErrorPayment(false)
          }}
          className={cn(
            "px-4 py-2 rounded-md border text-sm transition-all",
            paymentMethod === "pix" ? "bg-green-100 border-green-500 text-green-700" : "hover:bg-green-50"
          )}
        >
          PIX
        </button>

        <button
          type="button"
          onClick={() => {
            setPaymentMethod("credit")
            setErrorPayment(false)
            setCpfError(null)
          }}
          className={cn(
            "px-4 py-2 rounded-md border text-sm transition-all",
            paymentMethod === "credit" ? "bg-blue-100 border-blue-500 text-blue-700" : "hover:bg-blue-50"
          )}
        >
          Cartão de Crédito
        </button>
      </div>

      {paymentMethod === "pix" && (
        <div>
          <label className="text-xs font-medium uppercase text-muted-foreground">CPF para pagamento PIX</label>
          <InputMask
            mask="999.999.999-99"
            value={pixCpf}
            onChange={(event) => {
              onChangePixCpf(event.target.value)
              setCpfError(null)
            }}
          >
            {(inputProps: any) => <Input {...inputProps} placeholder="000.000.000-00" />}
          </InputMask>
          <p className={cn("text-xs mt-1", cpfError ? "text-red-600" : "text-muted-foreground")}>
            {cpfError ?? "Obrigatório para gerar a cobrança PIX."}
          </p>
        </div>
      )}
    </div>
  )
}
