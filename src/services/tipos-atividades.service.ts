import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, switchMap, tap } from 'rxjs';
import type { TipoAtividadeModel, InformacaoAtividadeModel } from '@/models/tipo-atividade.model';
import { environment } from '../environment/environment';

const API_URL = `${environment.apiUrl}/api/v1/tipos-atividades`;

interface TipoAtividadeApi {
  id: string;
  status: 'ATIVO' | 'INATIVO';
  versao: number;
  tipo: string;
  fluxo_etapas: InformacaoAtividadeModel['etapa'][];
  informacoes: { id: string; etapa: InformacaoAtividadeModel['etapa']; informacao: InformacaoAtividadeModel['informacao'] }[];
}

function paraModel(item: TipoAtividadeApi): TipoAtividadeModel {
  return {
    id: item.id,
    versao: item.versao,
    tipo: item.tipo,
    fluxoEtapas: item.fluxo_etapas,
    informacoes: item.informacoes.map((i) => ({ etapa: i.etapa, informacao: i.informacao })),
  };
}

function paraApiRequest(item: Omit<TipoAtividadeModel, 'id'>) {
  return {
    status: 'ATIVO',
    versao: item.versao,
    tipo: item.tipo,
    fluxo_etapas: item.fluxoEtapas,
    informacoes: item.informacoes,
  };
}

@Injectable({
  providedIn: 'root',
})
export class TiposAtividadesService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  private readonly tiposAtividades$ = this.reloadSubject.pipe(
    switchMap(() => this.http.get<TipoAtividadeApi[]>(API_URL)),
    map((itens) => itens.map(paraModel)),
    shareReplay(1)
  );

  get tipos$(): Observable<TipoAtividadeModel[]> {
    return this.tiposAtividades$;
  }

  fetchTiposAtividades(): Observable<TipoAtividadeModel[]> {
    return this.tiposAtividades$;
  }

  addTipoAtividade(tipoAtividade: Omit<TipoAtividadeModel, 'id'>): Observable<TipoAtividadeModel> {
    return this.http.post<TipoAtividadeApi>(API_URL, paraApiRequest(tipoAtividade)).pipe(
      tap(() => this.reloadSubject.next()),
      map(paraModel)
    );
  }

  deleteTipoAtividade(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => this.reloadSubject.next())
    );
  }
}
