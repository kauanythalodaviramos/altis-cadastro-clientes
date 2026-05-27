import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from './auth/auth.service';
import { FontService } from './core/font.service';
import { LanguageService } from './core/language.service';
import { ThemeService } from './core/theme.service';
import { AuthImgDirective } from './shared/directives/auth-img.directive';
import { ToastContainer } from './shared/toast/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, AuthImgDirective, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Ativa services de preferencias na bootstrap.
  constructor() {
    inject(ThemeService);
    inject(FontService);
    inject(LanguageService);
  }

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
