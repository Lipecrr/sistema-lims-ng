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
  grupoAnalise: string | null;
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
  pontoColeta: string | null;
  dataColeta: string | null;
  motivo: string | null;
  amostraModeloId: number | null;
  status: 'Ativo' | 'Inativo';
  analises: AmostraAnaliseModel[];
}

export interface CriarAmostraPayload {
  idProposta: number;
  idTipoAmostra: number | null;
  tipoAmostra: string;
  identificacao: string | null;
  idCliente: number | null;
  pontoColeta: string | null;
  dataColeta: string | null;
  motivo: string | null;
  analises: AmostraAnaliseModel[];
}

export interface AlterarAmostraPayload {
  identificacao: string | null;
  idCliente: number | null;
  pontoColeta: string | null;
  dataColeta: string | null;
  motivo: string | null;
  analises: AmostraAnaliseModel[];
}
