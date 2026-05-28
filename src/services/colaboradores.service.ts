import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay } from 'rxjs';
import type { ColaboradorResponseModel } from '@/models/colaborador.model';

@Injectable({
  providedIn: 'root',
})
export class ColaboradoresService {
  private readonly initialData: ColaboradorResponseModel[] = [
    {
      id: 'COL-001',
      nome: 'Dr. Ana Silva',
      cargo: 'Química Analítica',
      departamento: 'Físico-Química',
      status: 'ativo',
    },
    {
      id: 'COL-002',
      nome: 'Carlos Mendes',
      cargo: 'Técnico de Laboratório',
      departamento: 'Microbiologia',
      status: 'ativo',
    },
    {
      id: 'COL-003',
      nome: 'Mariana Costa',
      cargo: 'Biologa',
      departamento: 'Biologia Molecular',
      status: 'inativo',
    },
    {
      id: 'COL-004',
      nome: 'Roberto Almeida',
      cargo: 'Supervisor de Análises',
      departamento: 'Físico-Química',
      status: 'ativo',
    },
  ];

  private readonly colaboradoresSubject = new BehaviorSubject<ColaboradorResponseModel[]>(this.initialData);

  get colaboradores$(): Observable<ColaboradorResponseModel[]> {
    return this.colaboradoresSubject.asObservable();
  }

  fetchColaboradores(): Observable<ColaboradorResponseModel[]> {
    return this.colaboradores$.pipe(delay(120));
  }

  getColaboradorById(id: string): ColaboradorResponseModel | undefined {
    return this.colaboradoresSubject.value.find((item) => item.id === id);
  }

  addColaborador(colaborador: ColaboradorResponseModel): void {
    this.colaboradoresSubject.next([...this.colaboradoresSubject.value, colaborador]);
  }

  updateColaborador(colaborador: ColaboradorResponseModel): void {
    const updated = this.colaboradoresSubject.value.map((item) =>
      item.id === colaborador.id ? colaborador : item
    );
    this.colaboradoresSubject.next(updated);
  }

  deleteColaborador(id: string): void {
    const updated = this.colaboradoresSubject.value.filter((item) => item.id !== id);
    this.colaboradoresSubject.next(updated);
  }
}
