import { Injectable, signal, computed } from '@angular/core';

export interface ReceiptState {
  logo: string;
  customerName: string;
  date:string;
  currency: string;
  paymentMethod: string;
  vatStatus: string;
  vatRate: number;
  discountValue: number | null;
  discountType: 'percentage' | 'fixed';
  policyText: string;
  icons: {
    payment_cash: string | null;
    payment_mpesa: string | null;
    payment_bank: string | null;
    social_instagram: string | null;
    social_tiktok: string | null;
    social_facebook: string | null;
  };
}

export interface BaseReceiptItem {
  id: string;
  details: string;
  qty: number | null;
  unitPrice: number | null;
  manualAmount: number | null;
  _confirmDelete: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  // --- 1. Core State ---
  
  state = signal<ReceiptState>({
    logo: '/assets/default-logo.png',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    currency: 'KSH',
    paymentMethod: 'M-Pesa',
    vatStatus: 'VAT Exclusive',
    vatRate: 16,
    discountValue: null,
    discountType: 'percentage',
    policyText: 'Returns accepted within 7 days with receipt.\nWarranty: 6 months on electronics, manufacturer defects only.',
    icons: {
      payment_cash: 'assets/icons/cash.png',
      payment_mpesa: 'assets/icons/mpesa.png',
      payment_bank: 'assets/icons/bank.png',
      social_instagram: 'assets/icons/instagram.png',
      social_tiktok: 'assets/icons/tiktok.png',
      social_facebook: 'assets/icons/facebook.png'
    }
  });

  private _items = signal<BaseReceiptItem[]>([]);

  constructor() {
    // Initialize with the minimum 2 required rows
    this.addItemRow();
    this.addItemRow();
  }

  // --- 2. Computed Signals (Data Derivatives) ---

  computedItems = computed(() => {
    return this._items().map(item => {
      // Amount is computed if BOTH qty and unitPrice exist and are valid numbers
      const isAutoCalculated = typeof item.qty === 'number' && typeof item.unitPrice === 'number';
      const finalAmount = isAutoCalculated ? (item.qty! * item.unitPrice!) : (item.manualAmount || 0);
      
      return {
        ...item,
        isAutoCalculated,
        finalAmount: Number(finalAmount.toFixed(2))
      };
    });
  });

  subtotal = computed(() => {
    return this.computedItems().reduce((sum, item) => sum + item.finalAmount, 0);
  });

  discountAmount = computed(() => {
    const val = this.state().discountValue || 0;
    const currentSubtotal = this.subtotal();
    let calculatedDiscount = 0;

    if (this.state().discountType === 'percentage') {
      calculatedDiscount = currentSubtotal * (val / 100);
    } else {
      calculatedDiscount = val;
    }

    // Constraint: Discount cannot exceed the subtotal
    return Math.min(calculatedDiscount, currentSubtotal);
  });

  vatAmount = computed(() => {
    const rate = (this.state().vatRate || 0) / 100;
    const taxableAmount = Math.max(0, this.subtotal() - this.discountAmount());

    if (this.state().vatStatus === 'VAT Exclusive') {
      return taxableAmount * rate;
    } else {
      // VAT Inclusive: Back out the VAT portion from the total
      return taxableAmount - (taxableAmount / (1 + rate));
    }
  });

  total = computed(() => {
    const taxableAmount = Math.max(0, this.subtotal() - this.discountAmount());
    
    if (this.state().vatStatus === 'VAT Exclusive') {
      return taxableAmount + this.vatAmount();
    } else {
      // If inclusive, the taxable amount (subtotal - discount) IS the final total
      return taxableAmount;
    }
  });


  // --- 3. State Mutation Methods ---

  updateState(updates: Partial<ReceiptState>) {
    this.state.update(current => ({ ...current, ...updates }));
  }

  updateIcon(slot: keyof ReceiptState['icons'], dataUrl: string | null) {
    this.state.update(current => ({
      ...current,
      icons: { ...current.icons, [slot]: dataUrl }
    }));
  }

  updateItem(id: string, updates: Partial<BaseReceiptItem>) {
    this._items.update(items =>
      items.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  }

  addItemRow() {
    this._items.update(items => [
      ...items,
      {
        id: crypto.randomUUID(), // Or generate a simple random string fallback
        details: '',
        qty: null,
        unitPrice: null,
        manualAmount: null,
        _confirmDelete: false
      }
    ]);
  }

  requestRemoveItem(id: string) {
    const items = this._items();
    const itemTarget = items.find(i => i.id === id);
    if (!itemTarget) return;

    // Check if row has populated data
    const hasData = itemTarget.details.trim() !== '' || 
                    itemTarget.qty !== null || 
                    itemTarget.unitPrice !== null || 
                    itemTarget.manualAmount !== null;

    if (hasData) {
      // Trigger confirmation UI in the component
      this.updateItem(id, { _confirmDelete: true });
    } else {
      // Safe to remove immediately
      this.forceRemoveItem(id);
    }
  }

  forceRemoveItem(id: string) {
    this._items.update(items => items.filter(i => i.id !== id));
    
    // Constraint: Always enforce a minimum of 2 rows
    while (this._items().length < 2) {
      this.addItemRow();
    }
  }
}