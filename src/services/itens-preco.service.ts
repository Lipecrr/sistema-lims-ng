import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, switchMap, tap } from 'rxjs';
import { ItemPrecoResponseModel, TipoItemPreco } from '@/models/item-preco.model';
import { environment } from '../environment/environment';

const API_URL = `${environment.apiUrl}/api/v1/itens-preco`;

interface ItemPrecoApi {
  id: string;
  status: 'ATIVO' | 'INATIVO';
  identificacao: string;
  preco: number;
  tipo: TipoItemPreco;
}

function paraModel(item: ItemPrecoApi): ItemPrecoResponseModel {
  return {
    id: item.id,
    identificacao: item.identificacao,
    preco: item.preco,
    tipo: item.tipo,
    status: item.status === 'ATIVO' ? 'Ativo' : 'Inativo',
  };
}

@Injectable({
  providedIn: 'root',
})
export class ItensPrecoService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  private readonly itensPrecoApi$ = this.reloadSubject.pipe(
    switchMap(() => this.http.get<ItemPrecoApi[]>(API_URL)),
    shareReplay(1)
  );

  getItensPreco(): Observable<ItemPrecoResponseModel[]> {
    return this.itensPrecoApi$.pipe(map((itens) => itens.map(paraModel)));
  }

  obterPorId(id: string): Observable<ItemPrecoResponseModel> {
    return this.http.get<ItemPrecoApi>(`${API_URL}/${id}`).pipe(map(paraModel));
  }

  addItemPreco(item: Omit<ItemPrecoResponseModel, 'id' | 'status'>): Observable<ItemPrecoResponseModel> {
    return this.http.post<ItemPrecoApi>(API_URL, { status: 'ATIVO', ...item }).pipe(
      tap(() => this.reloadSubject.next()),
      map(paraModel)
    );
  }

  atualizar(id: string, item: Omit<ItemPrecoResponseModel, 'id' | 'status'>): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}`, item).pipe(
      tap(() => this.reloadSubject.next())
    );
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

  removeItemPreco(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => this.reloadSubject.next())
    );
  }
}
