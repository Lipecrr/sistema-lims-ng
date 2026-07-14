import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ResgistroStatusTag } from '@/core/components/registro-status-tag/registro-status-tag';
import { TipoAmostraResponseModel } from '@/models/tipo-amostra.model';
import { TiposAmostrasService } from 'src/services/tipos-amostras.service';

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

  tiposAmostras: TipoAmostraResponseModel[] = [];
  filteredAmostras: TipoAmostraResponseModel[] = [];

  private readonly service = inject(TiposAmostrasService);

  constructor() {
    this.carregar();
  }

  filtrar(): void {
    this.applyFilters();
  }

  limparFiltros(): void {
    this.pesquisa = '';
    this.filtroSelecionadoStatus = 'Status';
    this.applyFilters();
  }

  removerTipo(id: string): void {
    this.service.deleteTipoAmostra(id).subscribe(() => this.carregar());
  }

  private carregar(): void {
    this.service.fetchTiposAmostras().subscribe((tipos) => {
      this.tiposAmostras = tipos;
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const query = this.pesquisa.trim().toLowerCase();

    this.filteredAmostras = this.tiposAmostras.filter((item) => {
      if (query && !`${item.tipo} ${item.motivo}`.toLowerCase().includes(query)) {
        return false;
      }

      if (this.filtroSelecionadoStatus !== 'Status' && item.status !== this.filtroSelecionadoStatus) {
        return false;
      }

      return true;
    });
  }
}
