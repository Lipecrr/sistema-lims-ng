import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { MetodologiasListService } from 'src/services/metodologias-list.service';
import { TempoEstimadoPipe } from './tempo-estimado.pipe';
import { MetodologiaModel, CriticidadeNivel } from '../../../models/metodologia.model';

interface MetodologiaFilter {
  search: string;
  setor: string;
  criticidade: CriticidadeNivel | '';
}

interface PaginatedResult {
  items: MetodologiaModel[];
  total: number;
  page: number;
  pageCount: number;
  start: number;
  end: number;
}

@Component({
  selector: 'app-metodologias-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TempoEstimadoPipe],
  templateUrl: './metodologias-list.html',
})
export class MetodologiasList {
  private fb = inject(FormBuilder);
  private service = inject(MetodologiasListService);

  filtrosForm: FormGroup = this.fb.group({
    search: [''],
    setor: [''],
    criticidade: ['' as CriticidadeNivel | ''],
  });

  private filterSubject = new BehaviorSubject<MetodologiaFilter>({ search: '', setor: '', criticidade: '' });
  private pageSubject = new BehaviorSubject<number>(1);
  pageSize = 6;

  public readonly filteredMetodologias$ = combineLatest([
    this.service.fetchMetodologias(),
    this.filterSubject,
  ]).pipe(
    map(([items, filter]) => {
      return items.filter((item) => {
        const normalized = `${item.codigo} ${item.nome} ${item.norma}`.toLowerCase();
        const query = filter.search.trim().toLowerCase();
        if (query && !normalized.includes(query)) {
          return false;
        }
        if (filter.setor && item.setor !== filter.setor) {
          return false;
        }
        if (filter.criticidade && item.criticidade !== filter.criticidade) {
          return false;
        }
        return true;
      });
    })
  );

  public readonly pagedMetodologias$: Observable<PaginatedResult> = combineLatest([
    this.filteredMetodologias$,
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

  public readonly resumo$ = this.service.metodologias$.pipe(
    map((items) => ({
      aguardandoRevisao: items.filter((item) => item.criticidade === 'media').length,
      conformidadeTecnica: items.filter((item) => item.criticidade === 'baixa').length,
      metodosObsoletos: items.filter((item) => item.obsoleto).length,
    }))
  );

  setores = [
    { label: 'Campo - Coleta', value: 'Campo - Coleta' },
    { label: 'Ecotoxicológico', value: 'Ecotoxicológico' },
    { label: 'Fisico-Quimico', value: 'Fisico-Quimico' },
    { label: 'GC - Cromatografia Gasosa', value: 'GC - Cromatografia Gasosa' },
    { label: 'HLPC', value: 'HLPC' },
    { label: 'IC - Cromatografia Iônica', value: 'IC - Cromatografia Iônica' },
    { label: 'Microbiologia', value: 'Microbiologia' },
    { label: 'Parasitologia', value: 'Parasitologia' },
    { label: 'Subcontratado', value: 'Subcontratado' },
    { label: 'Virologia', value: 'Virologia' },
  ];

  criticidades = [
    { label: 'Baixa', value: 'baixa' },
    { label: 'Média', value: 'media' },
    { label: 'Alta', value: 'alta' },
  ];

  constructor() {}

  filtrar(): void {
    this.filterSubject.next({
      search: this.filtrosForm.get('search')?.value ?? '',
      setor: this.filtrosForm.get('setor')?.value ?? '',
      criticidade: (this.filtrosForm.get('criticidade')?.value ?? '') as CriticidadeNivel | '',
    });
    this.setPage(1);
  }

  limparFiltros(): void {
    this.filtrosForm.reset({ search: '', setor: '', criticidade: '' });
    this.filtrar();
  }

  setPage(page: number): void {
    this.pageSubject.next(page);
  }

  pageNumbers(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  badgeClass(criticidade: CriticidadeNivel): string {
    switch (criticidade) {
      case 'alta':
        return 'bg-red-50 text-red-700 ring-red-200';
      case 'media':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    }
  }

  badgeLabel(criticidade: CriticidadeNivel): string {
    return criticidade === 'alta' ? 'Alta' : criticidade === 'media' ? 'Média' : 'Baixa';
  }

  removerMetodologia(id: string): void {
    this.service.deleteMetodologia(id);
    this.setPage(1);
  }
}
