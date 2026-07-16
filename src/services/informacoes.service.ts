import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, switchMap, tap } from 'rxjs';
import type { InformacaoModel, TipoInformacao } from '@/models/informacao.model';
import { environment } from '../environment/environment';

const API_URL = `${environment.apiUrl}/api/v1/informacoes`;

interface OpcaoApi {
  id: number;
  valor: string;
}

interface InformacaoApi {
  id: number;
  status: 'ATIVO' | 'INATIVO';
  identificacao: string;
  tipo: TipoInformacao;
  valor_livre: boolean;
  opcoes: OpcaoApi[];
}

function paraModel(item: InformacaoApi): InformacaoModel {
  return {
    id: item.id,
    status: item.status === 'ATIVO' ? 'Ativo' : 'Inativo',
    identificacao: item.identificacao,
    tipo: item.tipo,
    valorLivre: item.valor_livre,
    opcoes: (item.opcoes ?? []).map((o) => ({ id: o.id, valor: o.valor })),
  };
}

function paraApiRequest(item: Omit<InformacaoModel, 'id' | 'status'>) {
  return {
    status: 'ATIVO',
    identificacao: item.identificacao,
    tipo: item.tipo,
    valor_livre: item.valorLivre,
    opcoes: item.opcoes.map((o) => ({ valor: o.valor })),
  };
}

@Injectable({
  providedIn: 'root',
})
export class InformacoesService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  private readonly informacoes$ = this.reloadSubject.pipe(
    switchMap(() => this.http.get<InformacaoApi[]>(API_URL)),
    map((itens) => itens.map(paraModel)),
    shareReplay(1)
  );

  get lista$(): Observable<InformacaoModel[]> {
    return this.informacoes$;
  }

  obterPorId(id: string | number): Observable<InformacaoModel> {
    return this.http.get<InformacaoApi>(`${API_URL}/${id}`).pipe(map(paraModel));
  }

  adicionar(informacao: Omit<InformacaoModel, 'id' | 'status'>): Observable<InformacaoModel> {
    return this.http.post<InformacaoApi>(API_URL, paraApiRequest(informacao)).pipe(
      tap(() => this.reloadSubject.next()),
      map(paraModel)
    );
  }

  atualizar(id: string | number, informacao: Omit<InformacaoModel, 'id' | 'status'>): Observable<void> {
    const payload = paraApiRequest(informacao);
    return this.http.put<void>(`${API_URL}/${id}`, {
      identificacao: payload.identificacao,
      tipo: payload.tipo,
      valor_livre: payload.valor_livre,
      opcoes: payload.opcoes,
    }).pipe(
      tap(() => this.reloadSubject.next())
    );
  }

  ativar(id: string | number): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/ativar`, {}).pipe(tap(() => this.reloadSubject.next()));
  }

  inativar(id: string | number): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/inativar`, {}).pipe(tap(() => this.reloadSubject.next()));
  }

  deletar(id: string | number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(tap(() => this.reloadSubject.next()));
  }
}
