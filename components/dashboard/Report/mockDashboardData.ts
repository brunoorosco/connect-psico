import { DashboardStats, PendingPayment, PaymentMethod } from '@/types/dashboard';

export const mockDashboardStats: DashboardStats = {
  totalPatients: 45,
  completedConsultations: 128,
  scheduledConsultations: 12,
  totalConsultations: 140,
  pendingConsultations: 8,
  remoteConsultations: 95,
  inPersonConsultations: 45
};

export const mockPendingPayments: PendingPayment[] = [
  {
    id: '1',
    patientName: 'Maria Silva',
    consultationDate: '2025-01-05',
    amount: 250.00,
    description: 'Consulta Psicológica - Terapia Individual',
    status: 'pending'
  },
  {
    id: '2',
    patientName: 'João Santos',
    consultationDate: '2025-01-03',
    amount: 300.00,
    description: 'Consulta Psiquiátrica - Avaliação',
    status: 'overdue'
  },
  {
    id: '3',
    patientName: 'Ana Costa',
    consultationDate: '2025-01-08',
    amount: 200.00,
    description: 'Consulta Psicológica - Sessão de Acompanhamento',
    status: 'pending'
  }
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    type: 'credit_card',
    icon: 'CreditCard'
  },
  {
    id: 'debit_card',
    name: 'Cartão de Débito',
    type: 'debit_card',
    icon: 'CreditCard'
  },
  {
    id: 'pix',
    name: 'PIX',
    type: 'pix',
    icon: 'Smartphone'
  },
  {
    id: 'bank_transfer',
    name: 'Transferência Bancária',
    type: 'bank_transfer',
    icon: 'Building'
  }
];
