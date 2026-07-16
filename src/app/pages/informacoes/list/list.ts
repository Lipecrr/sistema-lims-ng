import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InformacaoModel } from '@/models/informacao.model';
import { InformacoesService } from 'src/services/informacoes.service';
import { ResgistroStatusTag } from '@/core/components/registro-status-tag/registro-status-tag';

@Component({
  selector: 'app-informacoes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, ToastModule, ConfirmDialogModule, ResgistroStatusTag],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list.html',
})
export class List {
  private readonly service = inject(InformacoesService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  lista$ = this.service.lista$;

  alternarStatus(item: InformacaoModel): void {
    const inativando = item.status === 'Ativo';
    this.confirmationService.confirm({
      message: `Deseja realmente ${inativando ? 'inativar' : 'ativar'} "${item.identificacao}"?`,
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
              detail: `Informação ${inativando ? 'inativada' : 'ativada'} com sucesso.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Não foi possível ${inativando ? 'inativar' : 'ativar'} a informação.`,
            });
          },
        });
      },
    });
  }
}
