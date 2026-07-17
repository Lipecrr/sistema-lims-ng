import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, switchMap, tap } from 'rxjs';
import type { PropostaModel, CriarPropostaPayload } from '@/models/proposta.model';
import { environment } from '../environment/environment';

const API_URL = `${environment.apiUrl}/api/v1/propostas`;

interface PropostaInformacaoApi {
  id: number;
  ordem: number;
  etapa: string;
  informacao: string;
  valor: string | null;
}

interface PropostaPrecoApi {
  id: number;
  ordem: number;
  id_item_preco: number | null;
  identificacao: string;
  preco_tabela: number;
  preco: number;
  quantidade: number;
  preco_total: number;
}

interface PropostaApi {
  id: number;
  numero: string;
  prefixo: string;
  ano: number;
  sequencial: number;
  id_tipo_atividade: number;
  identificacao: string;
  id_cliente: number | null;
  id_responsavel: number | null;
  etapa_atual: string;
  situacao_inicial_amostra: string | null;
  data_execucao: string | null;
  data_conclusao: string | null;
  status: 'ATIVO' | 'INATIVO';
  informacoes: PropostaInformacaoApi[];
  precos: PropostaPrecoApi[];
}

function paraModel(item: PropostaApi): PropostaModel {
  return {
    id: item.id,
    numero: item.numero,
    prefixo: item.prefixo,
    ano: item.ano,
    sequencial: item.sequencial,
    idTipoAtividade: item.id_tipo_atividade,
    identificacao: item.identificacao,
    idCliente: item.id_cliente,
    idResponsavel: item.id_responsavel,
    etapaAtual: item.etapa_atual,
    situacaoInicialAmostra: item.situacao_inicial_amostra,
    dataExecucao: item.data_execucao,
    dataConclusao: item.data_conclusao,
    status: item.status === 'ATIVO' ? 'Ativo' : 'Inativo',
    informacoes: (item.informacoes ?? []).map((i) => ({ id: i.id, ordem: i.ordem, etapa: i.etapa, informacao: i.informacao, valor: i.valor })),
    precos: (item.precos ?? []).map((p) => ({
      id: p.id,
      ordem: p.ordem,
      idItemPreco: p.id_item_preco,
      identificacao: p.identificacao,
      precoTabela: Number(p.preco_tabela),
      preco: Number(p.preco),
      quantidade: Number(p.quantidade),
      precoTotal: Number(p.preco_total),
    })),
  };
}

function paraApiRequest(p: CriarPropostaPayload) {
  return {
    id_tipo_atividade: p.idTipoAtividade,
    identificacao: p.identificacao,
    id_cliente: p.idCliente,
    id_responsavel: p.idResponsavel,
    data_execucao: p.dataExecucao,
    data_conclusao: p.dataConclusao,
    informacoes: p.informacoes.map((i) => ({ ordem: i.ordem, etapa: i.etapa, informacao: i.informacao, valor: i.valor })),
    precos: p.precos.map((pr) => ({
      ordem: pr.ordem,
      id_item_preco: pr.idItemPreco,
      identificacao: pr.identificacao,
      preco_tabela: pr.precoTabela,
      preco: pr.preco,
      quantidade: pr.quantidade,
    })),
  };
}

@Injectable({
  providedIn: 'root',
})
export class PropostasService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  private readonly propostas$ = this.reloadSubject.pipe(
    switchMap(() => this.http.get<PropostaApi[]>(API_URL)),
    map((itens) => itens.map(paraModel)),
    shareReplay(1)
  );

  get lista$(): Observable<PropostaModel[]> {
    return this.propostas$;
  }

  obterPorId(id: string | number): Observable<PropostaModel> {
    return this.http.get<PropostaApi>(`${API_URL}/${id}`).pipe(map(paraModel));
  }

  criar(payload: CriarPropostaPayload): Observable<PropostaModel> {
    return this.http.post<PropostaApi>(API_URL, paraApiRequest(payload)).pipe(
      tap(() => this.reloadSubject.next()),
      map(paraModel)
    );
  }

  atualizar(id: string | number, payload: CriarPropostaPayload): Observable<void> {
    const body = paraApiRequest(payload);
    return this.http.put<void>(`${API_URL}/${id}`, {
      identificacao: body.identificacao,
      id_cliente: body.id_cliente,
      id_responsavel: body.id_responsavel,
      data_execucao: body.data_execucao,
      data_conclusao: body.data_conclusao,
      informacoes: body.informacoes,
      precos: body.precos,
    }).pipe(tap(() => this.reloadSubject.next()));
  }

  ativar(id: string | number): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/ativar`, {}).pipe(tap(() => this.reloadSubject.next()));
  }

  inativar(id: string | number): Observable<void> {
    return this.http.put<void>(`${API_URL}/${id}/inativar`, {}).pipe(tap(() => this.reloadSubject.next()));
  }

  deletar(id: string | number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(tap(() => this.reloadSubject.next()));
  }
}
