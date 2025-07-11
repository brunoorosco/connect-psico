
export interface DashboardStats {
  totalPatients: number;
  completedConsultations: number;
  scheduledConsultations: number;
  totalConsultations: number;
  pendingConsultations: number;
  remoteConsultations: number;
  inPersonConsultations: number;
}

export interface PendingPayment {
  id: string;
  patientName: string;
  consultationDate: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer';
  icon: string;
}
