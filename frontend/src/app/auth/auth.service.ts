import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import {
  ChangePasswordRequest,
  JwtResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User
} from './auth.model';

const TOKEN_KEY = 'altis.auth.token';
const USER_KEY = 'altis.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/auth';

  private readonly _user = signal<User | null>(this.loadUserFromStorage());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null && this.getToken() !== null);

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(req: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/login`, req).pipe(
      tap((resp) => this.storeAuth(resp))
    );
  }

  register(req: RegisterRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/register`, req).pipe(
      tap((resp) => this.storeAuth(resp))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  refreshMe(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      tap((u) => {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        this._user.set(u);
      })
    );
  }

  updateProfile(req: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/me`, req).pipe(
      tap((u) => {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        this._user.set(u);
      })
    );
  }

  changePassword(req: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/me/senha`, req);
  }

  uploadFoto(file: File): Observable<void> {
    const form = new FormData();
    form.append('file', file);
    return this.http.put<void>(`${this.baseUrl}/me/foto`, form).pipe(
      tap(() => {
        const u = this._user();
        if (u) {
          const updated = { ...u, temFoto: true };
          localStorage.setItem(USER_KEY, JSON.stringify(updated));
          this._user.set(updated);
        }
      })
    );
  }

  removerFoto(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/me/foto`).pipe(
      tap(() => {
        const u = this._user();
        if (u) {
          const updated = { ...u, temFoto: false };
          localStorage.setItem(USER_KEY, JSON.stringify(updated));
          this._user.set(updated);
        }
      })
    );
  }

  fotoUrl(): string {
    const u = this._user();
    if (!u || !u.temFoto) return '';
    // Cache buster: muda quando user atualiza foto
    return `${this.baseUrl}/me/foto?ts=${u.updatedAt ?? Date.now()}`;
  }

  private storeAuth(resp: JwtResponse): void {
    localStorage.setItem(TOKEN_KEY, resp.token);
    localStorage.setItem(USER_KEY, JSON.stringify(resp.user));
    this._user.set(resp.user);
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
