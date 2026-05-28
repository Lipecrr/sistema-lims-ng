import { Injectable } from '@angular/core';
import { MetodologiasListService } from './metodologias-list.service';
import { MetodologiaModel } from '@/models/metodologia.model';

@Injectable({ providedIn: 'root' })
export class MetodologiaCadastroService {
  constructor(private listService: MetodologiasListService) {}

  save(data: any) {
    const metodologia: MetodologiaModel = {
      id: `mt-${Date.now()}`,
      codigo: `MT-${Date.now()}`,
      nome: data.nome,
      norma: data.norma,
      setor: data.setor,
      prazoConclusaoDias: Number(data.prazoConclusao),
      criticidade: data.criticidade,
      obsoleto: false,
      analises: data.analises ?? [],
      embalagens: data.embalagens ?? []
    };

    this.listService.addMetodologia(metodologia);
    console.log('Salvar Metodologia:', metodologia);
    return Promise.resolve(metodologia);
  }
}
