import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule],
  template: `
    <div class="toast-stack">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast-item toast-{{ t.type }}" role="status">
          <span class="toast-icon">
            @switch (t.type) {
              @case ('success') { <i class="bi bi-check-circle-fill"></i> }
              @case ('error')   { <i class="bi bi-x-circle-fill"></i> }
              @case ('warning') { <i class="bi bi-exclamation-triangle-fill"></i> }
              @case ('info')    { <i class="bi bi-info-circle-fill"></i> }
            }
          </span>
          <span class="toast-msg">{{ t.message }}</span>
          <button type="button" class="toast-close" (click)="toastService.dismiss(t.id)" aria-label="Fechar">
            <i class="bi bi-x"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .toast-stack {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 380px;
      pointer-events: none;
    }
    .toast-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.75rem 0.625rem 0.875rem;
      border-radius: 0.625rem;
      background: var(--altis-card-bg);
      color: var(--altis-text);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
      border-left: 4px solid;
      font-size: 0.9rem;
      pointer-events: auto;
      animation: toastEnter 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .toast-success { border-color: #198754; }
    .toast-success .toast-icon { color: #198754; }
    .toast-error   { border-color: #dc3545; }
    .toast-error .toast-icon { color: #dc3545; }
    .toast-warning { border-color: #fd7e14; }
    .toast-warning .toast-icon { color: #fd7e14; }
    .toast-info    { border-color: #0d6efd; }
    .toast-info .toast-icon { color: #0d6efd; }
    .toast-icon { font-size: 1.15rem; line-height: 1; }
    .toast-msg { flex: 1; line-height: 1.3; }
    .toast-close {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.6;
      cursor: pointer;
      padding: 0 0.25rem;
      font-size: 1rem;
      line-height: 1;
      transition: opacity 150ms;
    }
    .toast-close:hover { opacity: 1; }
    @keyframes toastEnter {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
}
