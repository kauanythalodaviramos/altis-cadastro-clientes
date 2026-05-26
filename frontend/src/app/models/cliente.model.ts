export interface Endereco {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
}

export interface Cliente {
  id?: number;
  nome: string;
  cpf: string;
  telefone: string;
  endereco?: Endereco | null;
  observacoes?: string | null;
  dataCadastro?: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  errors?: { [field: string]: string };
}
