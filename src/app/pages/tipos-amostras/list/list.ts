import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ResgistroStatusTag } from '@/core/components/registro-status-tag/registro-status-tag';
import { TipoAmostraResponseModel } from '@/models/tipo-amostra.model';
import { TiposAmostrasService } from 'src/services/tipos-amostras.service';

interface TipoAmostraFilter {
  search: string;
  status: string;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ResgistroStatusTag],
  templateUrl: './list.html',
})
export class List {
  pesquisa = '';
  filtroSelecionadoStatus = 'Status';
  statusOptions = ['Status', 'Ativo', 'Inativo'];

  private readonly service = inject(TiposAmostrasService);
  private readonly filterSubject = new BehaviorSubject<TipoAmostraFilter>({ search: '', status: 'Status' });

  readonly filteredAmostras$ = combineLatest([this.service.tipos$, this.filterSubject]).pipe(
    map(([items, filter]) => this.aplicarFiltro(items, filter))
  );

  filtrar(): void {
    this.filterSubject.next({ search: this.pesquisa, status: this.filtroSelecionadoStatus });
  }

  limparFiltros(): void {
    this.pesquisa = '';
    this.filtroSelecionadoStatus = 'Status';
    this.filtrar();
  }

  removerTipo(id: string): void {
    this.service.deleteTipoAmostra(id).subscribe();
  }

  private aplicarFiltro(items: TipoAmostraResponseModel[], filter: TipoAmostraFilter): TipoAmostraResponseModel[] {
    const query = filter.search.trim().toLowerCase();

    return items.filter((item) => {
      if (query && !`${item.tipo} ${item.motivo}`.toLowerCase().includes(query)) {
        return false;
      }

      if (filter.status !== 'Status' && item.status !== filter.status) {
        return false;
      }

      return true;
    });
  }
}
