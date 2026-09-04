export interface ReceiptItem {
  id: string;
  details: string;
  qty: number | null;
  unitPrice: number | null;
  amount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number | null;
}

export interface ReceiptConfig {
  currency: 'KSH' | 'USD' | 'EUR';
  paymentMethod: 'Cash' | 'M-Pesa' | 'Bank';
  vatMode: 'Inclusive' | 'Exclusive';
  vatRate: number;
}