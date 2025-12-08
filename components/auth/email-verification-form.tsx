"use client"
import { verifyToken } from "@/actions/auth"
import { useSearchParams, useRouter } from "next/navigation"
import React, { useCallback, useEffect, useState } from "react"
import AuthCard from "./auth-card"
import AuthFormMessage from "./auth-form-message"

const EmailVerificationForm = () => {
  const [error, setError] = useState<string | undefined>(undefined)
  const [success, setSuccess] = useState<string | undefined>(undefined)
  const searchParam = useSearchParams()
  const router = useRouter()
  if (!searchParam || searchParam.get("token") === null) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <AuthCard title="Verificação inválida">
          <AuthFormMessage
            type="error"
            title="Token não encontrado"
            message="O link que você acessou está inválido ou expirou."
          />
        </AuthCard>
      </div>
    )
  }
  const token = searchParam.get("token")

  const automaticSubmission = useCallback(() => {
    if (error || success) return

    if (!token) {
      setError("Token inválido")
      return
    }

    verifyToken(token)
      .then((data) => {
        if (data.success) {
          setSuccess(data.success)
          setError(undefined)
        } else {
          setError(data.error)
          setSuccess(undefined)
        }
      })
      .catch(() => {
        setError("Algo deu errado")
        setSuccess(undefined)
      })
  }, [token, success, error])

  useEffect(() => {
    automaticSubmission()
  }, [automaticSubmission])

  // Redirecionamento após sucesso
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/app")
      }, 2000) // Aguarda 2 segundos antes de redirecionar

      return () => clearTimeout(timer)
    }
  }, [success, router])

  return (
    <div className="flex flex-1 justify-center items-center">
      <AuthCard title="Verifique seu E-mail">
        {success && <AuthFormMessage title="Sucesso" type="success" message={success} />}
        {error && <AuthFormMessage title="Encontramos um problema" type="error" message={error} />}
      </AuthCard>
    </div>
  )
}

export default EmailVerificationForm
