import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string, duration = 3500): void { this.show('success', message, duration); }
  error(message: string, duration = 5000): void { this.show('error', message, duration); }
  info(message: string, duration = 3500): void { this.show('info', message, duration); }
  warning(message: string, duration = 4000): void { this.show('warning', message, duration); }

  show(type: ToastType, message: string, duration = 3500): void {
    const id = this.nextId++;
    const toast: Toast = { id, type, message, duration };
    this._toasts.update((arr) => [...arr, toast]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: number): void {
    this._toasts.update((arr) => arr.filter(t => t.id !== id));
  }
}
