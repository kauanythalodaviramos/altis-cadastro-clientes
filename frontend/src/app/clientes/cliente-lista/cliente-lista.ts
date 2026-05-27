import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxMaskPipe } from 'ngx-mask';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { ToastService } from '../../shared/toast/toast.service';
import { Cliente } from '../cliente.model';
import { ClienteService } from '../cliente.service';

@Component({
  selector: 'app-cliente-lista',
  imports: [CommonModule, FormsModule, RouterLink, NgxMaskPipe, TranslateModule],
  templateUrl: './cliente-lista.html',
  styleUrl: './cliente-lista.scss'
})
export class ClienteLista implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly toast = inject(ToastService);
  private readonly filtroInput$ = new Subject<string>();

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly carregando = signal(false);
  protected readonly filtro = signal('');
  protected readonly erro = signal<string | null>(null);
  protected readonly mensagem = signal<string | null>(null);

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state ?? history.state) as { mensagem?: string } | undefined;
    if (state?.mensagem) {
      this.mostrarMensagem(state.mensagem);
    }

    // Stream de digitacao no filtro: debounce + distinct para nao espamar a API.
    this.filtroInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((termo) => this.buscar(termo));

    // Carga inicial: chamada direta, fora do stream com distinct.
    this.buscar('');
  }

  /** Chamado pelo input de filtro */
  onFiltroChange(valor: string): void {
    this.filtro.set(valor);
    this.filtroInput$.next(valor);
  }

  /** Faz a chamada HTTP direta, sem passar pelo distinctUntilChanged.
   *  Usado na carga inicial e apos qualquer mutacao (excluir, voltar do form). */
  private buscar(termo: string): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.clienteService.listar(termo).subscribe({
      next: (lista) => {
        this.clientes.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(this.translate.instant('CLIENTES.ERRO_LISTA'));
        this.carregando.set(false);
      }
    });
  }

  excluir(cliente: Cliente): void {
    if (!cliente.id) return;
    const id = cliente.id;
    const nome = cliente.nome;
    const ok = window.confirm(this.translate.instant('CLIENTES.CONFIRMAR_EXCLUIR', { nome }));
    if (!ok) return;

    this.clienteService.excluir(id, false).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('CLIENTES.EXCLUIDO_SUCESSO', { nome }));
        this.buscar(this.filtro());
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          // Backend retorna mensagem com a contagem de fotos vinculadas.
          const msg = err.error?.message ?? 'Cliente possui fotos vinculadas.';
          const cascade = window.confirm(`${msg}\n\nDeseja excluir o cliente E todas as fotos vinculadas?`);
          if (!cascade) return;
          this.clienteService.excluir(id, true).subscribe({
            next: () => {
              this.toast.success(this.translate.instant('CLIENTES.EXCLUIDO_SUCESSO', { nome }));
              this.buscar(this.filtro());
            },
            error: () => this.toast.error('Erro ao excluir cliente e fotos vinculadas.')
          });
        } else {
          this.toast.error(this.translate.instant('CLIENTES.ERRO_LISTA'));
        }
      }
    });
  }

  private mostrarMensagem(texto: string): void {
    this.mensagem.set(texto);
    setTimeout(() => this.mensagem.set(null), 4000);
  }

  exportarCsv(): void {
    this.clienteService.exportarCsv(this.filtro()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientes_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.toast.success('Arquivo CSV baixado.');
      },
      error: () => this.toast.error('Erro ao exportar CSV.')
    });
  }
}
