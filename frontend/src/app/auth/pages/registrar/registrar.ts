import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-registrar',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registrar.html',
  styleUrl: './registrar.scss'
})
export class Registrar {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly erroGeral = signal<string | null>(null);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    senha: ['', [Validators.required, Validators.minLength(8), this.senhaForteValidator]]
  });

  private senhaForteValidator(ctrl: any) {
    const val = (ctrl.value ?? '') as string;
    if (!val) return null;
    const temLetra = /[A-Za-z]/.test(val);
    const temNumero = /\d/.test(val);
    return (temLetra && temNumero) ? null : { senhaFraca: true };
  }

  registrar(): void {
    this.erroGeral.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const { nome, email, senha } = this.form.getRawValue();
    this.auth.register({
      nome: (nome ?? '').trim(),
      email: (email ?? '').trim().toLowerCase(),
      senha: senha ?? ''
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/clientes'], { state: { mensagem: 'Conta criada com sucesso! Bem-vinda.' } });
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        if (err.status === 409 && err.error?.errors?.email) {
          this.form.get('email')?.setErrors({ backend: err.error.errors.email });
          this.form.get('email')?.markAsTouched();
        } else if (err.status === 400 && err.error?.errors) {
          for (const campo of Object.keys(err.error.errors)) {
            this.form.get(campo)?.setErrors({ backend: err.error.errors[campo] });
            this.form.get(campo)?.markAsTouched();
          }
        } else if (err.status === 0) {
          this.erroGeral.set('Nao foi possivel conectar ao servidor.');
        } else {
          this.erroGeral.set(err.error?.message || 'Erro ao criar conta.');
        }
      }
    });
  }

  protected campoInvalido(nome: string): boolean {
    const ctrl = this.form.get(nome);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  protected mensagemErro(nome: string): string | null {
    const ctrl = this.form.get(nome);
    if (!ctrl || !ctrl.errors) return null;
    const e = ctrl.errors;
    if (e['required']) return 'Campo obrigatorio.';
    if (e['email']) return 'Email invalido.';
    if (e['minlength']) return `Minimo de ${e['minlength'].requiredLength} caracteres.`;
    if (e['maxlength']) return `Maximo de ${e['maxlength'].requiredLength} caracteres.`;
    if (e['senhaFraca']) return 'Senha deve ter ao menos 1 letra e 1 numero.';
    if (e['backend']) return e['backend'];
    return 'Valor invalido.';
  }
}
