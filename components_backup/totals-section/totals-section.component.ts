import { Component, Input, OnChanges } from '@angular/core';
import { ReceiptItem, ReceiptConfig } from '../../models/receipt.model';

@Component({
  selector: 'app-totals-section',
  template: `
    <div class="totals-container">
      
      <!-- VAT EXCLUSIVE Display -->
      <ng-container *ngIf="config.vatMode === 'Exclusive'">
        <div class="total-line">
          <span>Subtotal</span>
          <span class="font-mono">{{ config.currency }} {{ subtotal | number:'1.2-2' }}</span>
        </div>
        <div class="total-line">
          <span>VAT ({{ config.vatRate }}%)</span>
          <span class="font-mono">{{ config.currency }} {{ vatAmount | number:'1.2-2' }}</span>
        </div>
        <div class="total-line final-total">
          <span class="total-label">Total</span>
          <span class="total-amount font-mono">{{ config.currency }} {{ total | number:'1.2-2' }}</span>
        </div>
      </ng-container>

      <!-- VAT INCLUSIVE Display -->
      <ng-container *ngIf="config.vatMode === 'Inclusive'">
        <div class="total-line final-total">
          <span class="total-label">Total</span>
          <span class="total-amount font-mono">{{ config.currency }} {{ total | number:'1.2-2' }}</span>
        </div>
        <div class="vat-footnote">
          (of which VAT: {{ config.currency }} {{ vatAmount | number:'1.2-2' }})
        </div>
      </ng-container>
      
      <div class="vat-status-note">
        *VAT {{ config.vatMode }}
      </div>
    </div>
  `,
  styles: [`
    .totals-container {
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      align-items: flex-end; /* Align all totals to the right */
      gap: 5px;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      width: 250px;
    }
    .final-total {
      margin-top: 5px;
      font-weight: 800;
      font-size: 16px;
    }
    .total-label {
      /* Explicitly ensuring no underline on the label */
      text-decoration: none; 
    }
    .total-amount {
      /* Only the amount gets the underline */
      border-bottom: 1.5px solid var(--color-charcoal);
      padding-bottom: 2px;
    }
    .font-mono { font-family: var(--font-mono); }
    .vat-footnote { font-size: 12px; color: #555; margin-top: 2px; }
    .vat-status-note { font-size: 10px; color: #777; margin-top: 10px; }
  `]
})
export class TotalsSectionComponent implements OnChanges {
  @Input() items: ReceiptItem[] = [];
  @Input() config!: ReceiptConfig;

  subtotal: number = 0;
  vatAmount: number = 0;
  total: number = 0;

  ngOnChanges() {
    this.calculateTotals();
  }

  calculateTotals() {
    // Basic sum of item amounts (assuming row-level discounts are already calculated in the item amount)
    this.subtotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);

    const rate = (this.config.vatRate || 0) / 100;

    if (this.config.vatMode === 'Exclusive') {
      this.vatAmount = this.subtotal * rate;
      this.total = this.subtotal + this.vatAmount;
    } else {
      this.total = this.subtotal; // Subtotal already includes VAT
      this.vatAmount = this.total - (this.total / (1 + rate));
    }
  }
}