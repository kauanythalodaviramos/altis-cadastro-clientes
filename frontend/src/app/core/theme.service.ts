import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const KEY = 'altis.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.load());
  readonly theme = this._theme.asReadonly();

  constructor() {
    this.apply(this._theme());
  }

  set(theme: Theme): void {
    localStorage.setItem(KEY, theme);
    this._theme.set(theme);
    this.apply(theme);
  }

  toggle(): void {
    this.set(this._theme() === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }

  private load(): Theme {
    const v = localStorage.getItem(KEY);
    return v === 'dark' ? 'dark' : 'light';
  }
}
