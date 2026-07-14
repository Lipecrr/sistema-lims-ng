import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, Observable, BehaviorSubject } from 'rxjs';
import { ClienteResponseModel } from '@/models/cliente.model';
import { ClientesService } from 'src/services/clientes.service';

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
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './list.html',
})
export class List {
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);

  filtrosForm = this.fb.group({
    search: [''],
    contratoRange: [''],
  });

  private filterSubject = new BehaviorSubject<ClienteFilter>({ search: '', contratoRange: '' });
  private pageSubject = new BehaviorSubject<number>(1);
  pageSize = 6;

  public readonly filteredClientes$ = combineLatest([this.clientesService.clientes$, this.filterSubject]).pipe(
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

  public readonly resumo$ = this.clientesService.clientes$.pipe(
    map((items) => ({
      total: items.length,
      contratos: items.reduce((sum, item) => sum + item.contratos_ativos, 0),
      inadimplentes: items.filter((item) => item.inadimplente).length,
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
    this.clientesService.deleteCliente(id).subscribe(() => this.setPage(1));
  }
}
