import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxMaskDirective } from 'ngx-mask';

import { ApiErrorResponse, Cliente } from '../cliente.model';
import { ClienteService } from '../cliente.service';
import { cpfValidator, telefoneValidator } from '../../shared/validators/cpf.validator';

@Component({
  selector: 'app-cliente-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxMaskDirective, TranslateModule],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.scss'
})
export class ClienteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly clienteId = signal<number | null>(null);
  protected readonly erroGeral = signal<string | null>(null);

  protected readonly ufs = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
    'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ];

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(150)]],
    cpf: ['', [Validators.required, cpfValidator()]],
    telefone: ['', [Validators.required, telefoneValidator()]],
    endereco: this.fb.group({
      cep: [''],
      logradouro: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      uf: ['']
    }),
    observacoes: ['', [Validators.maxLength(100)]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.clienteId.set(id);
      this.carregar(id);
    }
  }

  get edicao(): boolean {
    return this.clienteId() !== null;
  }

  get observacoesLength(): number {
    return (this.form.get('observacoes')?.value ?? '').length;
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.clienteService.buscarPorId(id).subscribe({
      next: (cliente) => {
        this.form.patchValue({
          nome: cliente.nome,
          cpf: cliente.cpf,
          telefone: cliente.telefone,
          observacoes: cliente.observacoes ?? '',
          endereco: {
            cep: cliente.endereco?.cep ?? '',
            logradouro: cliente.endereco?.logradouro ?? '',
            numero: cliente.endereco?.numero ?? '',
            complemento: cliente.endereco?.complemento ?? '',
            bairro: cliente.endereco?.bairro ?? '',
            cidade: cliente.endereco?.cidade ?? '',
            uf: cliente.endereco?.uf ?? ''
          }
        });
        this.carregando.set(false);
      },
      error: () => {
        this.erroGeral.set('Nao foi possivel carregar o cliente.');
        this.carregando.set(false);
      }
    });
  }

  salvar(): void {
    this.erroGeral.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const payload: Cliente = {
      nome: (valores.nome ?? '').trim(),
      cpf: (valores.cpf ?? '').replace(/\D/g, ''),
      telefone: (valores.telefone ?? '').replace(/\D/g, ''),
      observacoes: valores.observacoes || null,
      endereco: {
        cep: valores.endereco?.cep?.replace(/\D/g, '') || null,
        logradouro: valores.endereco?.logradouro || null,
        numero: valores.endereco?.numero || null,
        complemento: valores.endereco?.complemento || null,
        bairro: valores.endereco?.bairro || null,
        cidade: valores.endereco?.cidade || null,
        uf: valores.endereco?.uf || null
      }
    };

    this.salvando.set(true);
    const id = this.clienteId();
    const obs$ = id !== null
      ? this.clienteService.atualizar(id, payload)
      : this.clienteService.criar(payload);

    obs$.subscribe({
      next: () => {
        this.salvando.set(false);
        const key = id ? 'CLIENTES.ATUALIZADO_SUCESSO' : 'CLIENTES.CRIADO_SUCESSO';
        this.router.navigate(['/clientes'], { state: { mensagem: this.translate.instant(key) } });
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        this.aplicarErrosBackend(err);
      }
    });
  }

  private aplicarErrosBackend(err: HttpErrorResponse): void {
    const body = err.error as ApiErrorResponse | null;

    if (err.status === 400 || err.status === 409) {
      if (body?.errors) {
        for (const campo of Object.keys(body.errors)) {
          const control = this.form.get(campo);
          if (control) {
            control.setErrors({ backend: body.errors[campo] });
            control.markAsTouched();
          }
        }
        return;
      }
      this.erroGeral.set(body?.message ?? 'Dados invalidos.');
      return;
    }
    this.erroGeral.set('Erro inesperado ao salvar. Verifique se o servidor backend esta no ar.');
  }

  protected campoInvalido(nome: string): boolean {
    const ctrl = this.form.get(nome);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  protected mensagemErro(nome: string): string | null {
    const ctrl = this.form.get(nome);
    if (!ctrl || !ctrl.errors) return null;
    const erros = ctrl.errors;
    if (erros['required']) return 'Campo obrigatorio.';
    if (erros['minlength']) return `Minimo de ${erros['minlength'].requiredLength} caracteres.`;
    if (erros['maxlength']) return `Maximo de ${erros['maxlength'].requiredLength} caracteres.`;
    if (erros['cpfInvalido']) return 'CPF invalido.';
    if (erros['telefoneInvalido']) return 'Telefone deve ter 10 ou 11 digitos.';
    if (erros['backend']) return erros['backend'];
    return 'Valor invalido.';
  }
}
