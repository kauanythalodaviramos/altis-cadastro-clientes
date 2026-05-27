import { Foto } from '../album/models/album.model';

export interface EmocaoStat {
  nome: string;
  cor?: string | null;
  total: number;
}

export interface DashboardStats {
  totalClientes: number;
  totalFotos: number;
  totalEmocoes: number;
  totalTags: number;
  totalLikes: number;
  clientesPorUf: { [uf: string]: number };
  fotosPorEmocao: EmocaoStat[];
  topFotos: Foto[];
}
