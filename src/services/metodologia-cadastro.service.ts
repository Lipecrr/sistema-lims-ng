import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MetodologiasListService, METODOLOGIAS_API_URL, MetodologiaApi, paraModel } from './metodologias-list.service';
import { MetodologiaModel } from '@/models/metodologia.model';

@Injectable({ providedIn: 'root' })
export class MetodologiaCadastroService {
  private http = inject(HttpClient);

  constructor(private listService: MetodologiasListService) {}

  async save(data: any): Promise<MetodologiaModel> {
    const payload = {
      status: 'ATIVO',
      codigo: `MT-${Date.now()}`,
      nome: data.nome,
      norma: data.norma,
      setor: data.setor,
      prazo_conclusao_dias: Number(data.prazoConclusao),
      criticidade: data.criticidade,
      obsoleto: false,
      analises: (data.analises ?? []).map((a: any) => ({
        identificacao: a.identificacao,
        tipo_amostra: a.tipoAmostra,
        unidade_medida: a.unidadeMedida,
        incerteza: a.incerteza,
        lq: a.lq,
        ld: a.ld,
      })),
      embalagens: (data.embalagens ?? []).map((e: any) => ({
        tipo_embalagem: e.tipoEmbalagem,
        tipo_amostra: e.tipoAmostra,
        quantidade: e.quantidade,
        unidade_medida: e.unidadeMedida,
        preservante: e.preservante || null,
      })),
      equipamentos: (data.equipamentos ?? []).map((r: any) => ({ nome: r.nome, quantidade: r.quantidade })),
      reagentes: (data.reagentes ?? []).map((r: any) => ({ nome: r.nome, quantidade: r.quantidade })),
    };

    const criado = await firstValueFrom(this.http.post<MetodologiaApi>(METODOLOGIAS_API_URL, payload));
    this.listService.recarregar();
    return paraModel(criado);
  }
}
