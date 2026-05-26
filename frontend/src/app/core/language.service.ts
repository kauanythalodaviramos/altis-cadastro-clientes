import { Injectable, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'pt' | 'en' | 'es';

const KEY = 'altis.lang';
const ALL: Language[] = ['pt', 'en', 'es'];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly _current = signal<Language>(this.load());
  readonly current = this._current.asReadonly();

  constructor() {
    this.translate.addLangs(ALL);
    this.translate.setDefaultLang('pt');
    this.translate.use(this._current());
    document.documentElement.lang = this._current();
  }

  set(lang: Language): void {
    localStorage.setItem(KEY, lang);
    this._current.set(lang);
    this.translate.use(lang);
    document.documentElement.lang = lang;
  }

  private load(): Language {
    const v = localStorage.getItem(KEY) as Language | null;
    return v && ALL.includes(v) ? v : 'pt';
  }
}
