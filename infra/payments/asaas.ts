// services/asaas.service.ts
import axios, { AxiosInstance, AxiosError } from "axios"
import type {
  AsaasConfig,
  CustomerData,
  CobrancaData,
  LinkPagamentoData,
  CobrancaPixData,
  PagamentoCartaoData,
  PixQrCode,
  AsaasResponse,
} from "./asaas.types"

export class AsaasService {
  private api: AxiosInstance
  private apiKey: string
  private baseURL: string

  constructor(config: AsaasConfig) {
    this.apiKey = config.apiKey
    this.baseURL = config.environment === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3"

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
        access_token: this.apiKey,
      },
    })
  }

  /**
   * Cria uma cobrança no Asaas
   */
  async criarCobranca(data: CobrancaData): Promise<any> {
    try {
      const payload: any = {
        customer: data.customer,
        billingType: data.billingType,
        value: data.value,
        dueDate: data.dueDate,
        description: data.description,
        externalReference: data.externalReference,
        discount: data.discount,
        fine: data.fine,
        interest: data.interest,
        postalService: data.postalService || false,
      }

      if (data.billingType === "CREDIT_CARD") {
        payload.creditCard = data.creditCard
        payload.creditCardHolderInfo = data.creditCardHolderInfo
        payload.remoteIp = data.remoteIp
        payload.installmentCount = data.installmentCount
        payload.installmentValue = data.installmentValue
      }

      const response = await this.api.post("/payments", payload)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Cria um link de pagamento
   */
  async criarLinkPagamento(data: LinkPagamentoData): Promise<any> {
    try {
      const payload: any = {
        name: data.name,
        description: data.description,
        billingType: data.billingType || "UNDEFINED",
        chargeType: data.chargeType || "DETACHED",
        value: data.value,
        dueDateLimitDays: data.dueDateLimitDays,
        notificationEnabled: data.notificationEnabled ?? true,
      }

      if (data.billingType === "CREDIT_CARD" || data.billingType === "UNDEFINED") {
        payload.maxInstallmentCount = data.maxInstallmentCount
      }

      if (data.chargeType === "RECURRENT") {
        payload.endDate = data.endDate
        payload.subscriptionCycle = data.subscriptionCycle
      }

      const response = await this.api.post("/paymentLinks", payload)
      return response.data
    } catch (error) {
      console.error(error)
      throw this.handleError(error)
    }
  }

  /**
   * Busca dados de uma cobrança
   */
  async buscarCobranca(paymentId: string): Promise<any> {
    try {
      const response = await this.api.get(`/payments/${paymentId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Gera QR Code PIX para uma cobrança
   */
  async gerarQrCodePix(paymentId: string): Promise<PixQrCode> {
    try {
      const response = await this.api.get(`/payments/${paymentId}/pixQrCode`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Estorna uma cobrança (total ou parcial)
   */
  async estornarCobranca(paymentId: string, value?: number, description?: string): Promise<any> {
    try {
      const payload: any = {
        description: description || "Estorno solicitado",
      }

      if (value !== undefined && value !== null) {
        payload.value = value
      }

      const response = await this.api.post(`/payments/${paymentId}/refund`, payload)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Cancela uma cobrança
   */
  async cancelarCobranca(paymentId: string): Promise<any> {
    try {
      const response = await this.api.delete(`/payments/${paymentId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Cria um cliente no Asaas
   */
  async criarCliente(customerData: CustomerData): Promise<any> {
    try {
      const response = await this.api.post("/customers", customerData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Busca um cliente
   */
  async buscarCliente(customerId: string): Promise<any> {
    try {
      const response = await this.api.get(`/customers/${customerId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Lista cobranças com filtros
   */
  async listarCobrancas(filters: Record<string, any> = {}): Promise<any> {
    try {
      const response = await this.api.get("/payments", { params: filters })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Processa pagamento com cartão de crédito
   */
  async pagarComCartao(data: PagamentoCartaoData): Promise<any> {
    try {
      const payload = {
        customer: data.customer,
        billingType: "CREDIT_CARD" as const,
        value: data.value,
        dueDate: data.dueDate,
        description: data.description,
        installmentCount: data.installmentCount || 1,
        installmentValue: data.installmentValue,
        creditCard: data.creditCard,
        creditCardHolderInfo: data.creditCardHolderInfo,
        remoteIp: data.remoteIp,
        externalReference: data.externalReference,
      }

      const response = await this.api.post("/payments", payload)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Cria cobrança PIX com QR Code
   */
  async criarCobrancaPix(data: CobrancaPixData): Promise<any> {
    try {
      const payload = {
        customer: data.customer,
        billingType: "PIX" as const,
        value: data.value,
        dueDate: data.dueDate,
        description: data.description,
        externalReference: data.externalReference,
      }

      const response = await this.api.post("/payments", payload)

      if (response.data.id) {
        const qrCode = await this.gerarQrCodePix(response.data.id)
        return {
          ...response.data,
          pix: qrCode,
        }
      }

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Verifica status de um pagamento
   */
  async verificarStatusPagamento(paymentId: string): Promise<any> {
    try {
      const response = await this.api.get(`/payments/${paymentId}/status`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Trata erros da API
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>
      if (axiosError.response) {
        const { status, data } = axiosError.response
        return new Error(`Erro Asaas [${status}]: ${JSON.stringify(data.errors || data)}`)
      }
    }
    return error as Error
  }
}

// // hooks/useAsaas.ts - Hook customizado para uso nos componentes
// ;("use client")

// import { useState } from "react"

// interface UseAsaasOptions {
//   onSuccess?: (data: any) => void
//   onError?: (error: Error) => void
// }

// export const useAsaas = (options?: UseAsaasOptions) => {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<Error | null>(null)

//   const callApi = async (action: string, data: any) => {
//     setLoading(true)
//     setError(null)

//     try {
//       const response = await fetch("/api/asaas", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ action, data }),
//       })

//       const result = await response.json()

//       if (!result.success) {
//         throw new Error(result.error)
//       }

//       options?.onSuccess?.(result.data)
//       return result.data
//     } catch (err: any) {
//       setError(err)
//       options?.onError?.(err)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }

//   const criarLinkPagamento = (data: any) => callApi("criar_link_pagamento", data)
//   const criarCobrancaPix = (data: any) => callApi("criar_cobranca_pix", data)
//   const pagarComCartao = (data: any) => callApi("pagar_cartao", data)
//   const estornar = (data: any) => callApi("estornar", data)
//   const buscarCobranca = (paymentId: string) => callApi("buscar_cobranca", { paymentId })

//   return {
//     loading,
//     error,
//     criarLinkPagamento,
//     criarCobrancaPix,
//     pagarComCartao,
//     estornar,
//     buscarCobranca,
//   }
// }

/* 
EXEMPLO DE USO EM UM COMPONENTE:

'use client';

import { useAsaas } from '@/hooks/useAsaas';

export default function PagamentoPage() {
  const { loading, error, criarLinkPagamento, criarCobrancaPix } = useAsaas({
    onSuccess: (data) => {
      console.log('Sucesso:', data);
    },
    onError: (error) => {
      console.error('Erro:', error);
    }
  });

  const handleCriarLink = async () => {
    try {
      const link = await criarLinkPagamento({
        name: 'Produto XYZ',
        description: 'Descrição',
        billingType: 'UNDEFINED',
        value: 100.00,
        dueDateLimitDays: 7,
        maxInstallmentCount: 3
      });
      
      console.log('Link criado:', link.url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCriarPix = async () => {
    try {
      const pix = await criarCobrancaPix({
        customer: 'cus_000001',
        value: 50.00,
        dueDate: '2025-12-31',
        description: 'Pagamento via PIX'
      });
      
      console.log('QR Code:', pix.pix.payload);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handleCriarLink} disabled={loading}>
        {loading ? 'Criando...' : 'Criar Link de Pagamento'}
      </button>
      
      <button onClick={handleCriarPix} disabled={loading}>
        {loading ? 'Criando...' : 'Criar Cobrança PIX'}
      </button>
      
      {error && <p>Erro: {error.message}</p>}
    </div>
  );
}

// .env.local
ASAAS_API_KEY=your_api_key_here
NODE_ENV=development
*/
