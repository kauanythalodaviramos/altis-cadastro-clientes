import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { ClienteService } from '../../clientes/cliente.service';
import { Cliente } from '../../clientes/cliente.model';
import { AuthImgDirective } from '../../shared/directives/auth-img.directive';
import { Emocao, Favoritismo, Foto, Tag } from '../models/album.model';
import { EmocaoService } from '../services/emocao.service';
import { FotoService } from '../services/foto.service';
import { TagService } from '../services/tag.service';

type LootState = 'idle' | 'shaking' | 'opening' | 'revealing' | 'done' | 'empty';

@Component({
  selector: 'app-lootbox',
  imports: [CommonModule, FormsModule, TranslateModule, AuthImgDirective],
  templateUrl: './lootbox.html',
  styleUrl: './lootbox.scss'
})
export class Lootbox implements OnInit {
  private readonly fotoService = inject(FotoService);
  private readonly emocaoService = inject(EmocaoService);
  private readonly tagService = inject(TagService);
  private readonly clienteService = inject(ClienteService);

  protected readonly emocoes = signal<Emocao[]>([]);
  protected readonly tags = signal<Tag[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);

  protected readonly emocoesSel = signal<Set<number>>(new Set());
  protected readonly tagsSel = signal<Set<number>>(new Set());
  protected readonly clienteSel = signal<number | null>(null);
  protected readonly favSel = signal<Favoritismo>('amados');

  protected readonly state = signal<LootState>('idle');
  protected readonly fotosSorteadas = signal<Foto[]>([]);

  ngOnInit(): void {
    forkJoin({
      emocoes: this.emocaoService.listar(),
      tags: this.tagService.listar(),
      clientes: this.clienteService.listar()
    }).subscribe(({ emocoes, tags, clientes }) => {
      this.emocoes.set(emocoes);
      this.tags.set(tags);
      this.clientes.set(clientes as Cliente[]);
    });
  }

  toggleEmocao(id: number): void {
    const s = new Set(this.emocoesSel());
    s.has(id) ? s.delete(id) : s.add(id);
    this.emocoesSel.set(s);
  }

  toggleTag(id: number): void {
    const s = new Set(this.tagsSel());
    s.has(id) ? s.delete(id) : s.add(id);
    this.tagsSel.set(s);
  }

  setCliente(v: any): void {
    this.clienteSel.set(v === '' || v == null ? null : Number(v));
  }

  setFav(f: Favoritismo): void {
    this.favSel.set(f);
  }

  imagemUrl(id: number): string {
    return this.fotoService.imagemUrl(id);
  }

  abrirCaixa(): void {
    if (this.state() !== 'idle' && this.state() !== 'done' && this.state() !== 'empty') return;
    this.fotosSorteadas.set([]);
    this.state.set('shaking');

    // Sequência: shaking (900ms) -> opening (300ms) -> revealing (cards aparecem) -> done
    setTimeout(() => this.state.set('opening'), 900);

    setTimeout(() => {
      this.fotoService.lootbox({
        emocoes: Array.from(this.emocoesSel()),
        tags: Array.from(this.tagsSel()),
        clienteId: this.clienteSel(),
        favoritismo: this.favSel()
      }).subscribe({
        next: (fotos) => {
          if (!fotos.length) {
            this.state.set('empty');
            return;
          }
          this.fotosSorteadas.set(fotos);
          this.state.set('revealing');
          // Cada card revela com delay 600ms; total = 600 * fotos.length + extra
          setTimeout(() => this.state.set('done'), 600 * fotos.length + 200);
        },
        error: () => this.state.set('empty')
      });
    }, 1200);
  }

  novamente(): void {
    this.state.set('idle');
    this.fotosSorteadas.set([]);
  }

  protected categoriaLabel(cat: string): string {
    return cat === 'amada' ? 'ALBUM.CAT_AMADA'
      : cat === 'mediana' ? 'ALBUM.CAT_MEDIANA'
      : 'ALBUM.CAT_MENOS';
  }
}
