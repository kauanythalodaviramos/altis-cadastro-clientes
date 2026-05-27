import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Tag } from '../models/album.model';
import { TagService } from '../services/tag.service';

@Component({
  selector: 'app-tags',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './tags.html',
  styleUrl: './tags.scss'
})
export class Tags implements OnInit {
  private readonly tagService = inject(TagService);
  private readonly translate = inject(TranslateService);

  protected readonly tags = signal<Tag[]>([]);
  protected readonly carregando = signal(true);
  protected readonly novaTag = signal('');
  protected readonly criando = signal(false);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.tagService.listar().subscribe({
      next: (lista) => { this.tags.set(lista); this.carregando.set(false); },
      error: () => { this.erro.set('Erro ao carregar tags.'); this.carregando.set(false); }
    });
  }

  criar(): void {
    const nome = this.novaTag().trim();
    if (!nome) return;
    this.criando.set(true);
    this.erro.set(null);
    this.tagService.criar(nome).subscribe({
      next: () => {
        this.criando.set(false);
        this.novaTag.set('');
        this.carregar();
      },
      error: (err: HttpErrorResponse) => {
        this.criando.set(false);
        this.erro.set(err.error?.message ?? err.error?.errors?.nome ?? 'Erro ao criar tag.');
      }
    });
  }

  excluir(t: Tag): void {
    if (!confirm(this.translate.instant('ALBUM.CONFIRMAR_EXCLUIR_TAG', { nome: t.nome }))) return;
    this.tagService.excluir(t.id).subscribe({
      next: () => this.carregar(),
      error: (err: HttpErrorResponse) => this.erro.set(err.error?.message ?? 'Erro ao excluir.')
    });
  }
}
