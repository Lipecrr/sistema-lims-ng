export interface ClienteResponseModel{
    id: string;
    nome_empresa_nome_pf: string;
    cnpj_cpf: string;
    contratos_ativos: number;
    contato_principal: string;
    inadimplente: boolean;
}