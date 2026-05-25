import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TipoAmostraResponseModel } from '../../../models/tipo-amostra.model';

@Injectable({
  providedIn: 'root',
})
export class TiposAmostrasService {
  private readonly initialData: TipoAmostraResponseModel[] = [
    {
      id: '1',
      tipo: 'Água Potável',
      motivo: 'Rotina',
      publicacaoManual: false,
      obrigarDataColeta: true,
      status: 'Ativo',
      observacoes: 'Amostra de rotina para análise de potabilidade',
    },
    {
      id: '2',
      tipo: 'Solo Contaminado',
      motivo: 'Controle de Qualidade',
      publicacaoManual: true,
      obrigarDataColeta: false,
      status: 'Ativo',
      observacoes: 'Coleta com publicação manual de parâmetro interno',
    },
    {
      id: '3',
      tipo: 'Efluente Industrial',
      motivo: 'Prioritária (Rush)',
      publicacaoManual: false,
      obrigarDataColeta: true,
      status: 'Inativo',
      observacoes: 'Amostra de rush para análise de descarga',
    },
    {
      id: '4',
      tipo: 'Água de Processo',
      motivo: 'Rotina',
      publicacaoManual: false,
      obrigarDataColeta: false,
      status: 'Ativo',
      observacoes: 'Monitoramento de qualidade de processo',
    },
  ];

  private readonly tiposSubject = new BehaviorSubject<TipoAmostraResponseModel[]>(this.initialData);

  get tipos$(): Observable<TipoAmostraResponseModel[]> {
    return this.tiposSubject.asObservable();
  }

  getTiposAmostras(): TipoAmostraResponseModel[] {
    return this.tiposSubject.value;
  }

  addTipoAmostra(tipoAmostra: TipoAmostraResponseModel): void {
    this.tiposSubject.next([...this.tiposSubject.value, tipoAmostra]);
  }

  deleteTipoAmostra(id: string): void {
    this.tiposSubject.next(this.tiposSubject.value.filter((item) => item.id !== id));
  }
}
