import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FontLevel, FontService } from '../../core/font.service';
import { Language, LanguageService } from '../../core/language.service';
import { Theme, ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-acessibilidade',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './acessibilidade.html',
  styleUrl: './acessibilidade.scss'
})
export class Acessibilidade {
  protected readonly theme = inject(ThemeService);
  protected readonly font = inject(FontService);
  protected readonly lang = inject(LanguageService);

  protected readonly idiomas: { code: Language; label: string; flag: string }[] = [
    { code: 'pt', label: 'CONFIG.IDIOMA_PT', flag: '🇧🇷' },
    { code: 'en', label: 'CONFIG.IDIOMA_EN', flag: '🇺🇸' },
    { code: 'es', label: 'CONFIG.IDIOMA_ES', flag: '🇪🇸' }
  ];

  protected readonly fontes: { level: FontLevel; label: string; size: string }[] = [
    { level: 'sm', label: 'CONFIG.FONTE_SM', size: '14px' },
    { level: 'md', label: 'CONFIG.FONTE_MD', size: '16px' },
    { level: 'lg', label: 'CONFIG.FONTE_LG', size: '18px' },
    { level: 'xl', label: 'CONFIG.FONTE_XL', size: '20px' }
  ];

  setTheme(t: Theme): void {
    this.theme.set(t);
  }

  setFont(level: FontLevel): void {
    this.font.set(level);
  }

  setLang(l: Language): void {
    this.lang.set(l);
  }
}
