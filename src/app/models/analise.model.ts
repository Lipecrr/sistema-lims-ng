export type TipoAmostra = 'agua' | 'efluente' | 'solo';
export type UnidadeMedida = 
  // Água e Efluentes
  | 'mg/L' | 'µg/L' | 'ng/L' | 'pg/L'
  | 'mg/m³' | 'µg/m³'
  | 'pH' | 'mS/cm' | 'mV'
  | 'NTU' | 'mg/L CaCO₃'
  | 'UFC/mL' | 'UFC/100mL'
  | 'MPN/100mL'
  // Solos
  | 'mg/kg' | 'µg/kg' | 'ng/kg'
  | '%' | 'cmol/kg' | 'mmol/kg'
  | 'g/kg' | 'mg/dm³';

export interface AnaliseModel {
  id?: string;
  identificacao: string;
  tipoAmostra: TipoAmostra;
  unidadeMedida: UnidadeMedida;
  incerteza: number; // em %
  lq: number; // Limite de Quantificação
  ld: number; // Limite de Detecção
}
