import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-section',
  template: `
    <div class="header-container">
      <div class="business-info">
        <label>M/s</label>
        <input 
          type="text" 
          class="customer-name-input" 
          [disabled]="mode === 'preview'"
          placeholder="Customer Name / Business">
      </div>
      
      <div class="logo-area">
        <div class="logo-wrapper" [class.edit-mode]="mode === 'edit'" (click)="triggerLogoUpload()">
          <img [src]="logoUrl" alt="LumoGadgets.ke logo" class="brand-logo">
          <div *ngIf="mode === 'edit'" class="upload-overlay edit-chrome">Change Logo</div>
        </div>
        <input type="file" accept="image/*" (change)="onLogoSelected($event)" #logoInput style="display: none;">
        <button *ngIf="mode === 'edit' && logoUrl !== defaultLogo" class="undo-text-btn edit-chrome" (click)="restoreDefaultLogo()">Restore Default</button>
      </div>
    </div>
  `,
  styles: [`
    .header-container {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-top: 15px; margin-bottom: 20px;
    }
    .business-info {
      flex: 1; display: flex; align-items: flex-end; gap: 10px;
    }
    .customer-name-input {
      flex: 1; max-width: 300px;
      border: none; border-bottom: 1px solid var(--color-charcoal);
      font-family: inherit; font-size: 16px; outline: none; background: transparent;
    }
    .logo-area {
      display: flex; flex-direction: column; align-items: flex-end; gap: 5px;
    }
    .logo-wrapper {
      position: relative; cursor: pointer;
      /* Enlarged sizing as per v2.2 specs (35-45mm) */
      width: 45mm; height: auto; display: flex; justify-content: flex-end;
    }
    .brand-logo { max-width: 100%; object-fit: contain; }
    .upload-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); color: white;
      display: flex; align-items: center; justify-content: center; opacity: 0; font-size: 12px;
    }
    .logo-wrapper.edit-mode:hover .upload-overlay { opacity: 1; }
    .undo-text-btn { background: none; border: none; color: #666; font-size: 12px; text-decoration: underline; cursor: pointer; }
  `]
})
export class HeaderSectionComponent {
  @Input() mode: 'edit' | 'preview' = 'edit';
  
  defaultLogo = 'assets/default-logo.png';
  logoUrl: string = this.defaultLogo;

  triggerLogoUpload() {
    if (this.mode === 'preview') return;
    const fileInput = document.querySelector('.logo-area input[type="file"]') as HTMLElement;
    if (fileInput) fileInput.click();
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.logoUrl = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  restoreDefaultLogo() {
    this.logoUrl = this.defaultLogo;
  }
}