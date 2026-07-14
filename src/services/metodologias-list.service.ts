import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, switchMap, tap } from 'rxjs';
import { MetodologiaModel } from '@/models/metodologia.model';
import { AnaliseModel } from '@/models/analise.model';
import { environment } from '../environment/environment';

export const METODOLOGIAS_API_URL = `${environment.apiUrl}/api/v1/metodologias`;

interface RecursoApi {
  id: string;
  nome: string;
  quantidade: number;
}

export interface MetodologiaApi {
  id: string;
  status: 'ATIVO' | 'INATIVO';
  codigo: string;
  nome: string;
  norma: string;
  setor: string;
  prazo_conclusao_dias: number;
  criticidade: MetodologiaModel['criticidade'];
  obsoleto: boolean;
  analises: { id: string; identificacao: string; tipo_amostra: AnaliseModel['tipoAmostra']; unidade_medida: AnaliseModel['unidadeMedida']; incerteza: number; lq: number; ld: number }[];
  embalagens: { id: string; tipo_embalagem: string; tipo_amostra: string; quantidade: number; unidade_medida: string; preservante: string | null }[];
  equipamentos: RecursoApi[];
  reagentes: RecursoApi[];
}

export function paraModel(item: MetodologiaApi): MetodologiaModel {
  return {
    id: item.id,
    codigo: item.codigo,
    nome: item.nome,
    norma: item.norma,
    setor: item.setor,
    prazoConclusaoDias: item.prazo_conclusao_dias,
    criticidade: item.criticidade,
    obsoleto: item.obsoleto,
    analises: item.analises.map((a) => ({
      id: a.id,
      identificacao: a.identificacao,
      tipoAmostra: a.tipo_amostra,
      unidadeMedida: a.unidade_medida,
      incerteza: a.incerteza,
      lq: a.lq,
      ld: a.ld,
    })),
    embalagens: item.embalagens.map((e) => ({
      tipoEmbalagem: e.tipo_embalagem,
      tipoAmostra: e.tipo_amostra,
      quantidade: e.quantidade,
      unidadeMedida: e.unidade_medida,
      preservante: e.preservante ?? '',
    })),
  };
}

@Injectable({
  providedIn: 'root',
})
export class MetodologiasListService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  private readonly metodologiasApi$ = this.reloadSubject.pipe(
    switchMap(() => this.http.get<MetodologiaApi[]>(METODOLOGIAS_API_URL)),
    shareReplay(1)
  );

  get metodologias$(): Observable<MetodologiaModel[]> {
    return this.metodologiasApi$.pipe(map((itens) => itens.map(paraModel)));
  }

  fetchMetodologias(): Observable<MetodologiaModel[]> {
    return this.metodologias$;
  }

  recarregar(): void {
    this.reloadSubject.next();
  }

  deleteMetodologia(id: string): Observable<void> {
    return this.http.delete<void>(`${METODOLOGIAS_API_URL}/${id}`).pipe(
      tap(() => this.reloadSubject.next())
    );
  }
}
