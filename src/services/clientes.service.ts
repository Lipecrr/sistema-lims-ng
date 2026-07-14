import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom, map, shareReplay, switchMap, tap } from 'rxjs';
import type { ClienteResponseModel } from '@/models/cliente.model';
import { environment } from '../environment/environment';

const API_URL = `${environment.apiUrl}/api/v1/clientes`;

export interface ClienteContatoApi {
  tipo: 'telefone' | 'email';
  setor: 'compras' | 'financeiro' | 'tecnico';
  valor: string;
}

export interface ClienteApi {
  id: string;
  status: 'ATIVO' | 'INATIVO';
  tipo_pessoa: 'PJ' | 'PF';
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | null;
  inscricao_estadual: string | null;
  segmento: string | null;
  nome_completo: string | null;
  cpf: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
  telefone: string;
  email_faturamento: string;
  contratos_ativos: number;
  inadimplente: boolean;
  contatos: ClienteContatoApi[];
}

export interface CriarClienteApiPayload {
  status?: string;
  tipo_pessoa: 'PJ' | 'PF';
  razao_social?: string | null;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  inscricao_estadual?: string | null;
  segmento?: string | null;
  nome_completo?: string | null;
  cpf?: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
  telefone: string;
  email_faturamento: string;
  contratos_ativos?: number;
  inadimplente?: boolean;
  contatos: ClienteContatoApi[];
}

function paraModel(item: ClienteApi): ClienteResponseModel {
  return {
    id: item.id,
    status: item.status === 'ATIVO' ? 'Ativo' : 'Inativo',
    nome_empresa_nome_pf: item.tipo_pessoa === 'PJ' ? (item.razao_social ?? '') : (item.nome_completo ?? ''),
    cnpj_cpf: item.tipo_pessoa === 'PJ' ? (item.cnpj ?? '') : (item.cpf ?? ''),
    contratos_ativos: item.contratos_ativos,
    contato_principal: item.telefone || item.email_faturamento,
    inadimplente: item.inadimplente,
  };
}

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  private readonly clientesApi$ = this.reloadSubject.pipe(
    switchMap(() => this.http.get<ClienteApi[]>(API_URL)),
    shareReplay(1)
  );

  get clientes$(): Observable<ClienteResponseModel[]> {
    return this.clientesApi$.pipe(map((itens) => itens.map(paraModel)));
  }

  fetchClientes(): Observable<ClienteResponseModel[]> {
    return this.clientes$;
  }

  getClienteById(id: string): Observable<ClienteApi> {
    return this.http.get<ClienteApi>(`${API_URL}/${id}`);
  }

  async addCliente(payload: CriarClienteApiPayload): Promise<ClienteResponseModel> {
    const criado = await firstValueFrom(this.http.post<ClienteApi>(API_URL, payload));
    this.reloadSubject.next();
    return paraModel(criado);
  }

  async atualizar(id: string, payload: CriarClienteApiPayload): Promise<void> {
    await firstValueFrom(this.http.put<void>(`${API_URL}/${id}`, payload));
    this.reloadSubject.next();
  }

  ativar(id: string): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/ativar`, {}).pipe(
      tap(() => this.reloadSubject.next())
    );
  }

  inativar(id: string): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/inativar`, {}).pipe(
      tap(() => this.reloadSubject.next())
    );
  }

  deleteCliente(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => this.reloadSubject.next())
    );
  }
}
