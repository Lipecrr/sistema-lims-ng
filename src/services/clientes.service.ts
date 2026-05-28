import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay } from 'rxjs';
import type { ClienteResponseModel } from '@/models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private readonly initialData: ClienteResponseModel[] = [
    {
      id: 'CLI-001',
      nome_empresa_nome_pf: 'Indústria Química Brasil Ltda',
      cnpj_cpf: '12.345.678/0001-90',
      contratos_ativos: 3,
      contato_principal: 'João Silva (11) 98765-4321',
      inadimplente: false,
    },
    {
      id: 'CLI-002',
      nome_empresa_nome_pf: 'Agropecuária Verde Campo S.A.',
      cnpj_cpf: '23.456.789/0001-01',
      contratos_ativos: 5,
      contato_principal: 'Maria Souza (21) 99876-5432',
      inadimplente: true,
    },
    {
      id: 'CLI-003',
      nome_empresa_nome_pf: 'Engenharia Ambiental Santos',
      cnpj_cpf: '34.567.890/0001-12',
      contratos_ativos: 2,
      contato_principal: 'Carlos Santos (31) 98765-1234',
      inadimplente: false,
    },
    {
      id: 'CLI-004',
      nome_empresa_nome_pf: 'Consultoria Alimentos Seguros',
      cnpj_cpf: '45.678.901/0001-23',
      contratos_ativos: 1,
      contato_principal: 'Ana Pereira (41) 99988-7766',
      inadimplente: false,
    },
  ];

  private readonly clientesSubject = new BehaviorSubject<ClienteResponseModel[]>(this.initialData);

  get clientes$(): Observable<ClienteResponseModel[]> {
    return this.clientesSubject.asObservable();
  }

  fetchClientes(): Observable<ClienteResponseModel[]> {
    return this.clientes$.pipe(delay(120));
  }

  getClienteById(id: string): ClienteResponseModel | undefined {
    return this.clientesSubject.value.find((item) => item.id === id);
  }

  addCliente(cliente: ClienteResponseModel): void {
    this.clientesSubject.next([...this.clientesSubject.value, cliente]);
  }

  updateCliente(cliente: ClienteResponseModel): void {
    const updated = this.clientesSubject.value.map((item) =>
      item.id === cliente.id ? cliente : item
    );
    this.clientesSubject.next(updated);
  }

  deleteCliente(id: string): void {
    const updated = this.clientesSubject.value.filter((item) => item.id !== id);
    this.clientesSubject.next(updated);
  }
}
