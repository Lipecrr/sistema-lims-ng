export interface PropostaInformacaoModel {
  id?: number;
  ordem: number;
  etapa: string;
  informacao: string;
  valor: string | null;
}

export interface PropostaModel {
  id: number;
  numero: string;
  prefixo: string;
  ano: number;
  sequencial: number;
  idTipoAtividade: number;
  identificacao: string;
  idCliente: number | null;
  idResponsavel: number | null;
  etapaAtual: string;
  situacaoInicialAmostra: string | null;
  dataExecucao: string | null;
  dataConclusao: string | null;
  status: 'Ativo' | 'Inativo';
  informacoes: PropostaInformacaoModel[];
}

export interface CriarPropostaPayload {
  idTipoAtividade: number;
  identificacao: string;
  idCliente: number | null;
  idResponsavel: number | null;
  dataExecucao: string | null;
  dataConclusao: string | null;
  informacoes: PropostaInformacaoModel[];
}
