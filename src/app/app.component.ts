import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceiptService } from './services/receipt.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-wrapper">
      <div class="control-bar no-print">
        <div class="brand">Receipt</div>
        <div class="mode-toggles">
          <button [class.active]="viewMode() === 'edit'" (click)="viewMode.set('edit')">✏️ Edit Mode</button>
          <button [class.active]="viewMode() === 'preview'" (click)="viewMode.set('preview')">👁️ Print Preview</button>
          <button class="primary-btn" *ngIf="viewMode() === 'preview'" (click)="print()">🖨️ Print A5</button>
        </div>
      </div>

      <div class="a5-container" [class.preview-mode]="viewMode() === 'preview'">
        <div class="header-section">
          <div class="title-block">RECEIPT</div>
          <div class="logo-block">
            <img [src]="state().logo" alt="LumoGadgets.ke logo" >
            <div class="edit-chrome logo-controls">
              <button class="upload-btn" (click)="triggerUpload('logo')">Replace Logo</button>
              <button class="undo-btn" *ngIf="canUndo('logo')" (click)="undoAsset('logo')">Undo</button>
              <input id="file-logo" type="file" hidden (change)="onAssetUpload($event, 'logo')" accept="image/*">
            </div>
          </div>
        </div>

        <div class="meta-section">
          <div class="customer-row">
            <div class="customer-field">
              <span class="label">Client:</span>
              <input type="text" class="clean-input underline-input" [ngModel]="state().customerName" (ngModelChange)="updateState({customerName: $event})" placeholder="Customer Name" aria-label="Customer Name">
            </div>
            <div class="date-field">
              <span class="label">Date:</span>
              <input type="date" class="clean-input underline-input date-input" [ngModel]="state().date" (ngModelChange)="updateState({date: $event})" aria-label="Receipt Date">
            </div> 
          </div>
          
          <div class="edit-chrome accessibility-groups">
            <div role="radiogroup" aria-label="Currency" class="a11y-group">
              <button *ngFor="let c of ['KSH','USD','EUR']" class="a11y-toggle" [class.selected]="state().currency === c" (click)="updateState({currency: c})">
                <span class="indicator"></span> {{ c }}
              </button>
            </div>

            <div class="stacked-controls-group">
              <div role="radiogroup" aria-label="Payment Method" class="a11y-group payment-group">
                <div class="payment-option-container" *ngFor="let p of paymentOptions">
                  <button class="a11y-toggle payment-toggle" [class.selected]="state().paymentMethod === p.label" (click)="updateState({paymentMethod: p.label})">
                    <span class="indicator"></span>
                    <img *ngIf="getIcon(p.slot)" [src]="getIcon(p.slot)" class="pay-icon-form" [alt]="p.label + ' icon'">
                    <div *ngIf="!getIcon(p.slot)" class="asset-placeholder form-size"></div>
                    <span>{{ p.label }}</span>
                  </button>
                </div>
              </div>

              <div role="radiogroup" aria-label="VAT Status" class="a11y-group">
                <button *ngFor="let v of ['VAT Inclusive','VAT Exclusive']" class="a11y-toggle" [class.selected]="state().vatStatus === v" (click)="updateState({vatStatus: v})">
                  <span class="indicator"></span> {{ v }}
                </button>
              </div>
            </div>
          </div>

          <div class="preview-chrome payment-display">
            <img *ngIf="getSelectedPaymentIcon()" [src]="getSelectedPaymentIcon()" class="pay-icon-receipt">
            <div *ngIf="!getSelectedPaymentIcon()" class="asset-placeholder receipt-size"></div>
            {{ state().paymentMethod }}
          </div>
        </div>

        <div class="items-table">
          <div class="table-header">
            <div>Details</div><div class="text-center">Qty</div><div class="text-right">Unit Price</div><div class="text-right">Amount</div>
          </div>
          
          <div class="table-row" *ngFor="let item of items(); trackBy: trackById">
            <div class="details-cell">
                <textarea 
                class="clean-input auto-expand" 
                rows="2" 
                [value]="item.details" 
                (input)="updateItemField(item.id, 'details', $event); autoResize($event)" 
                placeholder="Item description...">
                </textarea>
            </div>
            <div class="qty-cell">
                <input type="number" class="clean-input text-center amount-font" [value]="item.qty ?? ''" (input)="updateItemField(item.id, 'qty', $event)" placeholder="-">
            </div>
            <div class="price-cell">
                <input type="number" class="clean-input text-right amount-font" [value]="item.unitPrice ?? ''" (input)="updateItemField(item.id, 'unitPrice', $event)" placeholder="-">
            </div>
            
            <div class="amount-cell text-right amount-font">
                <input type="number" class="clean-input text-right amount-input" 
                [class.computed-field]="item.isAutoCalculated" 
                [readonly]="item.isAutoCalculated" 
                [value]="item.isAutoCalculated ? item.finalAmount : (item.manualAmount ?? '')" 
                (input)="!item.isAutoCalculated && updateItemField(item.id, 'manualAmount', $event)" 
                placeholder="0.00" 
                [title]="item.isAutoCalculated ? 'Auto-calculated' : 'Manual entry'">
                <span class="lock-icon" *ngIf="item.isAutoCalculated" title="Auto-calculated">🔒</span>
                
                <button class="remove-btn edit-chrome" *ngIf="!item._confirmDelete" (click)="srv.requestRemoveItem(item.id)" aria-label="Remove Row">×</button>
                <div class="delete-toast edit-chrome" *ngIf="item._confirmDelete">
                Delete? <button class="danger-btn" (click)="srv.forceRemoveItem(item.id)">Yes</button> <button (click)="updateItem(item.id, {_confirmDelete: false})">Undo</button>
                </div>
            </div>
          </div>
          
          <button class="add-btn edit-chrome" (click)="srv.addItemRow()">+ Add Item Row</button>
        </div>

        <div class="spacer"></div>

        <div class="bottom-wrapper">
          <div class="edit-chrome totals-controls">
            <div class="control-row">
              <label>Discount</label>
              <input type="number" class="clean-input amount-font bounded-input" [ngModel]="state().discountValue" (ngModelChange)="updateState({discountValue: $event})" placeholder="0">
              <div class="toggle-pill">
                <button [class.active]="state().discountType === 'percentage'" (click)="updateState({discountType: 'percentage'})">%</button>
                <button [class.active]="state().discountType === 'fixed'" (click)="updateState({discountType: 'fixed'})">Fixed</button>
              </div>
            </div>
            <div class="validation-error" *ngIf="state().discountValue && srv.discountAmount() >= srv.subtotal()">⚠️ Discount capped at Subtotal</div>
            
            <div class="control-row">
              <label>VAT Rate (%)</label>
              <input type="number" class="clean-input amount-font bounded-input" [ngModel]="state().vatRate" (ngModelChange)="updateState({vatRate: $event})" min="0" max="100">
            </div>
            <div class="validation-error" *ngIf="state().vatRate < 0 || state().vatRate > 100">⚠️ VAT rate must be 0-100%</div>
          </div>

          <div class="totals-block amount-font">
            <ng-container *ngIf="state().vatStatus === 'VAT Exclusive' || srv.discountAmount() > 0"><div class="t-row"><span class="t-label">Subtotal</span><span>{{ state().currency }} {{ srv.subtotal() | number:'1.2-2' }}</span></div></ng-container>
            <ng-container *ngIf="srv.discountAmount() > 0"><div class="t-row discount-row"><span class="t-label">Discount</span><span>- {{ state().currency }} {{ srv.discountAmount() | number:'1.2-2' }}</span></div></ng-container>
            <ng-container *ngIf="state().vatStatus === 'VAT Exclusive' && srv.vatAmount() > 0"><div class="t-row"><span class="t-label">VAT ({{state().vatRate}}%)</span><span>{{ state().currency }} {{ srv.vatAmount() | number:'1.2-2' }}</span></div></ng-container>
            <div class="t-row final-total"><span class="t-label">Total</span><span class="underlined-amount">{{ state().currency }} {{ srv.total() | number:'1.2-2' }}</span></div>
            <div class="vat-inclusive-note" *ngIf="state().vatStatus === 'VAT Inclusive' && srv.vatAmount() > 0">(Includes VAT of {{ state().currency }} {{ srv.vatAmount() | number:'1.2-2' }})</div>
            <div class="vat-status-footnote">*{{ state().vatStatus }}</div>
          </div>
          
          <div class="footer-section">
            <textarea class="clean-input policy-input edit-chrome" [ngModel]="state().policyText" (ngModelChange)="updateState({policyText: $event})" rows="2"></textarea>
            <div class="policy-text preview-chrome">{{ state().policyText }}</div>
            <hr class="footer-separator">
            <div class="footer-content">
              <div class="socials-group">
                <div class="social-icons-row">
                    <ng-container *ngFor="let s of socialOptions">
                        <img *ngIf="getIcon(s.slot)" 
                            [src]="getIcon(s.slot)" 
                            class="social-icon" 
                            [alt]="s.label + ' icon'">
                    </ng-container>
                </div>
                <span class="common-social-name">LumoGadgets.ke</span>
              </div>

              <div class="location"><span>📍 Iconic Business Plaza 3rd Floor Shop T6 </span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-wrapper { background: #e5e7eb; min-height: 100vh; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .control-bar { background: var(--white); width: 100%; max-width: 800px; padding: 16px 24px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); box-sizing: border-box; }
    .brand { font-weight: bold; font-size: 1.1rem; }
    .mode-toggles button { background: #f3f4f6; border: 1px solid #ccc; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-family: var(--font-primary); font-weight: 600; min-height: 44px; margin-left: 8px; }
    .mode-toggles button.active { background: var(--charcoal); color: var(--white); border-color: var(--charcoal); }
    .mode-toggles button.primary-btn { background: var(--emerald); color: var(--charcoal); border-color: var(--emerald); }

    .a5-container { width: 148mm; min-height: 210mm; background: var(--white); padding: 10mm 12mm; box-sizing: border-box; display: flex; flex-direction: column; box-shadow: 0 10px 25px rgba(0,0,0,0.15); margin: 0 auto; }
    .spacer { flex: 1; }
    .preview-chrome { display: none; }
    .a5-container.preview-mode .edit-chrome { display: none !important; }
    .a5-container.preview-mode .preview-chrome { display: block; }
    .a5-container.preview-mode .clean-input { pointer-events: none; }
    .a5-container.preview-mode .underline-input { border-bottom-color: transparent !important; }

    .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; min-height: 70px; }
    .title-block { 
      background: var(--emerald); 
      color: var(--white); 
      font-weight: 600; 
      font-size: 2.3rem;        /* Increased from 1.8rem */
      padding: 8px 32px;        /* Expanded padding to match */
      letter-spacing: 1px; 
      margin:20px;
    }
    .logo-block { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .logo-block img { 
      width: 32mm;          
      height: 32mm;             
      object-fit: contain; 
    }
    .logo-controls button { font-size: 0.75rem; padding: 4px 8px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px; }
    
    .meta-section { margin-bottom: 24px; }
    .customer-row { 
      display: flex; 
      justify-content: space-between; 
      align-items: baseline; 
      gap: 16px; 
      margin-bottom: 16px; 
      font-weight: 600; 
    }
    .customer-field { 
      display: flex; 
      align-items: baseline; 
      gap: 8px; 
      flex: 2; 
    }
    .date-field { 
      display: flex; 
      align-items: baseline; 
      gap: 8px; 
      flex: 1; 
      justify-content: flex-end; 
    }
    .date-input { 
      width: auto !important; 
      font-family: inherit; 
    }
    .underline-input { border-bottom: 1px solid var(--charcoal) !important; padding-bottom: 2px; flex: 1; }
    .accessibility-groups { display: flex; flex-wrap: wrap; gap: 12px; }
    .a11y-group { display: flex; gap: 8px; background: #f9fafb; padding: 8px; border-radius: 6px; }
    .a11y-toggle { display: flex; align-items: center; gap: 6px; background: white; border: 2px solid #e5e7eb; padding: 0 12px; min-height: 44px; border-radius: 4px; cursor: pointer; font-family: var(--font-primary); font-weight: 500; font-size: 0.85rem; color: #666; transition: all 0.2s; }
    .a11y-toggle:focus-visible { outline: 3px solid var(--charcoal); outline-offset: 2px; }
    .a11y-toggle .indicator { width: 14px; height: 14px; border: 2px solid #ccc; border-radius: 3px; display: inline-block; position: relative; }
    .a11y-toggle.selected { border-color: var(--charcoal); color: var(--charcoal); font-weight: 600; }
    .a11y-toggle.selected .indicator { background: var(--charcoal); border-color: var(--charcoal); }
    .a11y-toggle.selected .indicator::after { content: '✓'; color: white; position: absolute; font-size: 10px; top: -1px; left: 1px; }
    
    .payment-option-container { display: flex; flex-direction: column; gap: 6px; align-items: center; }
    .payment-toggle { gap: 8px; }
    .pay-icon-form { width: 18px; height: 18px; object-fit: contain; }
    .pay-icon-receipt { width: 18px; height: 18px; object-fit: contain; vertical-align: middle; margin: 0 4px; }
    .asset-placeholder { border: 1px dashed #ccc; border-radius: 4px; display: inline-block; background: #f9fafb; }
    .asset-placeholder.form-size { width: 32px; height: 32px; }
    .asset-placeholder.receipt-size { width: 18px; height: 18px; vertical-align: middle; margin: 0 4px; }
    .asset-placeholder.social-size { width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; }
    .icon-controls { display: flex; gap: 4px; justify-content: center; }
    .icon-btn { font-size: 0.7rem; padding: 2px 4px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px; }
    
    .payment-display { display: flex; align-items: center; font-weight: 600; color: var(--charcoal); margin-top: 8px; }

    .table-header { 
        background: var(--charcoal); 
        color: var(--white); 
        display: grid; 
        grid-template-columns: 2fr 50px 85px 95px; 
        padding: 8px; 
        font-weight: 600; 
        font-size: 0.85rem; 
        gap: 8px; 
        }
    .table-row { 
        display: grid; 
        grid-template-columns: 2fr 50px 85px 95px; 
        padding: 12px 8px; 
        border-bottom: 1px solid rgba(26,26,26,0.1); 
        position: relative; 
        gap: 8px; 
        align-items: start; 
        }
    .amount-cell {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        position: relative;
        }
        .amount-input {
        width: 100% !important;
        }
    .text-center { text-align: center; } .text-right { text-align: right; }
    .details-cell {
        display: flex;
        flex-direction: column;
        width: 100%;
        }

    .clean-input.auto-expand {
      resize: none;              
      min-height: 40px;          
      max-height: none;          
      overflow-y: hidden;        
      font-family: inherit;
      line-height: 1.4;
      padding: 2px 0;
      box-sizing: border-box;
      width: 100%;
    }
    .computed-field { background-color: #f3f4f6; color: #666; cursor: not-allowed; border-radius: 2px; }
    .lock-icon { font-size: 0.7rem; position: absolute; right: 0; top: 0; opacity: 0.5; }
    .remove-btn { position: absolute; right: -24px; top: 8px; background: #ff4444; color: white; border: none; border-radius: 4px; width: 20px; height: 30px; cursor: pointer; min-width: 44px; right: -48px; }
    .delete-toast { position: absolute; right: 0; top: 10px; background: var(--charcoal); color: white; padding: 8px; border-radius: 4px; font-size: 0.8rem; z-index: 10; display: flex; gap: 8px; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
    .delete-toast button { padding: 4px 8px; border: none; border-radius: 2px; cursor: pointer; font-family: var(--font-primary); }
    .danger-btn { background: #ff4444; color: white; }
    .add-btn { background: none; border: 1px dashed var(--charcoal); color: var(--charcoal); padding: 12px; margin-top: 12px; cursor: pointer; width: 100%; min-height: 44px; font-weight: 600; }

    .bottom-wrapper { margin-top: 24px; }
    .totals-controls { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 6px; }
    .control-row { display: flex; align-items: center; gap: 12px; }
    .control-row label { font-weight: 600; font-size: 0.85rem; width: 100px; }
    .bounded-input { border: 1px solid #ccc !important; padding: 8px; border-radius: 4px; width: 100px; background: white !important; }
    .toggle-pill { display: flex; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
    .toggle-pill button { border: none; background: none; padding: 8px 12px; cursor: pointer; font-weight: 600; min-height: 44px; min-width: 44px; }
    .toggle-pill button.active { background: var(--charcoal); color: white; }
    .validation-error { color: #ff4444; font-size: 0.8rem; margin-left: 112px; }
    .stacked-controls-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
    }

    .totals-block { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; margin-bottom: 32px; }
    .t-row { display: grid; grid-template-columns: 1fr 120px; width: 220px; text-align: right; font-size: 0.9rem; }
    .t-label { text-align: left; color: #666; }
    .discount-row { color: var(--charcoal); }
    .final-total { font-weight: bold; font-size: 1.1rem; margin-top: 8px; color: var(--charcoal); }
    .final-total .t-label { color: var(--charcoal); }
    .underlined-amount { border-bottom: 2px solid var(--charcoal); padding-bottom: 2px; }
    .vat-inclusive-note { font-size: 0.75rem; color: #666; font-family: var(--font-primary); margin-top: 4px; }
    .vat-status-footnote { font-size: 0.75rem; color: var(--charcoal); font-family: var(--font-primary); margin-top: 12px; font-weight: 600; }

    .footer-section { page-break-inside: avoid; }
    .policy-input { font-size: 0.75rem; color: #666; text-align: center; border: 1px dashed #ccc !important; padding: 8px; margin-bottom: 8px; }
    .policy-text { font-size: 0.75rem; color: #666; text-align: center; margin-bottom: 8px; }
    .footer-separator { border: none; border-top: 1px solid rgba(26,26,26,0.2); width: 80%; margin: 0 auto 12px auto; }
    .footer-content { 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      font-size: 0.7rem; 
      color: var(--charcoal); 
      padding: 0 5%; 
      font-weight: 500; 
    }
    .socials-group { 
      display: flex; 
      align-items: center; 
      gap: 6px; 
    }
    .social-icons-row { 
      display: flex; 
      gap: 6px; 
      align-items: center; 
    }
    .social-icon { 
      width: 14px; 
      height: 14px; 
      object-fit: contain; 
    }
    .common-social-name { 
      font-weight: 600; 
    }
    @media print { 
      @page { size: A5 portrait; margin: 0; }
      body { margin: 0 !important; background: white; }
      
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .app-wrapper { padding: 0; background: white; }
      .a5-container { box-shadow: none; min-height: 100vh; }
      .no-print, .edit-chrome { display: none !important; }
      .preview-chrome { display: block !important; }
      .underline-input { border-bottom-color: transparent !important; }
      .clean-input { pointer-events: none; }

      .logo-block {
        width: 100% !important;
        align-items: flex-end !important;
      }

      .logo-block img {
        width: 32mm !important;   /* Matches screen size precisely */
        height: 32mm !important;
        max-width: none !important;
      }

      .pay-icon-receipt {
        width: 28px !important;
        height: 28px !important;
      }

      .social-icon {
        width: 22px !important;
        height: 22px !important;
      }
    }
  `]
})
export class AppComponent {
  srv = inject(ReceiptService);
  state = this.srv.state;
  items = this.srv.computedItems;
  viewMode = signal<'edit' | 'preview'>('edit');
  
  paymentOptions = [
    { label: 'Cash', slot: 'payment_cash' },
    { label: 'M-Pesa', slot: 'payment_mpesa' },
    { label: 'Bank', slot: 'payment_bank' }
  ] as const;

  socialOptions = [
    { label: 'Instagram', slot: 'social_instagram' },
    { label: 'TikTok', slot: 'social_tiktok' },
    { label: 'Facebook', slot: 'social_facebook' }
  ] as const;

  previousAssets: Record<string, string | null> = {};

  trackById(index: number, item: any) {
    return item.id;
  }
  updateState(p: any) { this.srv.updateState(p); }
  updateItem(id: string, p: any) { this.srv.updateItem(id, p); }
  autoResize(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
  updateItemField(id: string, field: string, event: any) {
    const val = event.target.value;
    let parsedValue: any = val;

    if (field === 'qty' || field === 'unitPrice' || field === 'manualAmount') {
      parsedValue = val === '' ? null : Number(val);
    }

    this.srv.updateItem(id, { [field]: parsedValue });
  }
  getIcon(slot: string) { return (this.state().icons as any)[slot]; }

  triggerUpload(slotId: string) {
    document.getElementById('file-' + slotId)?.click();
  }

  onAssetUpload(event: any, slot: string) {
    const file = event.target.files[0];
    if (file) {
      if (slot === 'logo') this.previousAssets['logo'] = this.state().logo;
      else this.previousAssets[slot] = this.getIcon(slot);

      const reader = new FileReader();
      reader.onload = e => {
        if (slot === 'logo') this.updateState({ logo: e.target?.result as string });
        else this.srv.updateIcon(slot as any, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }
  undoAsset(slot: string) {
    if (this.previousAssets[slot] !== undefined) {
      if (slot === 'logo') this.updateState({ logo: this.previousAssets[slot] });
      else this.srv.updateIcon(slot as any, this.previousAssets[slot]);
      delete this.previousAssets[slot];
    }
  }
  canUndo(slot: string) { return this.previousAssets[slot] !== undefined; }

  getSelectedPaymentIcon() {
    const pm = this.state().paymentMethod;
    const opt = this.paymentOptions.find(o => o.label === pm);
    return opt ? this.getIcon(opt.slot) : null;
  }

  print() { window.print(); }
}