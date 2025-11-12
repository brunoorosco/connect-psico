// types/asaas.types.ts
export type AsaasConfig = {
  apiKey: string
  environment?: "production" | "sandbox"
}

export type CustomerData = {
  name: string
  cpfCnpj: string
  email: string
  phone?: string
  mobilePhone?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  postalCode?: string
  externalReference?: string
  notificationDisabled?: boolean
  additionalEmails?: string
}

export type CreditCard = {
  holderName: string
  number: string
  expiryMonth: string
  expiryYear: string
  ccv: string
}

export type CreditCardHolderInfo = {
  name: string
  email: string
  cpfCnpj: string
  postalCode: string
  addressNumber: string
  phone: string
  mobilePhone?: string
  addressComplement?: string
}

export type Discount = {
  value: number
  dueDateLimitDays: number
  type?: "FIXED" | "PERCENTAGE"
}

export type Fine = {
  value: number
  type?: "FIXED" | "PERCENTAGE"
}

export type Interest = {
  value: number
  type?: "PERCENTAGE"
}

export type CobrancaData = {
  customer: string
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO" | "UNDEFINED"
  value: number
  dueDate: string
  description?: string
  externalReference?: string
  discount?: Discount
  fine?: Fine
  interest?: Interest
  postalService?: boolean
  creditCard?: CreditCard
  creditCardHolderInfo?: CreditCardHolderInfo
  remoteIp?: string
  installmentCount?: number
  installmentValue?: number
}

export type LinkPagamentoData = {
  name: string
  description?: string
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO" | "UNDEFINED"
  chargeType?: "DETACHED" | "RECURRENT"
  value?: number
  dueDateLimitDays?: number
  maxInstallmentCount?: number
  notificationEnabled?: boolean
  endDate?: string
  subscriptionCycle?: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY"
}

export type CobrancaPixData = {
  customer: string
  value: number
  dueDate: string
  description?: string
  externalReference?: string
}

export type PagamentoCartaoData = {
  customer: string
  value: number
  dueDate: string
  description?: string
  creditCard: CreditCard
  creditCardHolderInfo: CreditCardHolderInfo
  remoteIp: string
  installmentCount?: number
  installmentValue?: number
  externalReference?: string
}

export type AsaasResponse<T = any> = {
  data: T
  errors?: Array<{ code: string; description: string }>
}

export type PixQrCode = {
  encodedImage: string
  payload: string
  expirationDate: string
}
