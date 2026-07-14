import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, switchMap, tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { ItemPrecoResponseModel } from '@/models/item-preco.model';
import { environment } from '../environment/environment';

const API_URL = `${environment.apiUrl}/api/v1/itens-preco`;

@Injectable({
  providedIn: 'root',
})
export class ItensPrecoService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  private readonly itensPreco$ = this.reloadSubject.pipe(
    switchMap(() => this.http.get<ItemPrecoResponseModel[]>(API_URL)),
    shareReplay(1)
  );

  getItensPreco(): Observable<ItemPrecoResponseModel[]> {
    return this.itensPreco$;
  }

  addItemPreco(item: Omit<ItemPrecoResponseModel, 'id'>): Observable<ItemPrecoResponseModel> {
    return this.http.post<ItemPrecoResponseModel>(API_URL, item).pipe(
      tap(() => this.reloadSubject.next())
    );
  }

  removeItemPreco(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => this.reloadSubject.next())
    );
  }
}
