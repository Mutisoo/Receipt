import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReceiptConfig } from '../../models/receipt.model';

@Component({
  selector: 'app-controls-section',
  template: `
    <div class="controls-container edit-chrome">
      
      <!-- Payment Method Selection with Icons -->
      <fieldset class="control-group">
        <legend>Payment Method</legend>
        <div class="btn-group" role="radiogroup" aria-label="Payment Method">
          <button *ngFor="let method of paymentMethods"
            class="selectable-btn icon-btn"
            [class.selected]="config.paymentMethod === method.name"
            (click)="updateConfig('paymentMethod', method.name)">
            
            <span *ngIf="config.paymentMethod === method.name" class="check-indicator">✓</span>
            
            <app-icon-upload 
              class="payment-icon-slot"
              mode="edit" 
              [altText]="method.name + ' Icon'"
              [iconDataUrl]="method.icon"
              (iconChanged)="method.icon = $event">
            </app-icon-upload>
            
            <span>{{ method.name }}</span>
          </button>
        </div>
      </fieldset>

      <div class="config-column">
        <!-- Currency Selection -->
        <fieldset class="control-group">
          <legend>Currency</legend>
          <div class="btn-group" role="radiogroup" aria-label="Currency">
            <button *ngFor="let curr of ['KSH', 'USD', 'EUR']"
              class="selectable-btn"
              [class.selected]="config.currency === curr"
              (click)="updateConfig('currency', curr)">
              <span *ngIf="config.currency === curr" class="check-indicator">✓</span>
              {{ curr }}
            </button>
          </div>
        </fieldset>

        <!-- VAT Configuration -->
        <fieldset class="control-group">
          <legend>VAT Setting</legend>
          <div class="btn-group" role="radiogroup" aria-label="VAT Mode">
            <button *ngFor="let mode of ['Inclusive', 'Exclusive']"
              class="selectable-btn"
              [class.selected]="config.vatMode === mode"
              (click)="updateConfig('vatMode', mode)">
              <span *ngIf="config.vatMode === mode" class="check-indicator">✓</span>
              VAT {{ mode }}
            </button>
            
            <div class="vat-rate-input">
              <input type="number" min="0" max="100" 
                [(ngModel)]="config.vatRate" 
                (ngModelChange)="emitConfig()"
                title="VAT Rate Percentage">
              <span>%</span>
            </div>
          </div>
        </fieldset>
      </div>

    </div>
  `,
  styles: [`
    .controls-container {
      display: flex; flex-wrap: wrap; gap: 30px; margin-bottom: 20px; padding: 15px;
      background: #f9f9f9; border-radius: 8px; border: 1px solid #eee;
    }
    .config-column { display: flex; flex-direction: column; gap: 20px; }
    .control-group { border: none; padding: 0; margin: 0; }
    legend { font-weight: 600; margin-bottom: 8px; font-size: 14px; }
    .btn-group { display: flex; gap: 10px; align-items: center; }
    .check-indicator { font-weight: bold; color: var(--color-emerald); font-size: 16px; margin-right: 4px; }
    
    .icon-btn { flex-direction: column; padding: 10px; min-width: 80px; }
    .payment-icon-slot { width: 32px; height: 32px; margin-bottom: 5px; }
    
    .vat-rate-input {
      display: flex; align-items: center; gap: 5px; margin-left: 10px;
      input { width: 50px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    }
  `]
})
export class ControlsSectionComponent {
  @Input() config!: ReceiptConfig;
  @Output() configChange = new EventEmitter<ReceiptConfig>();

  // Store independent icons for payment methods
  paymentMethods = [
    { name: 'Cash', icon: null },
    { name: 'M-Pesa', icon: null },
    { name: 'Bank', icon: null }
  ];

  updateConfig(key: keyof ReceiptConfig, value: any) {
    this.config = { ...this.config, [key]: value };
    this.emitConfig();
  }

  emitConfig() {
    this.configChange.emit(this.config);
  }
}