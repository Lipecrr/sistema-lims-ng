import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PropostaModel } from '@/models/proposta.model';
import { PropostasService } from 'src/services/propostas.service';
import { ClientesService } from 'src/services/clientes.service';
import { ColaboradoresService } from 'src/services/colaboradores.service';
import { ResgistroStatusTag } from '@/core/components/registro-status-tag/registro-status-tag';

interface PropostaView extends PropostaModel {
  clienteNome: string;
  responsavelNome: string;
}

@Component({
  selector: 'app-comercial-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, ToastModule, ConfirmDialogModule, ResgistroStatusTag],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list.html',
})
export class List {
  private readonly service = inject(PropostasService);
  private readonly clientesService = inject(ClientesService);
  private readonly colaboradoresService = inject(ColaboradoresService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  propostas$ = combineLatest([
    this.service.lista$,
    this.clientesService.clientes$,
    this.colaboradoresService.colaboradores$,
  ]).pipe(
    map(([propostas, clientes, colaboradores]) => {
      const cli = new Map(clientes.map((c) => [c.id, c.nome_empresa_nome_pf]));
      const col = new Map(colaboradores.map((c) => [c.id, c.nome]));
      return propostas.map<PropostaView>((p) => ({
        ...p,
        clienteNome: p.idCliente != null ? cli.get(p.idCliente) ?? '—' : '—',
        responsavelNome: p.idResponsavel != null ? col.get(p.idResponsavel) ?? '—' : '—',
      }));
    })
  );

  alternarStatus(item: PropostaModel): void {
    const inativando = item.status === 'Ativo';
    this.confirmationService.confirm({
      message: `Deseja realmente ${inativando ? 'inativar' : 'ativar'} a proposta "${item.numero}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: inativando ? 'Sim, inativar' : 'Sim, ativar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const operacao = inativando ? this.service.inativar(item.id) : this.service.ativar(item.id);
        operacao.subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Proposta ${inativando ? 'inativada' : 'ativada'} com sucesso.` }),
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: `Não foi possível ${inativando ? 'inativar' : 'ativar'} a proposta.` }),
        });
      },
    });
  }
}
