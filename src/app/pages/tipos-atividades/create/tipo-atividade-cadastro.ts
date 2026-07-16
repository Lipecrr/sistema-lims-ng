import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EtapaFluxoModel, InformacaoAtividadeModel, TipoAtividadeModel } from '@/models/tipo-atividade.model';
import { TiposAtividadesService } from 'src/services/tipos-atividades.service';

type Aba = 'detalhes' | 'fluxo' | 'informacoes';

@Component({
  selector: 'app-tipo-atividade-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tipo-atividade-cadastro.html',
})
export class TipoAtividadeCadastro implements OnInit {
  currentTab = signal<Aba>('detalhes');

  formDetalhes!: FormGroup;
  formEtapa!: FormGroup;
  formInfo!: FormGroup;

  etapas = signal<EtapaFluxoModel[]>([]);
  informacoes = signal<InformacaoAtividadeModel[]>([]);

  /** Índice da transição em edição inline (null = nenhuma). */
  editandoEtapa = signal<number | null>(null);
  formEtapaEdicao!: FormGroup;

  situacaoAmostraOptions = ['Modelo', 'Registrada'] as const;

  /** Nomes de etapas já usados no fluxo — alimenta datalists e o select de Informações. */
  etapasDisponiveis = computed(() => {
    const nomes = new Set<string>();
    for (const e of this.etapas()) {
      if (e.etapaAnterior) nomes.add(e.etapaAnterior);
      if (e.etapaSeguinte) nomes.add(e.etapaSeguinte);
    }
    return [...nomes];
  });

  id: string | null = null;
  modoVisualizacao = false;

  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  get controle() {
    return this.formDetalhes.controls;
  }

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
    this.formDetalhes = this.fb.group({
      id: [{ value: '—', disabled: true }],
      versao: [{ value: 1, disabled: true }],
      identificacao: ['', [Validators.required, Validators.minLength(3)]],
      prefixo: [''],
    });

    this.formEtapa = this.criarFormEtapa();
    this.formEtapaEdicao = this.criarFormEtapa();
    this.formInfo = this.criarFormInfo();

    this.id = this.route.snapshot.paramMap.get('id');
    this.modoVisualizacao = this.route.snapshot.data['modo'] === 'visualizar';

    if (this.id) {
      this.service.obterPorId(this.id).subscribe({
        next: (item) => {
          this.formDetalhes.patchValue({
            id: item.id,
            versao: item.versao,
            identificacao: item.identificacao,
            prefixo: item.prefixo ?? '',
          });
          this.etapas.set([...item.etapas]);
          this.informacoes.set(this.resequenciar([...item.informacoes]));
          if (this.modoVisualizacao) {
            this.formDetalhes.disable();
            this.formEtapa.disable();
            this.formEtapaEdicao.disable();
            this.formInfo.disable();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o tipo de atividade.' });
        },
      });
    }
  }

  private criarFormEtapa(): FormGroup {
    return this.fb.group({
      etapaAnterior: [''],
      etapaSeguinte: ['', Validators.required],
      finaliza: [false],
      prazoConclusaoHoras: [null],
      permiteAmostras: [false],
      situacaoInicialAmostra: [''],
      permiteEditarAmostras: [false],
      editaTemposEstimados: [false],
      obrigaConta: [false],
    });
  }

  private criarFormInfo(): FormGroup {
    return this.fb.group({
      etapa: ['', Validators.required],
      informacao: ['', Validators.required],
      valor: [''],
      amostraHerda: [false],
      obrigatorioEntrar: [false],
      obrigatorioSair: [false],
    });
  }

  private resequenciar(lista: InformacaoAtividadeModel[]): InformacaoAtividadeModel[] {
    return lista.map((item, i) => ({ ...item, ordem: i + 1 }));
  }

  irParaEdicao(): void {
    if (this.id) {
      this.router.navigate(['/tipos-atividades', this.id, 'editar']);
    }
  }

  setTab(tab: Aba): void {
    this.currentTab.set(tab);
  }

  // ---------------- Fluxo de etapas ----------------
  adicionarEtapa(): void {
    if (this.formEtapa.invalid) {
      this.formEtapa.markAllAsTouched();
      return;
    }
    const v = this.formEtapa.getRawValue();
    const nova: EtapaFluxoModel = {
      etapaAnterior: (v.etapaAnterior || '').trim() || null,
      etapaSeguinte: (v.etapaSeguinte || '').trim(),
      finaliza: !!v.finaliza,
      prazoConclusaoHoras: v.prazoConclusaoHoras === null || v.prazoConclusaoHoras === '' ? null : Number(v.prazoConclusaoHoras),
      permiteAmostras: !!v.permiteAmostras,
      situacaoInicialAmostra: (v.situacaoInicialAmostra || '').trim() || null,
      permiteEditarAmostras: !!v.permiteEditarAmostras,
      editaTemposEstimados: !!v.editaTemposEstimados,
      obrigaConta: !!v.obrigaConta,
    };
    this.etapas.update((atual) => [...atual, nova]);
    this.formEtapa.reset({
      etapaAnterior: '', etapaSeguinte: '', finaliza: false, prazoConclusaoHoras: null,
      permiteAmostras: false, situacaoInicialAmostra: '', permiteEditarAmostras: false,
      editaTemposEstimados: false, obrigaConta: false,
    });
  }

  removerEtapa(index: number): void {
    this.editandoEtapa.set(null);
    this.etapas.update((atual) => atual.filter((_, i) => i !== index));
  }

  private valoresParaEtapa(v: any): Omit<EtapaFluxoModel, 'id'> {
    return {
      etapaAnterior: (v.etapaAnterior || '').trim() || null,
      etapaSeguinte: (v.etapaSeguinte || '').trim(),
      finaliza: !!v.finaliza,
      prazoConclusaoHoras: v.prazoConclusaoHoras === null || v.prazoConclusaoHoras === '' ? null : Number(v.prazoConclusaoHoras),
      permiteAmostras: !!v.permiteAmostras,
      situacaoInicialAmostra: (v.situacaoInicialAmostra || '').trim() || null,
      permiteEditarAmostras: !!v.permiteEditarAmostras,
      editaTemposEstimados: !!v.editaTemposEstimados,
      obrigaConta: !!v.obrigaConta,
    };
  }

  iniciarEdicaoEtapa(index: number): void {
    const e = this.etapas()[index];
    this.formEtapaEdicao.reset({
      etapaAnterior: e.etapaAnterior ?? '',
      etapaSeguinte: e.etapaSeguinte,
      finaliza: e.finaliza,
      prazoConclusaoHoras: e.prazoConclusaoHoras,
      permiteAmostras: e.permiteAmostras,
      situacaoInicialAmostra: e.situacaoInicialAmostra ?? '',
      permiteEditarAmostras: e.permiteEditarAmostras,
      editaTemposEstimados: e.editaTemposEstimados,
      obrigaConta: e.obrigaConta,
    });
    this.editandoEtapa.set(index);
  }

  salvarEdicaoEtapa(): void {
    const index = this.editandoEtapa();
    if (index === null) return;
    if (this.formEtapaEdicao.invalid) {
      this.formEtapaEdicao.markAllAsTouched();
      return;
    }
    const atualizada: EtapaFluxoModel = {
      id: this.etapas()[index]?.id,
      ...this.valoresParaEtapa(this.formEtapaEdicao.getRawValue()),
    };
    this.etapas.update((atual) => atual.map((item, i) => (i === index ? atualizada : item)));
    this.editandoEtapa.set(null);
  }

  cancelarEdicaoEtapa(): void {
    this.editandoEtapa.set(null);
  }

  // ---------------- Informações ----------------
  adicionarInformacao(): void {
    if (this.formInfo.invalid) {
      this.formInfo.markAllAsTouched();
      return;
    }
    const v = this.formInfo.getRawValue();
    const nova: InformacaoAtividadeModel = {
      ordem: this.informacoes().length + 1,
      etapa: (v.etapa || '').trim(),
      informacao: (v.informacao || '').trim(),
      valor: (v.valor || '').trim() || null,
      amostraHerda: !!v.amostraHerda,
      obrigatorioEntrar: !!v.obrigatorioEntrar,
      obrigatorioSair: !!v.obrigatorioSair,
    };
    this.informacoes.update((atual) => this.resequenciar([...atual, nova]));
    this.formInfo.reset({
      etapa: '', informacao: '', valor: '', amostraHerda: false,
      obrigatorioEntrar: false, obrigatorioSair: false,
    });
  }

  removerInformacao(index: number): void {
    this.informacoes.update((atual) => this.resequenciar(atual.filter((_, i) => i !== index)));
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
    if (this.formDetalhes.invalid) {
      this.formDetalhes.markAllAsTouched();
      this.currentTab.set('detalhes');
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha a identificação (mínimo 3 caracteres).' });
      return;
    }
    if (this.etapas().length === 0) {
      this.currentTab.set('fluxo');
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Adicione ao menos uma etapa ao fluxo.' });
      return;
    }

    const payload: Omit<TipoAtividadeModel, 'id' | 'status'> = {
      versao: this.formDetalhes.get('versao')?.value ?? 1,
      identificacao: this.formDetalhes.get('identificacao')?.value,
      prefixo: this.formDetalhes.get('prefixo')?.value || null,
      etapas: this.etapas(),
      informacoes: this.informacoes(),
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
