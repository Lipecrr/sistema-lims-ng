export type TipoItemPreco = 'Despesa' | 'Produto' | 'Serviço';

export interface ItemPrecoResponseModel {
  id: number;
  identificacao: string;
  preco: number;
  tipo: TipoItemPreco;
  status: 'Ativo' | 'Inativo';
}
