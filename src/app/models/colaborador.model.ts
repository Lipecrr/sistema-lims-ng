export interface ColaboradorResponseModel{
    id: number;
    nome: string;
    cargo: string;
    departamento: string;
    status: 'Ativo' | 'Inativo';
}