import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Emocao, EmocaoRequest } from '../models/album.model';

@Injectable({ providedIn: 'root' })
export class EmocaoService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/emocoes';

  listar(): Observable<Emocao[]> {
    return this.http.get<Emocao[]>(this.base);
  }

  criar(req: EmocaoRequest): Observable<Emocao> {
    return this.http.post<Emocao>(this.base, req);
  }

  atualizar(id: number, req: EmocaoRequest): Observable<Emocao> {
    return this.http.put<Emocao>(`${this.base}/${id}`, req);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
