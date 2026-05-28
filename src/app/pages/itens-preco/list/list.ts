import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { ItemPrecoResponseModel, TipoItemPreco } from '@/models/item-preco.model';
import { ItensPrecoService } from '@/services/itens-preco.service';

interface ItemPrecoFilter {
  search: string;
  tipo: string;
}

interface PaginatedResult {
  items: ItemPrecoResponseModel[];
  total: number;
  page: number;
  pageCount: number;
  start: number;
  end: number;
}

@Component({
  selector: 'app-itens-preco-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './list.html',
})
export class ItensPrecoList {
  private fb = inject(FormBuilder);
  private itensPrecoService = inject(ItensPrecoService);

  filtrosForm = this.fb.group({
    search: [''],
    tipo: [''],
  });

  private filterSubject = new BehaviorSubject<ItemPrecoFilter>({ search: '', tipo: '' });
  private pageSubject = new BehaviorSubject<number>(1);
  pageSize = 6;

  tipos: { label: string; value: TipoItemPreco | '' }[] = [
    { label: 'Todos', value: '' },
    { label: 'Despesa', value: 'Despesa' },
    { label: 'Produto', value: 'Produto' },
    { label: 'Serviço', value: 'Serviço' },
  ];

  public readonly filteredItensPreco$ = combineLatest([this.itensPrecoService.getItensPreco(), this.filterSubject]).pipe(
    map(([items, filter]) => {
      return items.filter((item) => {
        const query = filter.search.trim().toLowerCase();
        const normalized = `${item.identificacao} ${item.tipo}`.toLowerCase();
        if (query && !normalized.includes(query)) {
          return false;
        }

        if (filter.tipo && item.tipo !== filter.tipo) {
          return false;
        }

        return true;
      });
    })
  );

  public readonly pagedItensPreco$: Observable<PaginatedResult> = combineLatest([
    this.filteredItensPreco$,
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

  public readonly resumo$ = this.itensPrecoService.getItensPreco().pipe(
    map((items) => {
      const mediaPreco = items.length > 0 ? items.reduce((sum, item) => sum + item.preco, 0) / items.length : 0;
      return {
        total: items.length,
        mediaPreco: mediaPreco,
        totalDespesas: items.filter((item) => item.tipo === 'Despesa').length,
        totalProdutos: items.filter((item) => item.tipo === 'Produto').length,
        totalServicos: items.filter((item) => item.tipo === 'Serviço').length,
      };
    })
  );

  filtrar(): void {
    this.filterSubject.next({
      search: this.filtrosForm.get('search')?.value ?? '',
      tipo: this.filtrosForm.get('tipo')?.value ?? '',
    });
    this.setPage(1);
  }

  limparFiltros(): void {
    this.filtrosForm.reset({ search: '', tipo: '' });
    this.filtrar();
  }

  setPage(page: number): void {
    this.pageSubject.next(page);
  }

  pageNumbers(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  removerItemPreco(id: string): void {
    this.itensPrecoService.removeItemPreco(id);
    this.setPage(1);
  }

  getTipoBadgeClass(tipo: TipoItemPreco): string {
    const classes: Record<TipoItemPreco, string> = {
      Despesa: 'bg-red-100 text-red-700',
      Produto: 'bg-blue-100 text-blue-700',
      Serviço: 'bg-green-100 text-green-700',
    };
    return classes[tipo];
  }

  formatarPreco(preco: number): string {
    return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
