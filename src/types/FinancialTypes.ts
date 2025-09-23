// Tipos para el módulo financiero

export interface TeamFinancialInfo {
  id: number
  name: string
  category: string
  logoPath?: string
  balance: number
  lastPayment: Date
  pendingAmount: number
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'fined'
  fines: Fine[]
  tournamentId: number
}

export interface Fine {
  id: number
  type: 'tarjeta_amarilla' | 'tarjeta_roja' | 'comportamiento' | 'retraso' | 'otros'
  amount: number
  date: Date
  description?: string
  isPaid: boolean
}

export interface Payment {
  id: number
  teamId: number
  amount: number
  date: Date
  concept: string
  method: 'efectivo' | 'transferencia' | 'tarjeta'
  reference?: string
  createdBy: number
}

export interface FinancialTransaction {
  id: number
  teamId: number
  type: 'payment' | 'fine' | 'adjustment'
  amount: number
  date: Date
  description: string
  reference?: string
  createdBy: number
}

export interface FinancialReport {
  period: string
  totalIncome: number
  totalFines: number
  pendingPayments: number
  teamSummaries: TeamFinancialSummary[]
  generatedAt: Date
}

export interface TeamFinancialSummary {
  teamId: number
  teamName: string
  totalPaid: number
  totalFines: number
  balance: number
  status: string
}

export interface Tournament {
  id: number
  name: string
  startDate?: Date
  endDate?: Date
  isActive: boolean
}
