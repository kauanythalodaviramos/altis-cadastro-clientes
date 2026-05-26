import { Injectable, signal } from '@angular/core';

export type FontLevel = 'sm' | 'md' | 'lg' | 'xl';

const KEY = 'altis.fontSize';
const ALL: FontLevel[] = ['sm', 'md', 'lg', 'xl'];

@Injectable({ providedIn: 'root' })
export class FontService {
  private readonly _level = signal<FontLevel>(this.load());
  readonly level = this._level.asReadonly();

  constructor() {
    this.apply(this._level());
  }

  set(level: FontLevel): void {
    localStorage.setItem(KEY, level);
    this._level.set(level);
    this.apply(level);
  }

  private apply(level: FontLevel): void {
    const html = document.documentElement;
    for (const l of ALL) html.classList.remove(`font-${l}`);
    html.classList.add(`font-${level}`);
  }

  private load(): FontLevel {
    const v = localStorage.getItem(KEY) as FontLevel | null;
    return v && ALL.includes(v) ? v : 'md';
  }
}
