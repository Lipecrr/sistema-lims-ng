export interface AmostraAnaliseModel {
  id?: number;
  ordem: number;
  idMetodologiaAnalise: number | null;
  idMetodologia: number | null;
  analise: string;
  metodo: string | null;
  tipoMetodo: string | null;
  unidadeMedida: string | null;
  incerteza: number | null;
  ld: number | null;
  lq: number | null;
  preco: number;
  quantidade: number;
  precoTotal?: number;
  grupoAnalise: string | null;
}

export interface AmostraEmbalagemModel {
  id: number;
  ordem: number;
  idMetodologia: number | null;
  metodo: string | null;
  tipoEmbalagem: string | null;
  tipoAmostra: string | null;
  quantidade: number | null;
  unidadeMedida: string | null;
  preservante: string | null;
  herdado: boolean;
}

export interface AmostraModel {
  id: number;
  idProposta: number;
  ordem: number;
  numero: string | null;
  idTipoAmostra: number | null;
  tipoAmostra: string;
  identificacao: string | null;
  situacao: string;
  idCliente: number | null;
  dataColeta: string | null;
  motivo: string | null;
  amostraModeloId: number | null;
  status: 'Ativo' | 'Inativo';
  custoTotal: number;
  analises: AmostraAnaliseModel[];
  embalagens: AmostraEmbalagemModel[];
}

export interface CriarAmostraPayload {
  idProposta: number;
  idTipoAmostra: number | null;
  tipoAmostra: string;
  identificacao: string | null;
  idCliente: number | null;
  dataColeta: string | null;
  motivo: string | null;
  analises: AmostraAnaliseModel[];
}

export interface AlterarAmostraPayload {
  idTipoAmostra: number | null;
  tipoAmostra: string;
  identificacao: string | null;
  idCliente: number | null;
  dataColeta: string | null;
  motivo: string | null;
  analises: AmostraAnaliseModel[];
}
