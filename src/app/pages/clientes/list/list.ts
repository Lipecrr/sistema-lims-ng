import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { ClienteResponseModel } from '@/models/cliente.model';

interface ClienteFilter {
  search: string;
  contratoRange: string;
}

interface PaginatedResult {
  items: ClienteResponseModel[];
  total: number;
  page: number;
  pageCount: number;
  start: number;
  end: number;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './list.html',
})
export class List {
  private fb = inject(FormBuilder);
  private clientesSubject = new BehaviorSubject<ClienteResponseModel[]>([
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      logo: 'https://picsum.photos/id/1011/80/80',
      nome_empresa_nome_pf: 'Tech Solutions Ltda',
      cnpj_cpf: '12.345.678/0001-90',
      contratos_ativos: 5,
      contato_principal: 'ana.silva@techsolutions.com',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      logo: 'https://picsum.photos/id/1012/80/80',
      nome_empresa_nome_pf: 'Inova Consultoria',
      cnpj_cpf: '98.765.432/0001-10',
      contratos_ativos: 3,
      contato_principal: 'joao.pereira@inovac.com',
    },
    {
      id: '6fa459ea-ee8a-3ca4-894e-db77e160355e',
      logo: 'https://picsum.photos/id/1013/80/80',
      nome_empresa_nome_pf: 'Alpha Engenharia',
      cnpj_cpf: '23.456.789/0001-20',
      contratos_ativos: 8,
      contato_principal: 'carla.melo@alphaeng.com',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      logo: 'https://picsum.photos/id/1015/80/80',
      nome_empresa_nome_pf: 'Green Energy S.A.',
      cnpj_cpf: '34.567.890/0001-30',
      contratos_ativos: 2,
      contato_principal: 'marcos.rodrigues@greenenergy.com',
    },
    {
      id: '9c858901-8a57-4791-81fe-4c455b099bc9',
      logo: 'https://picsum.photos/id/1016/80/80',
      nome_empresa_nome_pf: 'BlueTech Serviços',
      cnpj_cpf: '45.678.901/0001-40',
      contratos_ativos: 6,
      contato_principal: 'lucia.santos@bluetech.com',
    },
    {
      id: '16fd2706-8baf-433b-82eb-8c7fada847da',
      logo: '',
      nome_empresa_nome_pf: 'Carlos Eduardo',
      cnpj_cpf: '123.456.789-00',
      contratos_ativos: 1,
      contato_principal: 'carlos.eduardo@email.com',
    },
    {
      id: '7d444840-9dc0-11d1-b245-5ffdce74fad2',
      logo: '',
      nome_empresa_nome_pf: 'Maria Oliveira',
      cnpj_cpf: '987.654.321-11',
      contratos_ativos: 4,
      contato_principal: 'maria.oliveira@email.com',
    },
  ]);

  filtrosForm = this.fb.group({
    search: [''],
    contratoRange: [''],
  });

  private filterSubject = new BehaviorSubject<ClienteFilter>({ search: '', contratoRange: '' });
  private pageSubject = new BehaviorSubject<number>(1);
  pageSize = 6;

  public readonly filteredClientes$ = combineLatest([this.clientesSubject.asObservable(), this.filterSubject]).pipe(
    map(([items, filter]) => {
      return items.filter((cliente) => {
        const query = filter.search.trim().toLowerCase();
        const normalized = `${cliente.nome_empresa_nome_pf} ${cliente.cnpj_cpf} ${cliente.contato_principal}`.toLowerCase();
        if (query && !normalized.includes(query)) {
          return false;
        }

        if (filter.contratoRange) {
          const contratos = cliente.contratos_ativos;
          if (filter.contratoRange === '0-2' && contratos > 2) {
            return false;
          }
          if (filter.contratoRange === '3-5' && (contratos < 3 || contratos > 5)) {
            return false;
          }
          if (filter.contratoRange === '6+' && contratos < 6) {
            return false;
          }
        }

        return true;
      });
    })
  );

  public readonly pagedClientes$: Observable<PaginatedResult> = combineLatest([
    this.filteredClientes$,
    this.pageSubject,
  ]).pipe(
    map(([items, page]) => {
      const total = items.length;
      const pageCount = Math.max(1, Math.ceil(total / this.pageSize));
      const currentPage = Math.min(Math.max(page, 1), pageCount);
      const startIndex = (currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, total);

      return {
        items: items.slice(startIndex, endIndex),
        total,
        page: currentPage,
        pageCount,
        start: total === 0 ? 0 : startIndex + 1,
        end: endIndex,
      };
    })
  );

  public readonly resumo$ = this.clientesSubject.asObservable().pipe(
    map((items) => ({
      total: items.length,
      contratos: items.reduce((sum, item) => sum + item.contratos_ativos, 0),
      clientesComLogo: items.filter((item) => !!item.logo).length,
    }))
  );

  contratoRanges = [
    { label: 'Todos', value: '' },
    { label: '0–2 contratos', value: '0-2' },
    { label: '3–5 contratos', value: '3-5' },
    { label: '6+ contratos', value: '6+' },
  ];

  filtrar(): void {
    this.filterSubject.next({
      search: this.filtrosForm.get('search')?.value ?? '',
      contratoRange: this.filtrosForm.get('contratoRange')?.value ?? '',
    });
    this.setPage(1);
  }

  limparFiltros(): void {
    this.filtrosForm.reset({ search: '', contratoRange: '' });
    this.filtrar();
  }

  setPage(page: number): void {
    this.pageSubject.next(page);
  }

  pageNumbers(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  removerCliente(id: string): void {
    const updated = this.clientesSubject.value.filter((item) => item.id !== id);
    this.clientesSubject.next(updated);
    this.setPage(1);
  }
}
