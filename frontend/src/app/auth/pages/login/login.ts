import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  entrar(): void {
    this.erro.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const { email, senha } = this.form.getRawValue();
    this.auth.login({ email: (email ?? '').trim().toLowerCase(), senha: senha ?? '' }).subscribe({
      next: () => {
        this.enviando.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/clientes';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        if (err.status === 401) {
          this.erro.set('Email ou senha incorretos.');
        } else if (err.status === 0) {
          this.erro.set('Nao foi possivel conectar ao servidor. Verifique se o backend esta no ar.');
        } else {
          this.erro.set(err.error?.message || 'Erro ao fazer login.');
        }
      }
    });
  }

  protected campoInvalido(nome: string): boolean {
    const ctrl = this.form.get(nome);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}
