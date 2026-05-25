export interface InformacaoAtividadeModel {
  etapa: 'Elaboração' | 'Negociação' | 'Reprovada' | 'Cancelada' | 'Revisão' | 'Aprovada' | 'Finalizada' | 'Agendamento' | 'Agendada' | 'Coletada';
  informacao: 'Responsabilidade da Amostragem' | 'Condição de Pagamento' | 'Forma de Pagamento' | 'Validade da Proposta';
}

export interface TipoAtividadeModel {
  id: string;
  versao: number;
  tipo: string;
  fluxoEtapas: string[];
  informacoes: InformacaoAtividadeModel[];
}
