import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TipoAtividadeModel } from '@/models/tipo-atividade.model';
import { TiposAtividadesService } from 'src/services/tipos-atividades.service';
import { ResgistroStatusTag } from '@/core/components/registro-status-tag/registro-status-tag';

@Component({
  selector: 'app-tipos-atividades-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, ToastModule, ConfirmDialogModule, ResgistroStatusTag],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list.html',
})
export class List {
  private readonly service = inject(TiposAtividadesService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  tipos$ = this.service.tipos$;

  alternarStatus(item: TipoAtividadeModel): void {
    const inativando = item.status === 'Ativo';
    this.confirmationService.confirm({
      message: `Deseja realmente ${inativando ? 'inativar' : 'ativar'} "${item.tipo}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: inativando ? 'Sim, inativar' : 'Sim, ativar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const operacao = inativando ? this.service.inativar(item.id) : this.service.ativar(item.id);
        operacao.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Tipo de atividade ${inativando ? 'inativado' : 'ativado'} com sucesso.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Não foi possível ${inativando ? 'inativar' : 'ativar'} o tipo de atividade.`,
            });
          },
        });
      },
    });
  }
}
