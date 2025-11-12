import { cn } from "@/lib/utils"

interface PaymentSelectorProps {
  paymentMethod: "pix" | "credit" | null
  setPaymentMethod: (method: "pix" | "credit" | null) => void
  errorPayment: boolean
  setErrorPayment: (value: boolean) => void
}

export function PaymentSelector({
  paymentMethod,
  setPaymentMethod,
  errorPayment,
  setErrorPayment,
}: PaymentSelectorProps) {
  return (
    <div
      className={cn(
        "flex gap-4 p-3 rounded-md border transition-all mt-4",
        errorPayment ? "border-red-500 bg-red-50" : "border-gray-200"
      )}
    >
      <button
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
        onClick={() => {
          setPaymentMethod("credit")
          setErrorPayment(false)
        }}
        hidden
        className={cn(
          "px-4 py-2 rounded-md border text-sm transition-all",
          paymentMethod === "credit" ? "bg-blue-100 border-blue-500 text-blue-700" : "hover:bg-blue-50"
        )}
      >
        Cartão de Crédito
      </button>
    </div>
  )
}
