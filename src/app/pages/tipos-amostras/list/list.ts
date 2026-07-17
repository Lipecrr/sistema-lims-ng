import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { matchFiltro } from '@/core/utils/filtro';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
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
  imports: [CommonModule, FormsModule, RouterModule, ResgistroStatusTag, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list.html',
})
export class List {
  pesquisa = '';
  filtroSelecionadoStatus = 'Status';
  statusOptions = ['Status', 'Ativo', 'Inativo'];

  private readonly service = inject(TiposAmostrasService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
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

  alternarStatus(item: TipoAmostraResponseModel): void {
    const inativando = item.status === 'Ativo';
    this.confirmationService.confirm({
      message: `Deseja realmente ${inativando ? 'inativar' : 'ativar'} "${item.tipo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: inativando ? 'Sim, inativar' : 'Sim, ativar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const operacao = inativando ? this.service.inativar(item.id) : this.service.ativar(item.id);
        operacao.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Tipo de amostra ${inativando ? 'inativado' : 'ativado'} com sucesso.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Não foi possível ${inativando ? 'inativar' : 'ativar'} o tipo de amostra.`,
            });
          },
        });
      },
    });
  }

  private aplicarFiltro(items: TipoAmostraResponseModel[], filter: TipoAmostraFilter): TipoAmostraResponseModel[] {
    const query = filter.search.trim().toLowerCase();

    return items.filter((item) => {
      if (!matchFiltro(`${item.tipo} ${item.motivo}`, query)) {
        return false;
      }

      if (filter.status !== 'Status' && item.status !== filter.status) {
        return false;
      }

      return true;
    });
  }
}
