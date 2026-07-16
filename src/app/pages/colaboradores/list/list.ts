import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, Observable, BehaviorSubject } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ColaboradorResponseModel } from '@/models/colaborador.model';
import { ColaboradoresService } from 'src/services/colaboradores.service';
import { ResgistroStatusTag } from '@/core/components/registro-status-tag/registro-status-tag';

interface ColaboradorFilter {
  search: string;
  status: string;
  departamento: string;
}

interface PaginatedResult {
  items: ColaboradorResponseModel[];
  total: number;
  page: number;
  pageCount: number;
  start: number;
  end: number;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ToastModule, ConfirmDialogModule, ResgistroStatusTag],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list.html',
})
export class List {
  private fb = inject(FormBuilder);
  private colaboradoresService = inject(ColaboradoresService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  filtrosForm = this.fb.group({
    search: [''],
    status: [''],
    departamento: [''],
  });

  private filterSubject = new BehaviorSubject<ColaboradorFilter>({ search: '', status: '', departamento: '' });
  private pageSubject = new BehaviorSubject<number>(1);
  pageSize = 8;

  public readonly filteredColaboradores$ = combineLatest([this.colaboradoresService.colaboradores$, this.filterSubject]).pipe(
    map(([items, filter]) => {
      return items.filter((colaborador) => {
        const query = filter.search.trim().toLowerCase();
        const normalized = `${colaborador.nome} ${colaborador.cargo} ${colaborador.departamento}`.toLowerCase();
        if (query && !normalized.includes(query)) {
          return false;
        }
        if (filter.status && colaborador.status !== filter.status) {
          return false;
        }
        if (filter.departamento && colaborador.departamento !== filter.departamento) {
          return false;
        }
        return true;
      });
    })
  );

  public readonly pagedColaboradores$: Observable<PaginatedResult> = combineLatest([
    this.filteredColaboradores$,
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

  public readonly resumo$ = this.colaboradoresService.colaboradores$.pipe(
    map((items) => ({
      ativos: items.filter((item) => item.status === 'Ativo').length,
      inativos: items.filter((item) => item.status === 'Inativo').length,
    }))
  );

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Inativo', value: 'Inativo' },
  ];

  departamentos = [
    { label: 'Todos', value: '' },
    { label: 'Laboratório', value: 'Laboratório' },
    { label: 'Coleta', value: 'Coleta' },
    { label: 'Administrativo', value: 'Administrativo' },
    { label: 'Operações', value: 'Operações' },
    { label: 'Diretoria', value: 'Diretoria' },
  ];

  filtrar(): void {
    this.filterSubject.next({
      search: this.filtrosForm.get('search')?.value ?? '',
      status: this.filtrosForm.get('status')?.value ?? '',
      departamento: this.filtrosForm.get('departamento')?.value ?? '',
    });
    this.setPage(1);
  }

  limparFiltros(): void {
    this.filtrosForm.reset({ search: '', status: '', departamento: '' });
    this.filtrar();
  }

  setPage(page: number): void {
    this.pageSubject.next(page);
  }

  pageNumbers(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  alternarStatus(item: ColaboradorResponseModel): void {
    const inativando = item.status === 'Ativo';
    this.confirmationService.confirm({
      message: `Deseja realmente ${inativando ? 'inativar' : 'ativar'} "${item.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: inativando ? 'Sim, inativar' : 'Sim, ativar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const operacao = inativando ? this.colaboradoresService.inativar(item.id) : this.colaboradoresService.ativar(item.id);
        operacao.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Colaborador ${inativando ? 'inativado' : 'ativado'} com sucesso.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Não foi possível ${inativando ? 'inativar' : 'ativar'} o colaborador.`,
            });
          },
        });
      },
    });
  }
}
