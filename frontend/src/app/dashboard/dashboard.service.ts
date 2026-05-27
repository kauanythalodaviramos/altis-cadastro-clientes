import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DashboardStats } from './dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardServiceFront {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/dashboard';

  stats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/stats`);
  }
}
