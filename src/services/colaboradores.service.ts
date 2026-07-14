import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom, map, shareReplay, switchMap, tap } from 'rxjs';
import type { ColaboradorResponseModel } from '@/models/colaborador.model';
import { environment } from '../environment/environment';

const API_URL = `${environment.apiUrl}/api/v1/colaboradores`;

export interface ColaboradorApi {
  id: string;
  status: 'ATIVO' | 'INATIVO';
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  matricula: string;
  permissao: 'leitura' | 'operacional' | 'gestao' | 'administrador';
  acesso_login: string;
  foto_url: string | null;
  enviar_email: boolean;
  forcar_troca_senha: boolean;
}

export interface CriarColaboradorApiPayload {
  status?: string;
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  matricula: string;
  permissao: string;
  acesso_login: string;
  senha_temporaria?: string | null;
  foto_url?: string | null;
  enviar_email: boolean;
  forcar_troca_senha: boolean;
}

function paraModel(item: ColaboradorApi): ColaboradorResponseModel {
  return {
    id: item.id,
    nome: item.nome_completo,
    cargo: item.cargo,
    departamento: item.departamento,
    status: item.status === 'ATIVO' ? 'Ativo' : 'Inativo',
  };
}

@Injectable({
  providedIn: 'root',
})
export class ColaboradoresService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  private readonly colaboradoresApi$ = this.reloadSubject.pipe(
    switchMap(() => this.http.get<ColaboradorApi[]>(API_URL)),
    shareReplay(1)
  );

  get colaboradores$(): Observable<ColaboradorResponseModel[]> {
    return this.colaboradoresApi$.pipe(map((itens) => itens.map(paraModel)));
  }

  fetchColaboradores(): Observable<ColaboradorResponseModel[]> {
    return this.colaboradores$;
  }

  async addColaborador(payload: CriarColaboradorApiPayload): Promise<ColaboradorResponseModel> {
    const criado = await firstValueFrom(this.http.post<ColaboradorApi>(API_URL, payload));
    this.reloadSubject.next();
    return paraModel(criado);
  }

  deleteColaborador(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => this.reloadSubject.next())
    );
  }
}
