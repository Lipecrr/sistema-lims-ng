import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InformacaoModel, OpcaoModel, TipoInformacao } from '@/models/informacao.model';
import { InformacoesService } from 'src/services/informacoes.service';

type Aba = 'detalhes' | 'opcoes';

@Component({
  selector: 'app-informacao-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './informacao-cadastro.html',
})
export class InformacaoCadastro implements OnInit {
  currentTab = signal<Aba>('detalhes');

  formDetalhes!: FormGroup;
  formOpcao!: FormGroup;
  formOpcaoEdicao!: FormGroup;

  opcoes = signal<OpcaoModel[]>([]);
  editandoOpcao = signal<number | null>(null);

  tipoOptions: TipoInformacao[] = ['Texto', 'Número', 'Data', 'Booleano'];

  id: string | null = null;
  modoVisualizacao = false;

  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  get controle() {
    return this.formDetalhes.controls;
  }

  get tituloPagina(): string {
    if (this.modoVisualizacao) return 'Visualizar Informação';
    return this.id ? 'Editar Informação' : 'Nova Informação';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly service: InformacoesService,
  ) {}

  ngOnInit(): void {
    this.formDetalhes = this.fb.group({
      id: [{ value: '—', disabled: true }],
      identificacao: ['', [Validators.required, Validators.minLength(2)]],
      tipo: ['Texto', Validators.required],
      valorLivre: [false],
    });
    this.formOpcao = this.fb.group({ valor: ['', Validators.required] });
    this.formOpcaoEdicao = this.fb.group({ valor: ['', Validators.required] });

    this.id = this.route.snapshot.paramMap.get('id');
    this.modoVisualizacao = this.route.snapshot.data['modo'] === 'visualizar';

    if (this.id) {
      this.service.obterPorId(this.id).subscribe({
        next: (item) => {
          this.formDetalhes.patchValue({
            id: item.id,
            identificacao: item.identificacao,
            tipo: item.tipo,
            valorLivre: item.valorLivre,
          });
          this.opcoes.set([...item.opcoes]);
          if (this.modoVisualizacao) {
            this.formDetalhes.disable();
            this.formOpcao.disable();
            this.formOpcaoEdicao.disable();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a informação.' });
        },
      });
    }
  }

  irParaEdicao(): void {
    if (this.id) {
      this.router.navigate(['/informacoes', this.id, 'editar']);
    }
  }

  setTab(tab: Aba): void {
    this.currentTab.set(tab);
  }

  adicionarOpcao(): void {
    if (this.formOpcao.invalid) {
      this.formOpcao.markAllAsTouched();
      return;
    }
    const valor = (this.formOpcao.get('valor')?.value || '').trim();
    if (!valor) return;
    this.opcoes.update((atual) => [...atual, { valor }]);
    this.formOpcao.reset({ valor: '' });
  }

  removerOpcao(index: number): void {
    this.editandoOpcao.set(null);
    this.opcoes.update((atual) => atual.filter((_, i) => i !== index));
  }

  iniciarEdicaoOpcao(index: number): void {
    this.formOpcaoEdicao.reset({ valor: this.opcoes()[index].valor });
    this.editandoOpcao.set(index);
  }

  salvarEdicaoOpcao(): void {
    const index = this.editandoOpcao();
    if (index === null) return;
    if (this.formOpcaoEdicao.invalid) {
      this.formOpcaoEdicao.markAllAsTouched();
      return;
    }
    const valor = (this.formOpcaoEdicao.get('valor')?.value || '').trim();
    const atual = this.opcoes()[index];
    this.opcoes.update((arr) => arr.map((item, i) => (i === index ? { id: atual?.id, valor } : item)));
    this.editandoOpcao.set(null);
  }

  cancelarEdicaoOpcao(): void {
    this.editandoOpcao.set(null);
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
        this.router.navigate(['/informacoes']);
      },
    });
  }

  salvar(): void {
    if (this.formDetalhes.invalid) {
      this.formDetalhes.markAllAsTouched();
      this.currentTab.set('detalhes');
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha a identificação (mínimo 2 caracteres).' });
      return;
    }

    const payload: Omit<InformacaoModel, 'id' | 'status'> = {
      identificacao: this.formDetalhes.get('identificacao')?.value,
      tipo: this.formDetalhes.get('tipo')?.value,
      valorLivre: !!this.formDetalhes.get('valorLivre')?.value,
      opcoes: this.opcoes(),
    };

    const erro = () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar a informação. Tente novamente.' });

    if (this.id) {
      this.service.atualizar(this.id, payload).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Informação atualizada com sucesso.' }),
        error: erro,
      });
    } else {
      this.service.adicionar(payload).subscribe({
        next: (criada) => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Informação salva com sucesso.' });
          setTimeout(() => this.router.navigate(['/informacoes', criada.id, 'editar']), 1000);
        },
        error: erro,
      });
    }
  }
}
