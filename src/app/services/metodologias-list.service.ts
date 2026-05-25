import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay } from 'rxjs';
import { MetodologiaModel } from '@/models/metodologia.model';

@Injectable({
  providedIn: 'root',
})
export class MetodologiasListService {
  private readonly initialData: MetodologiaModel[] = [
    {
      id: '1',
      codigo: 'MT-001',
      nome: 'Extração de Nitrogênio Kjeldahl',
      norma: 'NBR 12810',
      setor: 'Química',
      tempoEstimadoMinutos: 180,
      criticidade: 'alta',
      obsoleto: false,
    },
    {
      id: '2',
      codigo: 'MT-002',
      nome: 'Análise de DBO em Efluentes',
      norma: 'NBR 18920',
      setor: 'Ambiental',
      tempoEstimadoMinutos: 135,
      criticidade: 'media',
      obsoleto: false,
    },
    {
      id: '3',
      codigo: 'MT-003',
      nome: 'Contagem de Colônias em Aguas',
      norma: 'NBR 14370',
      setor: 'Microbiologia',
      tempoEstimadoMinutos: 90,
      criticidade: 'baixa',
      obsoleto: false,
    },
    {
      id: '4',
      codigo: 'MT-004',
      nome: 'Perfil Cromatográfico de Pesticidas',
      norma: 'NBR 15571',
      setor: 'Química',
      tempoEstimadoMinutos: 220,
      criticidade: 'alta',
      obsoleto: true,
    },
    {
      id: '5',
      codigo: 'MT-005',
      nome: 'Análise de Dureza de Água',
      norma: 'NBR 6465',
      setor: 'Ambiental',
      tempoEstimadoMinutos: 60,
      criticidade: 'baixa',
      obsoleto: false,
    },
    {
      id: '6',
      codigo: 'MT-006',
      nome: 'Detecção de Metais Pesados por ICP-OES',
      norma: 'NBR 15824',
      setor: 'Controle de Qualidade',
      tempoEstimadoMinutos: 205,
      criticidade: 'alta',
      obsoleto: false,
    },
    {
      id: '7',
      codigo: 'MT-007',
      nome: 'Determinação de pH em Amostras',
      norma: 'NBR 12123',
      setor: 'Química',
      tempoEstimadoMinutos: 25,
      criticidade: 'baixa',
      obsoleto: false,
    },
    {
      id: '8',
      codigo: 'MT-008',
      nome: 'Avaliação de Oxigênio Dissolvido',
      norma: 'NBR 13268',
      setor: 'Ambiental',
      tempoEstimadoMinutos: 95,
      criticidade: 'media',
      obsoleto: true,
    },
  ];

  private readonly metodologiasSubject = new BehaviorSubject<MetodologiaModel[]>(this.initialData);

  get metodologias$(): Observable<MetodologiaModel[]> {
    return this.metodologiasSubject.asObservable();
  }

  fetchMetodologias(): Observable<MetodologiaModel[]> {
    return this.metodologias$.pipe(delay(120));
  }

  deleteMetodologia(id: string): void {
    const updated = this.metodologiasSubject.value.filter((item) => item.id !== id);
    this.metodologiasSubject.next(updated);
  }
}
