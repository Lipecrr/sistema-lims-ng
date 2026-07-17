import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, switchMap, tap } from 'rxjs';
import type {
  AmostraModel,
  AmostraAnaliseModel,
  CriarAmostraPayload,
  AlterarAmostraPayload,
} from '@/models/amostra.model';
import { environment } from '../environment/environment';

const API_URL = `${environment.apiUrl}/api/v1/amostras`;

interface AmostraAnaliseApi {
  id: number;
  ordem: number;
  id_metodologia_analise: number | null;
  id_metodologia: number | null;
  analise: string;
  metodo: string | null;
  tipo_metodo: string | null;
  unidade_medida: string | null;
  incerteza: number | null;
  ld: number | null;
  lq: number | null;
  grupo_analise: string | null;
}

interface AmostraApi {
  id: number;
  id_proposta: number;
  ordem: number;
  numero: string | null;
  id_tipo_amostra: number | null;
  tipo_amostra: string;
  identificacao: string | null;
  situacao: string;
  id_cliente: number | null;
  ponto_coleta: string | null;
  data_coleta: string | null;
  motivo: string | null;
  amostra_modelo_id: number | null;
  status: 'ATIVO' | 'INATIVO';
  analises: AmostraAnaliseApi[];
}

function analiseParaModel(a: AmostraAnaliseApi): AmostraAnaliseModel {
  return {
    id: a.id,
    ordem: a.ordem,
    idMetodologiaAnalise: a.id_metodologia_analise,
    idMetodologia: a.id_metodologia,
    analise: a.analise,
    metodo: a.metodo,
    tipoMetodo: a.tipo_metodo,
    unidadeMedida: a.unidade_medida,
    incerteza: a.incerteza !== null ? Number(a.incerteza) : null,
    ld: a.ld !== null ? Number(a.ld) : null,
    lq: a.lq !== null ? Number(a.lq) : null,
    grupoAnalise: a.grupo_analise,
  };
}

function paraModel(item: AmostraApi): AmostraModel {
  return {
    id: item.id,
    idProposta: item.id_proposta,
    ordem: item.ordem,
    numero: item.numero,
    idTipoAmostra: item.id_tipo_amostra,
    tipoAmostra: item.tipo_amostra,
    identificacao: item.identificacao,
    situacao: item.situacao,
    idCliente: item.id_cliente,
    pontoColeta: item.ponto_coleta,
    dataColeta: item.data_coleta,
    motivo: item.motivo,
    amostraModeloId: item.amostra_modelo_id,
    status: item.status === 'ATIVO' ? 'Ativo' : 'Inativo',
    analises: (item.analises ?? []).map(analiseParaModel),
  };
}

function analisesParaApi(analises: AmostraAnaliseModel[]) {
  return analises.map((a) => ({
    ordem: a.ordem,
    id_metodologia_analise: a.idMetodologiaAnalise,
    id_metodologia: a.idMetodologia,
    analise: a.analise,
    metodo: a.metodo,
    tipo_metodo: a.tipoMetodo,
    unidade_medida: a.unidadeMedida,
    incerteza: a.incerteza,
    ld: a.ld,
    lq: a.lq,
    grupo_analise: a.grupoAnalise,
  }));
}

@Injectable({
  providedIn: 'root',
})
export class AmostrasService {
  private http = inject(HttpClient);
  private readonly reloadSubject = new BehaviorSubject<void>(undefined);

  listarPorProposta(idProposta: string | number): Observable<AmostraModel[]> {
    return this.reloadSubject.pipe(
      switchMap(() => this.http.get<AmostraApi[]>(`${API_URL}?id_proposta=${idProposta}`)),
      map((itens) => itens.map(paraModel)),
      shareReplay(1)
    );
  }

  recarregar(): void {
    this.reloadSubject.next();
  }

  obterPorId(id: string | number): Observable<AmostraModel> {
    return this.http.get<AmostraApi>(`${API_URL}/${id}`).pipe(map(paraModel));
  }

  criar(payload: CriarAmostraPayload): Observable<AmostraModel> {
    return this.http
      .post<AmostraApi>(API_URL, {
        id_proposta: payload.idProposta,
        id_tipo_amostra: payload.idTipoAmostra,
        tipo_amostra: payload.tipoAmostra,
        identificacao: payload.identificacao,
        id_cliente: payload.idCliente,
        ponto_coleta: payload.pontoColeta,
        data_coleta: payload.dataColeta,
        motivo: payload.motivo,
        analises: analisesParaApi(payload.analises),
      })
      .pipe(
        tap(() => this.reloadSubject.next()),
        map(paraModel)
      );
  }

  atualizar(id: string | number, payload: AlterarAmostraPayload): Observable<void> {
    return this.http
      .put<void>(`${API_URL}/${id}`, {
        identificacao: payload.identificacao,
        id_cliente: payload.idCliente,
        ponto_coleta: payload.pontoColeta,
        data_coleta: payload.dataColeta,
        motivo: payload.motivo,
        analises: analisesParaApi(payload.analises),
      })
      .pipe(tap(() => this.reloadSubject.next()));
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
