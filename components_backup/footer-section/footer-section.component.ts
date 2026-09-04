import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer-section',
  template: `
    <div class="footer-container">
      <hr class="footer-separator">
      
      <!-- Editable Policy Notes -->
      <div class="policy-note">
        <textarea 
          [(ngModel)]="policyText" 
          [disabled]="mode === 'preview'"
          rows="2">
        </textarea>
      </div>

      <!-- Social & Location Row (Side-by-Side) -->
      <div class="footer-row">
        
        <div class="social-profiles">
          <!-- Instagram -->
          <div class="social-item">
            <app-icon-upload 
              class="social-icon-slot"
              [mode]="mode" 
              altText="Instagram Icon"
              [iconDataUrl]="socialIcons.instagram"
              (iconChanged)="socialIcons.instagram = $event">
            </app-icon-upload>
            <span *ngIf="mode === 'preview' || socialIcons.instagram">LumoGadgets.ke</span>
          </div>
          
          <!-- TikTok -->
          <div class="social-item">
            <app-icon-upload 
              class="social-icon-slot"
              [mode]="mode" 
              altText="TikTok Icon"
              [iconDataUrl]="socialIcons.tiktok"
              (iconChanged)="socialIcons.tiktok = $event">
            </app-icon-upload>
            <span *ngIf="mode === 'preview' || socialIcons.tiktok">LumoGadgets.ke</span>
          </div>

          <!-- Facebook -->
          <div class="social-item">
            <app-icon-upload 
              class="social-icon-slot"
              [mode]="mode" 
              altText="Facebook Icon"
              [iconDataUrl]="socialIcons.facebook"
              (iconChanged)="socialIcons.facebook = $event">
            </app-icon-upload>
            <span *ngIf="mode === 'preview' || socialIcons.facebook">LumoGadgets.ke</span>
          </div>
        </div>

        <div class="location-info">
          <app-icon-upload 
            class="social-icon-slot"
            [mode]="mode" 
            altText="Location Pin"
            [iconDataUrl]="socialIcons.location"
            (iconChanged)="socialIcons.location = $event">
          </app-icon-upload>
          <span>Iconic Business Plaza</span>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .footer-container { margin-top: 30px; }
    .footer-separator { 
      border: none; border-top: 1px solid #ccc;
      margin: 0 10px 15px 10px; /* Margins ensure it is not full bleed */
    }
    .policy-note textarea {
      width: 100%; border: none; text-align: center; font-family: inherit; font-size: 11px;
      color: var(--color-charcoal); resize: none; background: transparent; outline: none;
    }
    .footer-row {
      display: flex; justify-content: space-between; align-items: center; margin-top: 10px;
    }
    .social-profiles { display: flex; gap: 15px; }
    .social-item, .location-info {
      display: flex; align-items: center; gap: 5px; font-size: 11px;
    }
    .social-icon-slot {
      width: 16px; height: 16px; /* Sizing per v2.2 specs for social icons */
    }
  `]
})
export class FooterSectionComponent {
  @Input() mode: 'edit' | 'preview' = 'edit';
  
  policyText = 'Returns accepted within 7 days with receipt.\nWarranty: 6 months on all electronics, manufacturer defects only.';
  
  socialIcons: any = {
    instagram: null,
    tiktok: null,
    facebook: null,
    location: null
  };
}