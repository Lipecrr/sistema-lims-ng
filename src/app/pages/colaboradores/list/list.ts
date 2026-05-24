import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { ColaboradorResponseModel } from '@/models/colaborador.model';

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
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './list.html',
})
export class List {
  private fb = inject(FormBuilder);
  private colaboradoresSubject = new BehaviorSubject<ColaboradorResponseModel[]>([
    {
      id: '1',
      nome: 'Ana Paula Ribeiro',
      cargo: 'Analista de Qualidade da Água',
      departamento: 'Laboratório',
      status: 'Ativo',
    },
    {
      id: '2',
      nome: 'Carlos Eduardo Santos',
      cargo: 'Técnico de Coleta',
      departamento: 'Coleta',
      status: 'Ativo',
    },
    {
      id: '3',
      nome: 'Mariana Lopes Ferreira',
      cargo: 'Bióloga',
      departamento: 'Laboratório',
      status: 'Ativo',
    },
    {
      id: '4',
      nome: 'João Victor Almeida',
      cargo: 'Técnico de Laboratório',
      departamento: 'Laboratório',
      status: 'Férias',
    },
    {
      id: '5',
      nome: 'Fernanda Costa Lima',
      cargo: 'Coordenadora de Laboratório',
      departamento: 'Laboratório',
      status: 'Ativo',
    },
    {
      id: '6',
      nome: 'Ricardo Nogueira',
      cargo: 'Motorista de Coleta',
      departamento: 'Coleta',
      status: 'Ativo',
    },
    {
      id: '7',
      nome: 'Juliana Martins Rocha',
      cargo: 'Analista Químico',
      departamento: 'Laboratório',
      status: 'Ativo',
    },
    {
      id: '8',
      nome: 'Paulo Henrique Silva',
      cargo: 'Auxiliar de Coleta',
      departamento: 'Coleta',
      status: 'Ativo',
    },
    {
      id: '9',
      nome: 'Camila Azevedo',
      cargo: 'Engenheira Ambiental',
      departamento: 'Laboratório',
      status: 'Ativo',
    },
    {
      id: '10',
      nome: 'Lucas Teixeira',
      cargo: 'Estagiário de Laboratório',
      departamento: 'Laboratório',
      status: 'Ativo',
    },
    {
      id: '11',
      nome: 'Renata Pires',
      cargo: 'Assistente Administrativo',
      departamento: 'Administrativo',
      status: 'Ativo',
    },
    {
      id: '12',
      nome: 'Marcos Vinícius Oliveira',
      cargo: 'Analista Financeiro',
      departamento: 'Administrativo',
      status: 'Ativo',
    },
    {
      id: '13',
      nome: 'Daniela Farias',
      cargo: 'Supervisora Administrativa',
      departamento: 'Administrativo',
      status: 'Ativo',
    },
    {
      id: '14',
      nome: 'Thiago Barros',
      cargo: 'Analista de Compras',
      departamento: 'Administrativo',
      status: 'Afastado',
    },
    {
      id: '15',
      nome: 'Patrícia Gomes',
      cargo: 'Recepcionista',
      departamento: 'Administrativo',
      status: 'Ativo',
    },
    {
      id: '16',
      nome: 'Eduardo Batista',
      cargo: 'Técnico de Manutenção de Equipamentos',
      departamento: 'Operações',
      status: 'Ativo',
    },
    {
      id: '17',
      nome: 'Vanessa Correia',
      cargo: 'Analista de Documentação Técnica',
      departamento: 'Administrativo',
      status: 'Ativo',
    },
    {
      id: '18',
      nome: 'Felipe Moura',
      cargo: 'Coordenador de Coletas',
      departamento: 'Coleta',
      status: 'Ativo',
    },
    {
      id: '19',
      nome: 'Simone Rangel',
      cargo: 'Analista de Atendimento ao Cliente',
      departamento: 'Administrativo',
      status: 'Ativo',
    },
    {
      id: '20',
      nome: 'André Luiz Moreira',
      cargo: 'Diretor Técnico',
      departamento: 'Diretoria',
      status: 'Ativo',
    },
    {
      id: '21',
      nome: 'Beatriz Cunha',
      cargo: 'Analista de Controle de Qualidade',
      departamento: 'Laboratório',
      status: 'Ativo',
    },
    {
      id: '22',
      nome: 'Guilherme Pacheco',
      cargo: 'Técnico de Amostragem',
      departamento: 'Coleta',
      status: 'Férias',
    },
    {
      id: '23',
      nome: 'Natalia Souza',
      cargo: 'Analista de Recursos Humanos',
      departamento: 'Administrativo',
      status: 'Ativo',
    },
    {
      id: '24',
      nome: 'Roberto Araujo',
      cargo: 'Almoxarife',
      departamento: 'Operações',
      status: 'Ativo',
    },
    {
      id: '25',
      nome: 'Luciana Menezes',
      cargo: 'Gerente Administrativa',
      departamento: 'Diretoria',
      status: 'Ativo',
    },
    {
      id: '26',
      nome: 'Lucas Martins',
      cargo: 'Estagiário Administrativo',
      departamento: 'Administrativo',
      status: 'Inativo',
    },
    {
      id: '27',
      nome: 'Mariana Costa',
      cargo: 'Assistente de Coleta',
      departamento: 'Coleta',
      status: 'Inativo',
    },
    {
      id: '28',
      nome: 'Thiago Lima',
      cargo: 'Analista de Laboratório',
      departamento: 'Laboratório',
      status: 'Inativo',
    },
    {
      id: '29',
      nome: 'Patrícia Ramos',
      cargo: 'Auxiliar Administrativo',
      departamento: 'Administrativo',
      status: 'Inativo',
    },
    {
      id: '30',
      nome: 'Felipe Alves',
      cargo: 'Motorista',
      departamento: 'Coleta',
      status: 'Inativo',
    },
  ]);

  filtrosForm = this.fb.group({
    search: [''],
    status: [''],
    departamento: [''],
  });

  private filterSubject = new BehaviorSubject<ColaboradorFilter>({ search: '', status: '', departamento: '' });
  private pageSubject = new BehaviorSubject<number>(1);
  pageSize = 8;

  public readonly filteredColaboradores$ = combineLatest([this.colaboradoresSubject.asObservable(), this.filterSubject]).pipe(
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

  public readonly resumo$ = this.colaboradoresSubject.asObservable().pipe(
    map((items) => ({
      total: items.length,
      ativos: items.filter((item) => item.status === 'Ativo').length,
      afastados: items.filter((item) => item.status === 'Férias').length,
    }))
  );

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Férias', value: 'Férias' },
    { label: 'Afastado', value: 'Afastado' },
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

  badgeClass(status: string): string {
    switch (status) {
      case 'Ativo':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case 'Férias':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'Afastado':
        return 'bg-sky-50 text-sky-700 ring-sky-200';
      case 'Inativo':
        return 'bg-slate-100 text-slate-700 ring-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  }

  removerColaborador(id: string): void {
    const updated = this.colaboradoresSubject.value.filter((item) => item.id !== id);
    this.colaboradoresSubject.next(updated);
    this.setPage(1);
  }
}
