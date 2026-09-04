import { Component } from '@angular/core';

@Component({
  selector: 'app-receipt-builder',
  template: `
    <div class="app-toolbar edit-chrome">
      <h2>Receipt Generator</h2>
      <button 
        class="selectable-btn" 
        (click)="toggleMode()"
        [class.selected]="viewMode === 'preview'">
        {{ viewMode === 'edit' ? 'Preview Receipt' : 'Back to Edit' }}
      </button>
      <button class="selectable-btn" *ngIf="viewMode === 'preview'" (click)="printReceipt()">
        Print (A5)
      </button>
    </div>

    <div class="receipt-container" [class.preview-mode]="viewMode === 'preview'">
      
      <header class="receipt-header">
        <div class="title-block">RECEIPT</div>
        <app-header-section [mode]="viewMode"></app-header-section>
      </header>

      <app-controls-section 
        *ngIf="viewMode === 'edit'" 
        [(config)]="receiptConfig">
      </app-controls-section>

      <app-items-table 
        [mode]="viewMode" 
        [config]="receiptConfig">
      </app-items-table>

      <app-footer-section [mode]="viewMode"></app-footer-section>
      
    </div>
  `,
  styles: [`
    .app-toolbar { margin-bottom: 20px; display: flex; gap: 15px; justify-content: center; }
    .title-block {
      background-color: var(--color-emerald);
      color: var(--color-white);
      font-family: var(--font-primary);
      font-weight: 800;
      padding: 10px 20px;
      display: inline-block;
      font-size: 24px;
    }
  `]
})
export class ReceiptBuilderComponent {
  viewMode: 'edit' | 'preview' = 'edit';
  
  receiptConfig = {
    currency: 'KSH',
    paymentMethod: 'M-Pesa',
    vatMode: 'Exclusive',
    vatRate: 16
  };

  toggleMode() {
    this.viewMode = this.viewMode === 'edit' ? 'preview' : 'edit';
  }

  printReceipt() {
    window.print();
  }
}