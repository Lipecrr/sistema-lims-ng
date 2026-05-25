export interface TipoAmostraResponseModel {
  id: string;
  tipo: string;
  motivo: 'Rotina' | 'Controle de Qualidade' | 'Prioritária (Rush)';
  publicacaoManual: boolean;
  obrigarDataColeta: boolean;
  status: 'Ativo' | 'Inativo';
  observacoes?: string;
}