import { Component, Input, OnInit } from '@angular/core';
import { ReceiptItem, ReceiptConfig } from '../../models/receipt.model';

@Component({
  selector: 'app-items-table',
  template: `
    <div class="items-section">
      <div class="items-header">
        <span>Details</span>
        <span class="center">Qty</span>
        <span class="right">Unit Price</span>
        <span class="right">Amount</span>
      </div>

      <div class="item-row" *ngFor="let item of items; let i = index">
        
        <textarea 
          [(ngModel)]="item.details" 
          [disabled]="mode === 'preview'"
          placeholder="Item description..."></textarea>
        
        <input 
          type="number" 
          class="center"
          [(ngModel)]="item.qty" 
          (ngModelChange)="calculateRow(item)"
          [disabled]="mode === 'preview'"
          placeholder="-">
          
        <input 
          type="number" 
          class="right font-mono"
          [(ngModel)]="item.unitPrice" 
          (ngModelChange)="calculateRow(item)"
          [disabled]="mode === 'preview'"
          placeholder="-">

        <div class="amount-wrapper right">
          <span class="currency font-mono">{{ config.currency }}</span>
          <input 
            type="number" 
            class="font-mono"
            [(ngModel)]="item.amount" 
            [disabled]="isComputed(item) || mode === 'preview'"
            [class.computed-field]="isComputed(item) && mode === 'edit'">
        </div>
        <div class="discount-controls edit-chrome" *ngIf="mode === 'edit'">
            <label>Disc:</label>
            <input 
                type="number" 
                class="discount-input"
                [(ngModel)]="item.discountValue" 
                (ngModelChange)="calculateRow(item)"
                placeholder="0">
                
            <select 
                [(ngModel)]="item.discountType" 
                (ngModelChange)="calculateRow(item)"
                class="discount-toggle">
                <option value="percentage">%</option>
                <option value="fixed">{{ config.currency }}</option>
            </select>
            
            <span class="validation-error" *ngIf="item.amount < 0">
                Discount exceeds total!
            </span>
        </div>
        
        <button 
          *ngIf="mode === 'edit'" 
          class="remove-btn edit-chrome" 
          (click)="attemptRemoveRow(i, item)"
          title="Remove Row">✕</button>
      </div>

      <button 
        *ngIf="mode === 'edit'" 
        class="add-row-btn edit-chrome" 
        (click)="addRow()">
        + Add Row
      </button>
    </div>
  `,
  styles: [`
    .items-header {
      background-color: var(--color-charcoal);
      color: var(--color-white);
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 30px;
      padding: 10px;
      font-weight: 600;
    }
    .item-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 30px;
      gap: 10px;
      border-bottom: 1px solid #ccc;
      padding: 10px 0;
      
      textarea {
        resize: vertical;
        min-height: 40px;
        border: none;
        font-family: inherit;
      }
      input {
        border: none;
        background: transparent;
      }
      .computed-field {
        background-color: #f0f0f0;
        cursor: not-allowed;
        color: #666;
      }
    }
    .font-mono { font-family: var(--font-mono); }
    .center { text-align: center; }
    .right { text-align: right; justify-content: flex-end; }
  `]
})
export class ItemsTableComponent implements OnInit {
  @Input() mode: 'edit' | 'preview' = 'edit';
  @Input() config!: ReceiptConfig;

  items: ReceiptItem[] = [];

  ngOnInit() {
    // Automatically generate two rows per the requirements
    this.addRow();
    this.addRow();
  }

  addRow() {
    this.items.push({
      id: Math.random().toString(36).substr(2, 9),
      details: '',
      qty: null,
      unitPrice: null,
      amount: 0,
      discountType: 'percentage',
      discountValue: null
    });
  }

  isComputed(item: ReceiptItem): boolean {
    return item.qty !== null && item.unitPrice !== null;
  }

  calculateRow(item: ReceiptItem) {
    if (this.isComputed(item)) {
        let baseAmount = item.qty! * item.unitPrice!;
        
        // Apply discount
        if (item.discountValue && item.discountValue > 0) {
        if (item.discountType === 'percentage') {
            baseAmount = baseAmount - (baseAmount * (item.discountValue / 100));
        } else if (item.discountType === 'fixed') {
            baseAmount = baseAmount - item.discountValue;
        }
        }
        
        // Prevent negative amounts per validation rules
        item.amount = baseAmount < 0 ? 0 : Number(baseAmount.toFixed(2));
    }
    }

  attemptRemoveRow(index: number, item: ReceiptItem) {
    const hasData = item.details || item.qty || item.unitPrice || item.amount;
    
    if (hasData) {
      // Basic confirmation implementation to prevent accidental deletion
      if (confirm('This row has data. Are you sure you want to remove it?')) {
        this.items.splice(index, 1);
      }
    } else {
      this.items.splice(index, 1);
    }
    
    // Ensure minimum of 2 rows remains
    while (this.items.length < 2) {
      this.addRow();
    }
  }
  
}