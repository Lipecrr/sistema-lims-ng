import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ItemPrecoResponseModel } from '@/models/item-preco.model';

@Injectable({
  providedIn: 'root',
})
export class ItensPrecoService {
  private itensPrecoSubject = new BehaviorSubject<ItemPrecoResponseModel[]>([
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      identificacao: 'Reagente Químico A',
      preco: 150.00,
      tipo: 'Despesa',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      identificacao: 'Kit de Análise Básica',
      preco: 299.90,
      tipo: 'Produto',
    },
    {
      id: '6fa459ea-ee8a-3ca4-894e-db77e160355e',
      identificacao: 'Consultoria Técnica',
      preco: 500.00,
      tipo: 'Serviço',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      identificacao: 'Material de Laboratório',
      preco: 75.50,
      tipo: 'Despesa',
    },
    {
      id: '9c858901-8a57-4791-81fe-4c455b099bc9',
      identificacao: 'Análise de Amostra',
      preco: 120.00,
      tipo: 'Serviço',
    },
  ]);

  constructor() {}

  getItensPreco(): Observable<ItemPrecoResponseModel[]> {
    return this.itensPrecoSubject.asObservable();
  }

  addItemPreco(item: Omit<ItemPrecoResponseModel, 'id'>): void {
    const newItem: ItemPrecoResponseModel = {
      ...item,
      id: this.generateId(),
    };
    const currentItens = this.itensPrecoSubject.getValue();
    this.itensPrecoSubject.next([...currentItens, newItem]);
  }

  removeItemPreco(id: string): void {
    const currentItens = this.itensPrecoSubject.getValue();
    const updatedItens = currentItens.filter((item) => item.id !== id);
    this.itensPrecoSubject.next(updatedItens);
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
