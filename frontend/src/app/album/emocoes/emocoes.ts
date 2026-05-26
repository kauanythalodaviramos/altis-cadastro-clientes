import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { Emocao, EmocaoRequest } from '../models/album.model';
import { EmocaoService } from '../services/emocao.service';

const CORES_PADRAO = ['#dc3545', '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0', '#0d6efd', '#6610f2', '#d63384', '#6c757d'];
const ICONES_SUGERIDOS = ['emoji-smile', 'emoji-frown', 'heart-fill', 'moon', 'lightning-fill', 'clock-history', 'stars', 'three-dots', 'fire', 'gem', 'sun', 'flower'];

@Component({
  selector: 'app-emocoes',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './emocoes.html',
  styleUrl: './emocoes.scss'
})
export class Emocoes implements OnInit {
  private readonly emocaoService = inject(EmocaoService);

  protected readonly emocoes = signal<Emocao[]>([]);
  protected readonly carregando = signal(true);
  protected readonly mensagem = signal<string | null>(null);
  protected readonly erro = signal<string | null>(null);

  protected readonly modalAberto = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly formNome = signal('');
  protected readonly formCor = signal(CORES_PADRAO[0]);
  protected readonly formIcone = signal('');
  protected readonly salvando = signal(false);
  protected readonly formErro = signal<string | null>(null);

  protected readonly cores = CORES_PADRAO;
  protected readonly icones = ICONES_SUGERIDOS;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.emocaoService.listar().subscribe({
      next: (lista) => { this.emocoes.set(lista); this.carregando.set(false); },
      error: () => { this.erro.set('Erro ao carregar emocoes.'); this.carregando.set(false); }
    });
  }

  abrirNovo(): void {
    this.editandoId.set(null);
    this.formNome.set('');
    this.formCor.set(CORES_PADRAO[0]);
    this.formIcone.set('');
    this.formErro.set(null);
    this.modalAberto.set(true);
  }

  abrirEditar(e: Emocao): void {
    this.editandoId.set(e.id);
    this.formNome.set(e.nome);
    this.formCor.set(e.cor || CORES_PADRAO[0]);
    this.formIcone.set(e.icone || '');
    this.formErro.set(null);
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }

  salvar(): void {
    const nome = this.formNome().trim();
    if (!nome) {
      this.formErro.set('Nome obrigatorio.');
      return;
    }
    const req: EmocaoRequest = {
      nome,
      cor: this.formCor() || undefined,
      icone: this.formIcone() || undefined
    };
    this.salvando.set(true);
    this.formErro.set(null);

    const obs = this.editandoId() != null
      ? this.emocaoService.atualizar(this.editandoId()!, req)
      : this.emocaoService.criar(req);

    obs.subscribe({
      next: () => {
        this.salvando.set(false);
        this.modalAberto.set(false);
        this.mostrarMensagem(this.editandoId() != null ? 'Emocao atualizada.' : 'Emocao criada.');
        this.carregar();
      },
      error: (err: HttpErrorResponse) => {
        this.salvando.set(false);
        if (err.status === 409 && err.error?.errors?.nome) {
          this.formErro.set(err.error.errors.nome);
        } else if (err.status === 400 && err.error?.errors) {
          this.formErro.set(Object.values(err.error.errors).join(' '));
        } else {
          this.formErro.set(err.error?.message ?? 'Erro ao salvar.');
        }
      }
    });
  }

  excluir(e: Emocao): void {
    if (!confirm(`Excluir a emocao "${e.nome}"? Se houver fotos vinculadas, sera bloqueado.`)) return;
    this.emocaoService.excluir(e.id).subscribe({
      next: () => {
        this.mostrarMensagem(`Emocao "${e.nome}" excluida.`);
        this.carregar();
      },
      error: (err: HttpErrorResponse) => {
        this.erro.set(err.error?.message ?? 'Erro ao excluir.');
        setTimeout(() => this.erro.set(null), 4000);
      }
    });
  }

  private mostrarMensagem(t: string): void {
    this.mensagem.set(t);
    setTimeout(() => this.mensagem.set(null), 3500);
  }

  protected setCor(c: string): void { this.formCor.set(c); }
  protected setIcone(i: string): void { this.formIcone.set(i); }
}
