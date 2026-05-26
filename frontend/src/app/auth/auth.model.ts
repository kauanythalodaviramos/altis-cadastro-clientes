export interface User {
  id: number;
  nome: string;
  email: string;
  temFoto: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface JwtResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
  user: User;
}

export interface UpdateProfileRequest {
  nome: string;
  email: string;
  senhaAtual?: string;
}

export interface ChangePasswordRequest {
  senhaAtual: string;
  senhaNova: string;
}
