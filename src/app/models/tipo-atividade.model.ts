export interface EtapaFluxoModel {
  id?: number;
  etapaAnterior: string | null;
  etapaSeguinte: string;
  finaliza: boolean;
  prazoConclusaoHoras: number | null;
  permiteAmostras: boolean;
  situacaoInicialAmostra: string | null;
  permiteEditarAmostras: boolean;
  editaTemposEstimados: boolean;
  obrigaConta: boolean;
}

export interface InformacaoAtividadeModel {
  id?: number;
  ordem: number;
  etapa: string;
  informacao: string;
  valor: string | null;
  amostraHerda: boolean;
  obrigatorioEntrar: boolean;
  obrigatorioSair: boolean;
}

export interface TipoAtividadeModel {
  id: number;
  status: 'Ativo' | 'Inativo';
  versao: number;
  identificacao: string;
  prefixo: string | null;
  etapas: EtapaFluxoModel[];
  informacoes: InformacaoAtividadeModel[];
}
