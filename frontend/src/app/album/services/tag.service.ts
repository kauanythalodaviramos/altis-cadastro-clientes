import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Tag } from '../models/album.model';

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/tags';

  listar(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.base);
  }

  criar(nome: string): Observable<Tag> {
    return this.http.post<Tag>(this.base, { nome });
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
