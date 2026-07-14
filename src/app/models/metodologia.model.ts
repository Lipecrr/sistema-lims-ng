import { AnaliseModel } from './analise.model';

export type CriticidadeNivel = 'baixa' | 'media' | 'alta';

export interface Embalagem {
  tipoEmbalagem: string;
  tipoAmostra: string;
  quantidade: number;
  unidadeMedida: string;
  preservante: string;
}

export interface RecursoMetodologia {
  nome: string;
  quantidade: number;
}

export interface MetodologiaModel {
  id: string;
  status: 'Ativo' | 'Inativo';
  codigo: string;
  nome: string;
  norma: string;
  setor: string;
  prazoConclusaoDias: number;
  criticidade: CriticidadeNivel;
  obsoleto: boolean;
  analises?: AnaliseModel[];
  embalagens?: Embalagem[];
  equipamentos?: RecursoMetodologia[];
  reagentes?: RecursoMetodologia[];
}
