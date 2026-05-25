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
  ];

  private readonly metodologiasSubject = new BehaviorSubject<MetodologiaModel[]>(this.initialData);

  get metodologias$(): Observable<MetodologiaModel[]> {
    return this.metodologiasSubject.asObservable();
  }

  fetchMetodologias(): Observable<MetodologiaModel[]> {
    return this.metodologias$.pipe(delay(120));
  }

  addMetodologia(metodologia: MetodologiaModel): void {
    this.metodologiasSubject.next([...this.metodologiasSubject.value, metodologia]);
  }

  deleteMetodologia(id: string): void {
    const updated = this.metodologiasSubject.value.filter((item) => item.id !== id);
    this.metodologiasSubject.next(updated);
  }
}
