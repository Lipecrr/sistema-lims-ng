import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, switchMap, tap } from 'rxjs';
import type { TipoAtividadeModel, EtapaFluxoModel, InformacaoAtividadeModel } from '@/models/tipo-atividade.model';
import { environment } from '../environment/environment';

const API_URL = `${environment.apiUrl}/api/v1/tipos-atividades`;

interface EtapaFluxoApi {
  id: number;
  etapa_anterior: string | null;
  etapa_seguinte: string;
  finaliza: boolean;
  prazo_conclusao_horas: number | null;
  permite_amostras: boolean;
  situacao_inicial_amostra: string | null;
  permite_editar_amostras: boolean;
  edita_tempos_estimados: boolean;
  obriga_conta: boolean;
}

interface InformacaoAtividadeApi {
  id: number;
  ordem: number;
  etapa: string;
  informacao: string;
  valor: string | null;
  amostra_herda: boolean;
  obrigatorio_entrar: boolean;
  obrigatorio_sair: boolean;
}

interface TipoAtividadeApi {
  id: number;
  status: 'ATIVO' | 'INATIVO';
  versao: number;
  identificacao: string;
  prefixo: string | null;
  etapas: EtapaFluxoApi[];
  informacoes: InformacaoAtividadeApi[];
}

function etapaParaModel(e: EtapaFluxoApi): EtapaFluxoModel {
  return {
    id: e.id,
    etapaAnterior: e.etapa_anterior,
    etapaSeguinte: e.etapa_seguinte,
    finaliza: e.finaliza,
    prazoConclusaoHoras: e.prazo_conclusao_horas,
    permiteAmostras: e.permite_amostras,
    situacaoInicialAmostra: e.situacao_inicial_amostra,
    permiteEditarAmostras: e.permite_editar_amostras,
    editaTemposEstimados: e.edita_tempos_estimados,
    obrigaConta: e.obriga_conta,
  };
}

function informacaoParaModel(i: InformacaoAtividadeApi): InformacaoAtividadeModel {
  return {
    id: i.id,
    ordem: i.ordem,
    etapa: i.etapa,
    informacao: i.informacao,
    valor: i.valor,
    amostraHerda: i.amostra_herda,
    obrigatorioEntrar: i.obrigatorio_entrar,
    obrigatorioSair: i.obrigatorio_sair,
  };
}

function paraModel(item: TipoAtividadeApi): TipoAtividadeModel {
  return {
    id: item.id,
    status: item.status === 'ATIVO' ? 'Ativo' : 'Inativo',
    versao: item.versao,
    identificacao: item.identificacao,
    prefixo: item.prefixo,
    etapas: (item.etapas ?? []).map(etapaParaModel),
    informacoes: (item.informacoes ?? []).map(informacaoParaModel),
  };
}

function etapaParaApi(e: EtapaFluxoModel): EtapaFluxoApi | Omit<EtapaFluxoApi, 'id'> {
  return {
    etapa_anterior: e.etapaAnterior || null,
    etapa_seguinte: e.etapaSeguinte,
    finaliza: e.finaliza,
    prazo_conclusao_horas: e.prazoConclusaoHoras ?? null,
    permite_amostras: e.permiteAmostras,
    situacao_inicial_amostra: e.situacaoInicialAmostra || null,
    permite_editar_amostras: e.permiteEditarAmostras,
    edita_tempos_estimados: e.editaTemposEstimados,
    obriga_conta: e.obrigaConta,
  };
}

function informacaoParaApi(i: InformacaoAtividadeModel) {
  return {
    ordem: i.ordem,
    etapa: i.etapa,
    informacao: i.informacao,
    valor: i.valor || null,
    amostra_herda: i.amostraHerda,
    obrigatorio_entrar: i.obrigatorioEntrar,
    obrigatorio_sair: i.obrigatorioSair,
  };
}

function paraApiRequest(item: Omit<TipoAtividadeModel, 'id' | 'status'>) {
  return {
    status: 'ATIVO',
    versao: item.versao,
    identificacao: item.identificacao,
    prefixo: item.prefixo || null,
    etapas: item.etapas.map(etapaParaApi),
    informacoes: item.informacoes.map(informacaoParaApi),
  };
}

@Injectable({
  providedIn: 'root',
})
export class TiposAtividadesService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  private readonly tiposAtividades$ = this.reloadSubject.pipe(
    switchMap(() => this.http.get<TipoAtividadeApi[]>(API_URL)),
    map((itens) => itens.map(paraModel)),
    shareReplay(1)
  );

  get tipos$(): Observable<TipoAtividadeModel[]> {
    return this.tiposAtividades$;
  }

  fetchTiposAtividades(): Observable<TipoAtividadeModel[]> {
    return this.tiposAtividades$;
  }

  obterPorId(id: string | number): Observable<TipoAtividadeModel> {
    return this.http.get<TipoAtividadeApi>(`${API_URL}/${id}`).pipe(map(paraModel));
  }

  addTipoAtividade(tipoAtividade: Omit<TipoAtividadeModel, 'id' | 'status'>): Observable<TipoAtividadeModel> {
    return this.http.post<TipoAtividadeApi>(API_URL, paraApiRequest(tipoAtividade)).pipe(
      tap(() => this.reloadSubject.next()),
      map(paraModel)
    );
  }

  atualizar(id: string | number, tipoAtividade: Omit<TipoAtividadeModel, 'id' | 'status'>): Observable<void> {
    const payload = paraApiRequest(tipoAtividade);
    return this.http.put<void>(`${API_URL}/${id}`, {
      versao: payload.versao,
      identificacao: payload.identificacao,
      prefixo: payload.prefixo,
      etapas: payload.etapas,
      informacoes: payload.informacoes,
    }).pipe(
      tap(() => this.reloadSubject.next())
    );
  }

  ativar(id: string | number): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/ativar`, {}).pipe(
      tap(() => this.reloadSubject.next())
    );
  }

  inativar(id: string | number): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/inativar`, {}).pipe(
      tap(() => this.reloadSubject.next())
    );
  }

  deleteTipoAtividade(id: string | number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => this.reloadSubject.next())
    );
  }
}
