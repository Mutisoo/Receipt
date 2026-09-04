import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-icon-upload',
  template: `
    <div class="icon-upload-wrapper" [class.edit-mode]="mode === 'edit'">
      <!-- Displayed Icon or Placeholder -->
      <div class="icon-display" (click)="triggerUpload()">
        <img *ngIf="iconDataUrl" [src]="iconDataUrl" [alt]="altText" class="uploaded-icon">
        <div *ngIf="!iconDataUrl" class="placeholder-icon"></div>
      </div>
      
      <!-- Hidden File Input (PNG only) -->
      <input 
        type="file" 
        accept="image/png" 
        (change)="onFileSelected($event)" 
        #fileInput 
        style="display: none;">
        
      <button 
        *ngIf="mode === 'edit' && iconDataUrl" 
        class="undo-btn edit-chrome" 
        (click)="clearIcon()" 
        title="Remove Icon">
        ↺
      </button>
    </div>
  `,
  styles: [`
    .icon-upload-wrapper { position: relative; display: inline-flex; align-items: center; }
    .icon-display {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    }
    .edit-mode .icon-display:hover { opacity: 0.8; }
    .uploaded-icon { max-width: 100%; max-height: 100%; object-fit: contain; }
    .placeholder-icon {
      width: 24px; height: 24px;
      border: 1.5px dashed #ccc;
      border-radius: 4px;
    }
    .undo-btn {
      position: absolute; top: -10px; right: -10px;
      background: var(--color-charcoal); color: var(--color-white);
      border: none; border-radius: 50%; width: 20px; height: 20px;
      cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;
    }
  `]
})
export class IconUploadComponent {
  @Input() mode: 'edit' | 'preview' = 'edit';
  @Input() altText: string = 'Icon';
  @Input() iconDataUrl: string | null = null;
  @Output() iconChanged = new EventEmitter<string | null>();

  triggerUpload() {
    if (this.mode === 'preview') return;
    const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.iconDataUrl = e.target.result;
        this.iconChanged.emit(this.iconDataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('Please upload a valid PNG image.');
    }
  }

  clearIcon() {
    this.iconDataUrl = null;
    this.iconChanged.emit(null);
  }
}