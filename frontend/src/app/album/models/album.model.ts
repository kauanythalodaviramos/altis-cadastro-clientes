export interface Emocao {
  id: number;
  nome: string;
  icone?: string | null;
  cor?: string | null;
}

export interface EmocaoRequest {
  nome: string;
  icone?: string;
  cor?: string;
}

export interface Tag {
  id: number;
  nome: string;
}

export interface ClienteResumo {
  id: number;
  nome: string;
}

export type Categoria = 'menos' | 'mediana' | 'amada';
export type Favoritismo = 'amados' | 'medianos' | 'menos' | '';
export type Ordem = 'recent' | 'likes_desc' | 'likes_asc';

export interface Foto {
  id: number;
  titulo?: string | null;
  descricao?: string | null;
  mimeType: string;
  likesCount: number;
  categoria: Categoria;
  emocao: Emocao;
  cliente?: ClienteResumo | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface FotoFiltro {
  emocoes?: number[];
  tags?: number[];
  clienteId?: number | null;
  favoritismo?: Favoritismo;
  order?: Ordem;
}

export interface FotoUpdate {
  titulo?: string | null;
  descricao?: string | null;
  emocaoId: number;
  clienteId?: number | null;
  tagIds?: number[];
}

export interface LikeResponse {
  id: number;
  likesCount: number;
  categoria: Categoria;
}
