import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InformacaoAtividadeModel, TipoAtividadeModel } from '@/models/tipo-atividade.model';
import { TiposAtividadesService } from 'src/services/tipos-atividades.service';

@Component({
  selector: 'app-tipo-atividade-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tipo-atividade-cadastro.html',
})
export class TipoAtividadeCadastro implements OnInit {
  get controle() {
    return this.formAtividade.controls;
  }
  currentTab: 'detalhes' | 'fluxo' | 'informacoes' = 'detalhes';
  formAtividade!: FormGroup;
  etapaOptions = ['Elaboração', 'Negociação', 'Reprovada', 'Cancelada', 'Revisão', 'Aprovada', 'Finalizada', 'Agendamento', 'Agendada', 'Coletada'] as const;
  informacaoOptions = ['Responsabilidade da Amostragem', 'Condição de Pagamento', 'Forma de Pagamento', 'Validade da Proposta'] as const;

  fluxoEtapas: string[] = [];
  etapaSelecionada = '';

  informacoes: InformacaoAtividadeModel[] = [];
  etapaInfoSelecionada = '';
  informacaoSelecionada = '';

  id: string | null = null;
  modoVisualizacao = false;

  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  get tituloPagina(): string {
    if (this.modoVisualizacao) return 'Visualizar Tipo de Atividade';
    return this.id ? 'Editar Tipo de Atividade' : 'Novo Tipo de Atividade';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly service: TiposAtividadesService,
  ) {}

  ngOnInit(): void {
    this.formAtividade = this.fb.group({
      id: [{ value: `TA-${Date.now()}`, disabled: true }],
      versao: [{ value: 1, disabled: true }],
      tipo: ['', Validators.required],
    });

    this.id = this.route.snapshot.paramMap.get('id');
    this.modoVisualizacao = this.route.snapshot.data['modo'] === 'visualizar';

    if (this.id) {
      this.service.obterPorId(this.id).subscribe({
        next: (item) => {
          this.formAtividade.patchValue({ id: item.id, versao: item.versao, tipo: item.tipo });
          this.fluxoEtapas = [...item.fluxoEtapas];
          this.informacoes = [...item.informacoes];
          if (this.modoVisualizacao) {
            this.formAtividade.disable();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o tipo de atividade.' });
        },
      });
    }
  }

  irParaEdicao(): void {
    if (this.id) {
      this.router.navigate(['/tipos-atividades', this.id, 'editar']);
    }
  }

  setTab(tab: 'detalhes' | 'fluxo' | 'informacoes'): void {
    this.currentTab = tab;
  }

  adicionarEtapa(): void {
    if (!this.etapaSelecionada || this.fluxoEtapas.includes(this.etapaSelecionada)) {
      return;
    }
    this.fluxoEtapas = [...this.fluxoEtapas, this.etapaSelecionada];
    this.etapaSelecionada = '';
  }

  removerEtapa(index: number): void {
    this.fluxoEtapas = this.fluxoEtapas.filter((_, i) => i !== index);
  }

  adicionarInformacao(): void {
    if (!this.etapaInfoSelecionada || !this.informacaoSelecionada) {
      return;
    }

    this.informacoes = [
      ...this.informacoes,
      {
        etapa: this.etapaInfoSelecionada as InformacaoAtividadeModel['etapa'],
        informacao: this.informacaoSelecionada as InformacaoAtividadeModel['informacao'],
      },
    ];

    this.etapaInfoSelecionada = '';
    this.informacaoSelecionada = '';
  }

  removerInformacao(index: number): void {
    this.informacoes = this.informacoes.filter((_, i) => i !== index);
  }

  cancelar(): void {
    this.confirmationService.confirm({
      message: 'Deseja realmente descartar as alterações?',
      header: 'Confirmar Descarte',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sim, descartar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.router.navigate(['/tipos-atividades']);
      },
    });
  }

  salvar(): void {
    if (this.formAtividade.invalid || !this.formAtividade.get('tipo')?.value) {
      this.formAtividade.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    const payload: Omit<TipoAtividadeModel, 'id' | 'status'> = {
      versao: this.formAtividade.get('versao')?.value,
      tipo: this.formAtividade.get('tipo')?.value,
      fluxoEtapas: this.fluxoEtapas,
      informacoes: this.informacoes,
    };

    const operacao = this.id
      ? this.service.atualizar(this.id, payload)
      : this.service.addTipoAtividade(payload).pipe(map(() => undefined));

    operacao.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.id ? 'Tipo de atividade atualizado com sucesso.' : 'Tipo de atividade salvo com sucesso.',
        });
        setTimeout(() => this.router.navigate(['/tipos-atividades']), 1200);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar o tipo de atividade. Tente novamente.' });
      },
    });
  }
}
