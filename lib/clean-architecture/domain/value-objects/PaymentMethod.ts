export type PaymentType = 'CARNE_ESTUDIANTIL' | 'CREDIT_CARD' | 'MOBILE_QR' | 'DIGITAL_WALLET';

export interface PaymentDetails {
  type: PaymentType;
  label: string;
  providerName?: string;
  studentId?: string;
  cardLastFour?: string;
  qrReference?: string;
  discountPercentage: number;
}

export const PAYMENT_METHODS: Record<PaymentType, { label: string; discount: number; description: string }> = {
  CARNE_ESTUDIANTIL: {
    label: 'Saldo Carné Universitario',
    discount: 10, // 10% student discount
    description: 'Debitado automáticamente de tu cuenta institucional de bienestar',
  },
  CREDIT_CARD: {
    label: 'Tarjeta Débito / Crédito',
    discount: 0,
    description: 'Procesamiento seguro SSL Visa o MasterCard',
  },
  MOBILE_QR: {
    label: 'Pagos Móviles / QR',
    discount: 0,
    description: 'Transferencia instantánea Nequi, Daviplata o PSE',
  },
  DIGITAL_WALLET: {
    label: 'Billeteras Digitales',
    discount: 0,
    description: 'Apple Pay o Google Wallet',
  },
};
