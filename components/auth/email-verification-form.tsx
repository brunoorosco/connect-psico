"use client"
import { verifyToken } from "@/actions/auth"
import { useSearchParams, useRouter } from "next/navigation"
import React, { useEffect, useState, useRef } from "react"
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react"

const EmailVerificationForm = () => {
  const [error, setError] = useState<string | undefined>(undefined)
  const [success, setSuccess] = useState<string | undefined>(undefined)
  const [isVerifying, setIsVerifying] = useState(false)
  const hasVerified = useRef(false) // Flag para evitar múltiplas execuções
  const searchParam = useSearchParams()
  const router = useRouter()

  const token = searchParam?.get("token")

  // Verificação automática (executa apenas uma vez)
  useEffect(() => {
    // Se já verificou, não executa novamente
    if (hasVerified.current) return
    
    if (!token) {
      setError("Token inválido ou ausente")
      return
    }

    hasVerified.current = true
    setIsVerifying(true)

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
        setError("Algo deu errado. Tente novamente mais tarde.")
        setSuccess(undefined)
      })
      .finally(() => {
        setIsVerifying(false)
      })
  }, [token])

  // Redirecionamento após sucesso
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/auth/login")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success, router])

  // Validação inicial do token
  if (!searchParam || !token) {
    return (
      <div className="flex flex-1 justify-center items-center min-h-screen bg-gradient-to-br from-psicomais-light to-psicomais-secondary p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-psicomais-secondary">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text--dark">Link Inválido</h2>
              <p className="text-gray-600">
                O link de verificação que você acessou está inválido ou expirou.
              </p>
              <button
                onClick={() => router.push("/auth/login")}
                className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-psicomais-primary/90 transition-colors font-medium"
              >
                Voltar ao Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Função para tentar novamente
  const handleRetry = () => {
    hasVerified.current = false
    setError(undefined)
    setSuccess(undefined)
    setIsVerifying(true)

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
        setError("Algo deu errado. Tente novamente mais tarde.")
        setSuccess(undefined)
      })
      .finally(() => {
        setIsVerifying(false)
        hasVerified.current = true
      })
  }

  return (
    <div className="flex flex-1 justify-center items-center min-h-screen bg-gradient-to-br from-psicomais-light to-psicomais-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-psicomais-secondary">
          {/* Header */}
          <div className="bg-gradient-to-r from-psicomais-primary to-psicomais-purple-wisdom p-8 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verificação de E-mail</h1>
          </div>

          {/* Content */}
          <div className="p-8">
            {isVerifying && !success && !error && (
              <div className="flex flex-col items-center text-center space-y-4 py-8">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-secondary rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <h3 className="text-lg font-semibold text--dark">Verificando...</h3>
                <p className="text-gray-600">Aguarde enquanto confirmamos seu e-mail.</p>
              </div>
            )}

            {success && (
              <div className="flex flex-col items-center text-center space-y-4 py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text--dark">E-mail Verificado!</h3>
                <p className="text-gray-600">{success}</p>
                <div className="mt-4 w-full bg-psicomais-secondary rounded-lg p-4">
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecionando para o login em instantes...
                  </p>
                </div>
              </div>
            )}

            {error && !success && (
              <div className="flex flex-col items-center text-center space-y-4 py-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text--dark">Erro na Verificação</h3>
                <p className="text-gray-600">{error}</p>
                <div className="flex flex-col gap-3 w-full mt-4">
                  <button
                    onClick={handleRetry}
                    disabled={isVerifying}
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? "Verificando..." : "Tentar Novamente"}
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="w-full px-6 py-3 bg-secondary text--dark rounded-lg hover:bg-secondary/80 transition-colors font-medium"
                  >
                    Voltar ao Login
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-secondary px-8 py-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text--primary">PsicoMais</span> - Cuidando da sua saúde mental
            </p>
          </div>
        </div>

        {/* Informação adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Precisa de ajuda?{" "}
            <a href="mailto:suporte@psicomais.com" className="text--primary hover:underline font-medium">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationForm