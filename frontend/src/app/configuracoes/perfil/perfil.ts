import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnInit, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

  protected readonly salvando = signal(false);
  protected readonly mensagem = signal<string | null>(null);
  protected readonly erro = signal<string | null>(null);

  protected readonly emailMudou = signal(false);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly uploadingFoto = signal(false);

  // Modal alterar senha
  protected readonly modalSenhaAberto = signal(false);
  protected readonly alterandoSenha = signal(false);
  protected readonly mensagemSenha = signal<string | null>(null);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    senhaAtual: ['']
  });

  readonly senhaForm = this.fb.group({
    senhaAtual: ['', [Validators.required]],
    senhaNova: ['', [Validators.required, Validators.minLength(8), this.senhaForteValidator]],
    confirmarSenha: ['', [Validators.required]]
  });

  constructor() {
    effect(() => {
      const u = this.auth.user();
      if (u) {
        this.form.patchValue({ nome: u.nome, email: u.email }, { emitEvent: false });
      }
    });

    this.form.get('email')?.valueChanges.subscribe((novo) => {
      const atual = this.auth.user()?.email ?? '';
      this.emailMudou.set((novo ?? '').trim().toLowerCase() !== atual);
    });
  }

  ngOnInit(): void {
    this.auth.refreshMe().subscribe({ error: () => {} });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalSenhaAberto()) {
      this.fecharModalSenha();
    }
  }

  private senhaForteValidator(ctrl: any) {
    const val = (ctrl.value ?? '') as string;
    if (!val) return null;
    return (/[A-Za-z]/.test(val) && /\d/.test(val)) ? null : { senhaFraca: true };
  }

  salvarPerfil(): void {
    this.erro.set(null);
    this.mensagem.set(null);

    if (this.emailMudou()) {
      this.form.get('senhaAtual')?.setValidators([Validators.required]);
    } else {
      this.form.get('senhaAtual')?.clearValidators();
    }
    this.form.get('senhaAtual')?.updateValueAndValidity({ emitEvent: false });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    const { nome, email, senhaAtual } = this.form.getRawValue();

    this.auth.updateProfile({
      nome: (nome ?? '').trim(),
      email: (email ?? '').trim().toLowerCase(),
      senhaAtual: senhaAtual || undefined
    }).subscribe({
      next: () => {
        this.salvando.set(false);
        this.mensagem.set('Perfil atualizado com sucesso.');
        this.emailMudou.set(false);
        this.form.patchValue({ senhaAtual: '' });
        setTimeout(() => this.mensagem.set(null), 4000);
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        this.aplicarErrosBackend(err);
      }
    });
  }

  private aplicarErrosBackend(err: HttpErrorResponse): void {
    if (err.status === 401) {
      this.form.get('senhaAtual')?.setErrors({ backend: err.error?.message || 'Senha atual incorreta.' });
      this.form.get('senhaAtual')?.markAsTouched();
      return;
    }
    if ((err.status === 400 || err.status === 409) && err.error?.errors) {
      for (const campo of Object.keys(err.error.errors)) {
        this.form.get(campo)?.setErrors({ backend: err.error.errors[campo] });
        this.form.get(campo)?.markAsTouched();
      }
      return;
    }
    this.erro.set(err.error?.message ?? 'Erro ao atualizar perfil.');
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
    if (e['backend']) return e['backend'];
    return 'Valor invalido.';
  }

  // ===== Foto =====
  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.erro.set('Tipo nao suportado. Use JPG, PNG ou WebP.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.erro.set('Arquivo maior que 5MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);

    this.uploadingFoto.set(true);
    this.auth.uploadFoto(file).subscribe({
      next: () => {
        this.uploadingFoto.set(false);
        this.auth.refreshMe().subscribe();
        this.mensagem.set('Foto atualizada.');
        setTimeout(() => this.mensagem.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.uploadingFoto.set(false);
        this.previewUrl.set(null);
        this.erro.set(err.error?.message ?? 'Erro ao enviar foto.');
      }
    });
    input.value = '';
  }

  removerFoto(): void {
    if (!confirm(this.translate.instant('CONFIG.CONFIRMAR_REMOVER_FOTO'))) return;
    this.auth.removerFoto().subscribe({
      next: () => {
        this.previewUrl.set(null);
        this.mensagem.set('Foto removida.');
        setTimeout(() => this.mensagem.set(null), 3000);
      },
      error: () => this.erro.set('Erro ao remover foto.')
    });
  }

  protected fotoExibida(): string | null {
    if (this.previewUrl()) return this.previewUrl();
    if (this.auth.user()?.temFoto) return this.auth.fotoUrl();
    return null;
  }

  // ===== Modal Senha =====
  abrirModalSenha(): void {
    this.senhaForm.reset();
    this.mensagemSenha.set(null);
    this.modalSenhaAberto.set(true);
  }

  fecharModalSenha(): void {
    this.modalSenhaAberto.set(false);
  }

  alterarSenha(): void {
    this.mensagemSenha.set(null);
    if (this.senhaForm.invalid) {
      this.senhaForm.markAllAsTouched();
      return;
    }
    const { senhaAtual, senhaNova, confirmarSenha } = this.senhaForm.getRawValue();
    if (senhaNova !== confirmarSenha) {
      this.senhaForm.get('confirmarSenha')?.setErrors({ naoConfere: true });
      return;
    }

    this.alterandoSenha.set(true);
    this.auth.changePassword({
      senhaAtual: senhaAtual ?? '',
      senhaNova: senhaNova ?? ''
    }).subscribe({
      next: () => {
        this.alterandoSenha.set(false);
        this.modalSenhaAberto.set(false);
        this.mensagem.set('Senha alterada com sucesso.');
        setTimeout(() => this.mensagem.set(null), 4000);
      },
      error: (err: HttpErrorResponse) => {
        this.alterandoSenha.set(false);
        if (err.status === 401) {
          this.senhaForm.get('senhaAtual')?.setErrors({ backend: 'Senha atual incorreta.' });
        } else if (err.status === 400 && err.error?.errors) {
          for (const campo of Object.keys(err.error.errors)) {
            this.senhaForm.get(campo)?.setErrors({ backend: err.error.errors[campo] });
          }
        } else {
          this.mensagemSenha.set(err.error?.message ?? 'Erro ao alterar senha.');
        }
      }
    });
  }

  protected campoSenhaInvalido(nome: string): boolean {
    const ctrl = this.senhaForm.get(nome);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  protected mensagemErroSenha(nome: string): string | null {
    const ctrl = this.senhaForm.get(nome);
    if (!ctrl || !ctrl.errors) return null;
    const e = ctrl.errors;
    if (e['required']) return 'Campo obrigatorio.';
    if (e['minlength']) return `Minimo de ${e['minlength'].requiredLength} caracteres.`;
    if (e['senhaFraca']) return 'Senha deve ter ao menos 1 letra e 1 numero.';
    if (e['naoConfere']) return 'As senhas nao conferem.';
    if (e['backend']) return e['backend'];
    return 'Valor invalido.';
  }
}
