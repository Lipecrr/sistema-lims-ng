import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, switchMap, tap } from 'rxjs';
import { TipoAmostraResponseModel } from '@/models/tipo-amostra.model';
import { environment } from '../environment/environment';

const API_URL = `${environment.apiUrl}/api/v1/tipos-amostras`;

interface TipoAmostraApi {
  id: number;
  status: 'ATIVO' | 'INATIVO';
  tipo: string;
  motivo: TipoAmostraResponseModel['motivo'];
  publicacao_manual: boolean;
  obrigar_data_coleta: boolean;
  observacoes?: string | null;
}

function paraModel(item: TipoAmostraApi): TipoAmostraResponseModel {
  return {
    id: item.id,
    tipo: item.tipo,
    motivo: item.motivo,
    publicacaoManual: item.publicacao_manual,
    obrigarDataColeta: item.obrigar_data_coleta,
    status: item.status === 'ATIVO' ? 'Ativo' : 'Inativo',
    observacoes: item.observacoes ?? undefined,
  };
}

function paraApiRequest(item: Omit<TipoAmostraResponseModel, 'id'>) {
  return {
    status: item.status === 'Ativo' ? 'ATIVO' : 'INATIVO',
    tipo: item.tipo,
    motivo: item.motivo,
    publicacao_manual: item.publicacaoManual,
    obrigar_data_coleta: item.obrigarDataColeta,
    observacoes: item.observacoes ?? null,
  };
}

@Injectable({
  providedIn: 'root',
})
export class TiposAmostrasService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  private readonly tiposAmostras$ = this.reloadSubject.pipe(
    switchMap(() => this.http.get<TipoAmostraApi[]>(API_URL)),
    shareReplay(1)
  );

  get tipos$(): Observable<TipoAmostraResponseModel[]> {
    return this.tiposAmostras$.pipe(map((itens) => itens.map(paraModel)));
  }

  fetchTiposAmostras(): Observable<TipoAmostraResponseModel[]> {
    return this.tipos$;
  }

  obterPorId(id: string | number): Observable<TipoAmostraResponseModel> {
    return this.http.get<TipoAmostraApi>(`${API_URL}/${id}`).pipe(map(paraModel));
  }

  addTipoAmostra(tipoAmostra: Omit<TipoAmostraResponseModel, 'id'>): Observable<TipoAmostraResponseModel> {
    return this.http.post<TipoAmostraApi>(API_URL, paraApiRequest(tipoAmostra)).pipe(
      tap(() => this.reloadSubject.next()),
      map(paraModel)
    );
  }

  atualizar(id: string | number, tipoAmostra: Omit<TipoAmostraResponseModel, 'id' | 'status'>): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}`, {
      tipo: tipoAmostra.tipo,
      motivo: tipoAmostra.motivo,
      publicacao_manual: tipoAmostra.publicacaoManual,
      obrigar_data_coleta: tipoAmostra.obrigarDataColeta,
      observacoes: tipoAmostra.observacoes ?? null,
    }).pipe(
      tap(() => this.reloadSubject.next())
    );
  }

  ativar(id: string | number): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/ativar`, {}).pipe(
      tap(() => this.reloadSubject.next())
    );
  }

  inativar(id: string | number): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/inativar`, {}).pipe(
      tap(() => this.reloadSubject.next())
    );
  }

  deleteTipoAmostra(id: string | number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => this.reloadSubject.next())
    );
  }
}
