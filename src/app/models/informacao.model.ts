export type TipoInformacao = 'Texto' | 'Número' | 'Data' | 'Booleano';

export interface OpcaoModel {
  id?: number;
  valor: string;
}

export interface InformacaoModel {
  id: number;
  status: 'Ativo' | 'Inativo';
  identificacao: string;
  tipo: TipoInformacao;
  valorLivre: boolean;
  opcoes: OpcaoModel[];
}
