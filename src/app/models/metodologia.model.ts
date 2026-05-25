export type CriticidadeNivel = 'baixa' | 'media' | 'alta';

export interface MetodologiaModel {
  id: string;
  codigo: string;
  nome: string;
  norma: string;
  setor: string;
  tempoEstimadoMinutos: number;
  criticidade: CriticidadeNivel;
  obsoleto: boolean;
}
