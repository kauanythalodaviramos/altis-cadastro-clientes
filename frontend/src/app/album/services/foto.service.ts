import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Foto, FotoFiltro, FotoUpdate, LikeResponse } from '../models/album.model';

@Injectable({ providedIn: 'root' })
export class FotoService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/fotos';

  upload(file: File, emocaoId: number, opts: {
    clienteId?: number | null;
    titulo?: string;
    descricao?: string;
    tagIds?: number[];
  }): Observable<Foto> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('emocaoId', String(emocaoId));
    if (opts.clienteId != null) fd.append('clienteId', String(opts.clienteId));
    if (opts.titulo) fd.append('titulo', opts.titulo);
    if (opts.descricao) fd.append('descricao', opts.descricao);
    if (opts.tagIds && opts.tagIds.length) fd.append('tags', opts.tagIds.join(','));
    return this.http.post<Foto>(this.base, fd);
  }

  listar(f: FotoFiltro = {}): Observable<Foto[]> {
    return this.http.get<Foto[]>(this.base, { params: this.buildParams(f) });
  }

  lootbox(f: FotoFiltro = {}): Observable<Foto[]> {
    return this.http.get<Foto[]>(`${this.base}/lootbox`, { params: this.buildParams(f) });
  }

  buscarPorId(id: number): Observable<Foto> {
    return this.http.get<Foto>(`${this.base}/${id}`);
  }

  atualizar(id: number, req: FotoUpdate): Observable<Foto> {
    return this.http.put<Foto>(`${this.base}/${id}`, req);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  like(id: number): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${this.base}/${id}/like`, {});
  }

  unlike(id: number): Observable<LikeResponse> {
    return this.http.delete<LikeResponse>(`${this.base}/${id}/like`);
  }

  /** URL pra usar com a diretiva appAuthImg (precisa do Bearer token). */
  imagemUrl(id: number): string {
    return `${this.base}/${id}/imagem`;
  }

  /** Para preview imediato durante upload (sem ir ao backend). */
  fileToDataUrl(file: File): Observable<string> {
    return new Observable<string>((sub) => {
      const reader = new FileReader();
      reader.onload = () => { sub.next(reader.result as string); sub.complete(); };
      reader.onerror = (e) => sub.error(e);
      reader.readAsDataURL(file);
    });
  }

  private buildParams(f: FotoFiltro): HttpParams {
    let p = new HttpParams();
    if (f.emocoes && f.emocoes.length) p = p.set('emocoes', f.emocoes.join(','));
    if (f.tags && f.tags.length) p = p.set('tags', f.tags.join(','));
    if (f.clienteId != null) p = p.set('clienteId', String(f.clienteId));
    if (f.favoritismo) p = p.set('favoritismo', f.favoritismo);
    if (f.order) p = p.set('order', f.order);
    return p;
  }
}
