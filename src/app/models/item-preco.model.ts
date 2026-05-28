export type TipoItemPreco = 'Despesa' | 'Produto' | 'Serviço';

export interface ItemPrecoResponseModel {
  id: string;
  identificacao: string;
  preco: number;
  tipo: TipoItemPreco;
}
