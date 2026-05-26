import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxMaskPipe } from 'ngx-mask';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-cliente-lista',
  imports: [CommonModule, FormsModule, RouterLink, NgxMaskPipe],
  templateUrl: './cliente-lista.html',
  styleUrl: './cliente-lista.scss'
})
export class ClienteLista implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly busca$ = new Subject<string>();

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly carregando = signal(false);
  protected readonly filtro = signal('');
  protected readonly erro = signal<string | null>(null);
  protected readonly mensagem = signal<string | null>(null);

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state ?? history.state) as { mensagem?: string } | undefined;
    if (state?.mensagem) {
      this.mensagem.set(state.mensagem);
      setTimeout(() => this.mensagem.set(null), 4000);
    }

    this.busca$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((termo) => {
          this.carregando.set(true);
          return this.clienteService.listar(termo);
        })
      )
      .subscribe({
        next: (lista) => {
          this.clientes.set(lista);
          this.carregando.set(false);
        },
        error: () => {
          this.erro.set('Nao foi possivel carregar a lista. Verifique se o backend esta no ar (porta 8080).');
          this.carregando.set(false);
        }
      });

    this.carregar('');
  }

  carregar(termo: string): void {
    this.busca$.next(termo);
  }

  onFiltroChange(valor: string): void {
    this.filtro.set(valor);
    this.carregar(valor);
  }

  excluir(cliente: Cliente): void {
    if (!cliente.id) return;
    const nome = cliente.nome;
    const ok = window.confirm(`Excluir o cliente "${nome}"? Esta acao nao pode ser desfeita.`);
    if (!ok) return;

    this.clienteService.excluir(cliente.id).subscribe({
      next: () => {
        this.mensagem.set(`Cliente "${nome}" excluido com sucesso.`);
        setTimeout(() => this.mensagem.set(null), 4000);
        this.carregar(this.filtro());
      },
      error: () => {
        this.erro.set('Erro ao excluir o cliente.');
      }
    });
  }
}
