import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { TipoAtividadeModel } from '@/models/tipo-atividade.model';

@Injectable({
  providedIn: 'root',
})
export class TiposAtividadesService {
  private readonly initialData: TipoAtividadeModel[] = [
    {
      id: 'TA-001',
      versao: 1,
      tipo: 'Proposta Comercial',
      fluxoEtapas: ['Elaboração', 'Negociação', 'Aprovada'],
      informacoes: [
        {
          etapa: 'Elaboração',
          informacao: 'Forma de Pagamento',
        },
      ],
    },
    {
      id: 'TA-002',
      versao: 1,
      tipo: 'Ordem de Serviço Técnica',
      fluxoEtapas: ['Agendamento', 'Coletada', 'Finalizada'],
      informacoes: [
        {
          etapa: 'Agendamento',
          informacao: 'Condição de Pagamento',
        },
      ],
    },
  ];

  private readonly tiposSubject = new BehaviorSubject<TipoAtividadeModel[]>(this.initialData);

  get tipos$(): Observable<TipoAtividadeModel[]> {
    return this.tiposSubject.asObservable();
  }

  getTiposAtividades(): TipoAtividadeModel[] {
    return this.tiposSubject.value;
  }

  addTipoAtividade(tipoAtividade: TipoAtividadeModel): void {
    this.tiposSubject.next([...this.tiposSubject.value, tipoAtividade]);
  }

  deleteTipoAtividade(id: string): void {
    this.tiposSubject.next(this.tiposSubject.value.filter((item) => item.id !== id));
  }
}
