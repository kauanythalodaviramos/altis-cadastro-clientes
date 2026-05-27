import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, debounceTime, forkJoin } from 'rxjs';

import { ClienteService } from '../../clientes/cliente.service';
import { Cliente } from '../../clientes/cliente.model';
import { AuthImgDirective } from '../../shared/directives/auth-img.directive';
import { Emocao, Favoritismo, Foto, FotoFiltro, Ordem, Tag } from '../models/album.model';
import { EmocaoService } from '../services/emocao.service';
import { FotoService } from '../services/foto.service';
import { TagService } from '../services/tag.service';

@Component({
  selector: 'app-galeria',
  imports: [CommonModule, FormsModule, TranslateModule, AuthImgDirective],
  templateUrl: './galeria.html',
  styleUrl: './galeria.scss'
})
export class Galeria implements OnInit {
  private readonly fotoService = inject(FotoService);
  private readonly emocaoService = inject(EmocaoService);
  private readonly tagService = inject(TagService);
  private readonly clienteService = inject(ClienteService);
  private readonly translate = inject(TranslateService);

  // Listas auxiliares
  protected readonly emocoes = signal<Emocao[]>([]);
  protected readonly tags = signal<Tag[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);

  // Fotos + estado
  protected readonly fotos = signal<Foto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly mensagem = signal<string | null>(null);

  // Filtros
  protected readonly emocoesSel = signal<Set<number>>(new Set());
  protected readonly tagsSel = signal<Set<number>>(new Set());
  protected readonly clienteSel = signal<number | null>(null);
  protected readonly favSel = signal<Favoritismo>('');
  protected readonly orderSel = signal<Ordem>('recent');

  // Animação de likes
  protected readonly likeBumpId = signal<number | null>(null);

  // Modal upload
  protected readonly uploadAberto = signal(false);
  protected readonly uploadFile = signal<File | null>(null);
  protected readonly uploadPreview = signal<string | null>(null);
  protected readonly uploadTitulo = signal('');
  protected readonly uploadDescricao = signal('');
  protected readonly uploadEmocaoId = signal<number | null>(null);
  protected readonly uploadClienteId = signal<number | null>(null);
  protected readonly uploadTagsSel = signal<Set<number>>(new Set());
  protected readonly uploadNovaTagNome = signal('');
  protected readonly uploadEnviando = signal(false);
  protected readonly uploadErro = signal<string | null>(null);

  // Modal detalhe
  protected readonly fotoDetalhe = signal<Foto | null>(null);
  protected readonly editando = signal(false);
  protected readonly editTitulo = signal('');
  protected readonly editDescricao = signal('');
  protected readonly editEmocaoId = signal<number | null>(null);
  protected readonly editClienteId = signal<number | null>(null);
  protected readonly editTagsSel = signal<Set<number>>(new Set());

  // Re-fetch debounce
  private readonly fetch$ = new Subject<void>();

  constructor() {
    this.fetch$.pipe(debounceTime(120)).subscribe(() => this.carregarFotos());
  }

  ngOnInit(): void {
    this.carregarReferencias();
    this.carregarFotos();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.fotoDetalhe()) {
      this.fecharDetalhe();
    } else if (this.uploadAberto()) {
      this.fecharUpload();
    }
  }

  // ============ Loaders ============
  private carregarReferencias(): void {
    forkJoin({
      emocoes: this.emocaoService.listar(),
      tags: this.tagService.listar(),
      clientes: this.clienteService.listar()
    }).subscribe({
      next: ({ emocoes, tags, clientes }) => {
        this.emocoes.set(emocoes);
        this.tags.set(tags);
        this.clientes.set(clientes as Cliente[]);
      }
    });
  }

  protected carregarFotos(): void {
    this.carregando.set(true);
    this.erro.set(null);
    const filtro: FotoFiltro = {
      emocoes: Array.from(this.emocoesSel()),
      tags: Array.from(this.tagsSel()),
      clienteId: this.clienteSel(),
      favoritismo: this.favSel(),
      order: this.orderSel()
    };
    this.fotoService.listar(filtro).subscribe({
      next: (lista) => {
        this.fotos.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Nao foi possivel carregar a galeria.');
        this.carregando.set(false);
      }
    });
  }

  protected imagemUrl(id: number): string {
    return this.fotoService.imagemUrl(id);
  }

  // ============ Filtros ============
  toggleEmocao(id: number): void {
    const s = new Set(this.emocoesSel());
    s.has(id) ? s.delete(id) : s.add(id);
    this.emocoesSel.set(s);
    this.fetch$.next();
  }

  toggleTag(id: number): void {
    const s = new Set(this.tagsSel());
    s.has(id) ? s.delete(id) : s.add(id);
    this.tagsSel.set(s);
    this.fetch$.next();
  }

  setCliente(v: any): void {
    const id = v === '' || v == null ? null : Number(v);
    this.clienteSel.set(id);
    this.fetch$.next();
  }

  setFav(v: Favoritismo): void {
    this.favSel.set(v);
    this.fetch$.next();
  }

  setOrder(v: any): void {
    this.orderSel.set(v as Ordem);
    this.fetch$.next();
  }

  protected categoriaLabel(cat: string): string {
    return cat === 'amada' ? 'ALBUM.CAT_AMADA'
      : cat === 'mediana' ? 'ALBUM.CAT_MEDIANA'
      : 'ALBUM.CAT_MENOS';
  }

  // ============ Like / Unlike ============
  like(foto: Foto, ev: MouseEvent): void {
    ev.stopPropagation();
    this.likeBumpId.set(foto.id);
    this.fotoService.like(foto.id).subscribe({
      next: (resp) => {
        this.fotos.update((arr) => arr.map(f => f.id === foto.id ? { ...f, likesCount: resp.likesCount, categoria: resp.categoria } : f));
        // Atualiza tambem o detalhe se estiver aberto
        if (this.fotoDetalhe()?.id === foto.id) {
          this.fotoDetalhe.update((f) => f ? { ...f, likesCount: resp.likesCount, categoria: resp.categoria } : f);
        }
        setTimeout(() => this.likeBumpId.set(null), 320);
      }
    });
  }

  unlike(foto: Foto, ev: MouseEvent): void {
    ev.stopPropagation();
    this.fotoService.unlike(foto.id).subscribe({
      next: (resp) => {
        this.fotos.update((arr) => arr.map(f => f.id === foto.id ? { ...f, likesCount: resp.likesCount, categoria: resp.categoria } : f));
        if (this.fotoDetalhe()?.id === foto.id) {
          this.fotoDetalhe.update((f) => f ? { ...f, likesCount: resp.likesCount, categoria: resp.categoria } : f);
        }
      }
    });
  }

  // ============ Upload modal ============
  abrirUpload(): void {
    this.uploadFile.set(null);
    this.uploadPreview.set(null);
    this.uploadTitulo.set('');
    this.uploadDescricao.set('');
    this.uploadEmocaoId.set(this.emocoes()[0]?.id ?? null);
    this.uploadClienteId.set(null);
    this.uploadTagsSel.set(new Set());
    this.uploadNovaTagNome.set('');
    this.uploadErro.set(null);
    this.uploadAberto.set(true);
  }

  fecharUpload(): void {
    this.uploadAberto.set(false);
  }

  onArquivoEscolhido(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.uploadErro.set('Tipo nao suportado. Use JPG, PNG ou WebP.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.uploadErro.set('Arquivo maior que 5MB.');
      input.value = '';
      return;
    }
    this.uploadErro.set(null);
    this.uploadFile.set(file);
    this.fotoService.fileToDataUrl(file).subscribe((url) => this.uploadPreview.set(url));
  }

  toggleUploadTag(id: number): void {
    const s = new Set(this.uploadTagsSel());
    s.has(id) ? s.delete(id) : s.add(id);
    this.uploadTagsSel.set(s);
  }

  criarNovaTag(): void {
    const nome = (this.uploadNovaTagNome() ?? '').trim();
    if (!nome) return;
    this.tagService.criar(nome).subscribe({
      next: (t) => {
        this.tags.update((arr) => [...arr, t].sort((a, b) => a.nome.localeCompare(b.nome)));
        this.uploadTagsSel.update((s) => new Set([...s, t.id]));
        this.uploadNovaTagNome.set('');
      },
      error: (err: HttpErrorResponse) => {
        this.uploadErro.set(err.error?.message ?? 'Erro ao criar tag.');
      }
    });
  }

  enviarUpload(): void {
    const file = this.uploadFile();
    const emocaoId = this.uploadEmocaoId();
    if (!file || emocaoId == null) {
      this.uploadErro.set('Selecione um arquivo e uma emocao.');
      return;
    }
    this.uploadEnviando.set(true);
    this.uploadErro.set(null);
    this.fotoService.upload(file, emocaoId, {
      titulo: this.uploadTitulo() || undefined,
      descricao: this.uploadDescricao() || undefined,
      clienteId: this.uploadClienteId(),
      tagIds: Array.from(this.uploadTagsSel())
    }).subscribe({
      next: () => {
        this.uploadEnviando.set(false);
        this.uploadAberto.set(false);
        this.mostrarMensagem(this.translate.instant('ALBUM.UPLOAD_SUCESSO'));
        this.carregarFotos();
      },
      error: (err: HttpErrorResponse) => {
        this.uploadEnviando.set(false);
        this.uploadErro.set(err.error?.message ?? 'Erro no upload.');
      }
    });
  }

  // ============ Detalhe / edit ============
  abrirDetalhe(foto: Foto): void {
    this.fotoDetalhe.set(foto);
    this.editando.set(false);
    this.editTitulo.set(foto.titulo ?? '');
    this.editDescricao.set(foto.descricao ?? '');
    this.editEmocaoId.set(foto.emocao.id);
    this.editClienteId.set(foto.cliente?.id ?? null);
    this.editTagsSel.set(new Set(foto.tags.map(t => t.id)));
  }

  fecharDetalhe(): void {
    this.fotoDetalhe.set(null);
    this.editando.set(false);
  }

  comecarEdicao(): void {
    this.editando.set(true);
  }

  cancelarEdicao(): void {
    const f = this.fotoDetalhe();
    if (f) {
      this.editTitulo.set(f.titulo ?? '');
      this.editDescricao.set(f.descricao ?? '');
      this.editEmocaoId.set(f.emocao.id);
      this.editClienteId.set(f.cliente?.id ?? null);
      this.editTagsSel.set(new Set(f.tags.map(t => t.id)));
    }
    this.editando.set(false);
  }

  toggleEditTag(id: number): void {
    const s = new Set(this.editTagsSel());
    s.has(id) ? s.delete(id) : s.add(id);
    this.editTagsSel.set(s);
  }

  salvarEdicao(): void {
    const f = this.fotoDetalhe();
    if (!f || this.editEmocaoId() == null) return;
    this.fotoService.atualizar(f.id, {
      titulo: this.editTitulo() || null,
      descricao: this.editDescricao() || null,
      emocaoId: this.editEmocaoId()!,
      clienteId: this.editClienteId(),
      tagIds: Array.from(this.editTagsSel())
    }).subscribe({
      next: (atualizada) => {
        this.fotos.update((arr) => arr.map(x => x.id === atualizada.id ? atualizada : x));
        this.fotoDetalhe.set(atualizada);
        this.editando.set(false);
        this.mostrarMensagem('Foto atualizada.');
      }
    });
  }

  excluirFoto(): void {
    const f = this.fotoDetalhe();
    if (!f) return;
    if (!confirm(this.translate.instant('ALBUM.CONFIRMAR_EXCLUIR'))) return;
    this.fotoService.excluir(f.id).subscribe({
      next: () => {
        this.fotos.update((arr) => arr.filter(x => x.id !== f.id));
        this.fechardetalheELimpar();
        this.mostrarMensagem(this.translate.instant('ALBUM.EXCLUIDA_SUCESSO'));
      }
    });
  }

  private fechardetalheELimpar(): void {
    this.fotoDetalhe.set(null);
    this.editando.set(false);
  }

  private mostrarMensagem(t: string): void {
    this.mensagem.set(t);
    setTimeout(() => this.mensagem.set(null), 3500);
  }

  protected nomeEmocao(id: number | null | undefined): string {
    if (id == null) return '';
    return this.emocoes().find(e => e.id === id)?.nome ?? '';
  }

  protected onUploadEmocaoChange(v: any): void {
    this.uploadEmocaoId.set(v ? Number(v) : null);
  }

  protected onUploadClienteChange(v: any): void {
    this.uploadClienteId.set(v && v !== '' ? Number(v) : null);
  }

  protected onEditEmocaoChange(v: any): void {
    this.editEmocaoId.set(v ? Number(v) : null);
  }

  protected onEditClienteChange(v: any): void {
    this.editClienteId.set(v && v !== '' ? Number(v) : null);
  }
}
