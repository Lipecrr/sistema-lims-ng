import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AmostraModel, AmostraAnaliseModel } from '@/models/amostra.model';
import { ClienteResponseModel } from '@/models/cliente.model';
import { MetodologiaModel } from '@/models/metodologia.model';
import { AmostrasService } from 'src/services/amostras.service';
import { ClientesService } from 'src/services/clientes.service';
import { MetodologiasListService } from 'src/services/metodologias-list.service';
import { matchFiltro } from '@/core/utils/filtro';

type Aba = 'detalhes' | 'analises';

interface AnaliseCatalogo {
  idMetodologiaAnalise: number;
  idMetodologia: number;
  analise: string;
  metodo: string;
  tipoMetodo: string;
  unidadeMedida: string;
  incerteza: number;
  ld: number;
  lq: number;
}

const MOTIVOS = ['Rotina', 'Controle de Qualidade', 'Prioritária (Rush)'];

@Component({
  selector: 'app-amostra-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './amostra-cadastro.html',
})
export class AmostraCadastro implements OnInit {
  currentTab = signal<Aba>('detalhes');
  readonly motivos = MOTIVOS;

  idProposta: string | null = null;
  idAmostra: string | null = null;
  carregando = signal(true);
  erro = signal(false);

  form!: FormGroup;
  amostra = signal<AmostraModel | null>(null);
  analises = signal<AmostraAnaliseModel[]>([]);

  private readonly clientesService = inject(ClientesService);
  clientes = toSignal(this.clientesService.clientes$, { initialValue: [] as ClienteResponseModel[] });
  contaNome = computed(() => {
    const a = this.amostra();
    if (!a?.idCliente) return '—';
    return this.clientes().find((c) => c.id === a.idCliente)?.nome_empresa_nome_pf ?? '—';
  });

  // ---- Catálogo de análises (achatado de dentro dos métodos) ----
  private readonly metodologiasService = inject(MetodologiasListService);
  private metodologias = toSignal(this.metodologiasService.metodologias$, { initialValue: [] as MetodologiaModel[] });
  catalogoAnalises = computed<AnaliseCatalogo[]>(() =>
    this.metodologias()
      .filter((m) => m.status === 'Ativo')
      .flatMap((m) =>
        (m.analises ?? []).map((a) => ({
          idMetodologiaAnalise: a.id as number,
          idMetodologia: m.id,
          analise: a.identificacao,
          metodo: m.nome,
          tipoMetodo: m.setor,
          unidadeMedida: a.unidadeMedida,
          incerteza: Number(a.incerteza),
          ld: Number(a.ld),
          lq: Number(a.lq),
        }))
      )
  );
  mostrarModalAnalise = signal(false);
  analiseBusca = signal('');
  analisesFiltradas = computed(() => {
    const termo = this.analiseBusca();
    return this.catalogoAnalises().filter(
      (a) => matchFiltro(a.analise, termo) || matchFiltro(a.metodo, termo)
    );
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(AmostrasService);
  private readonly messageService = inject(MessageService);

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.idProposta = this.route.snapshot.paramMap.get('idProposta');
    this.idAmostra = this.route.snapshot.paramMap.get('idAmostra');

    this.form = this.fb.group({
      identificacao: [''],
      pontoColeta: [''],
      dataColeta: [''],
      motivo: [''],
    });

    if (!this.idAmostra) {
      this.erro.set(true);
      this.carregando.set(false);
      return;
    }
    this.carregar();
  }

  private carregar(): void {
    this.service.obterPorId(this.idAmostra!).subscribe({
      next: (a) => {
        this.amostra.set(a);
        this.form.patchValue({
          identificacao: a.identificacao ?? '',
          pontoColeta: a.pontoColeta ?? '',
          dataColeta: a.dataColeta ? a.dataColeta.substring(0, 16) : '',
          motivo: a.motivo ?? '',
        });
        this.analises.set([...a.analises].sort((x, y) => x.ordem - y.ordem));
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  setTab(tab: Aba): void {
    this.currentTab.set(tab);
  }

  get titulo(): string {
    const a = this.amostra();
    if (!a) return 'Amostra';
    return `${a.tipoAmostra}${a.identificacao ? ' — ' + a.identificacao : ''}`;
  }

  // ---------------- Análises ----------------
  abrirModalAnalise(): void {
    this.analiseBusca.set('');
    this.mostrarModalAnalise.set(true);
  }

  fecharModalAnalise(): void {
    this.mostrarModalAnalise.set(false);
  }

  jaAdicionada(c: AnaliseCatalogo): boolean {
    return this.analises().some((a) => a.idMetodologiaAnalise === c.idMetodologiaAnalise);
  }

  adicionarAnalise(c: AnaliseCatalogo): void {
    if (this.jaAdicionada(c)) return;
    this.analises.update((lista) => [
      ...lista,
      {
        ordem: lista.length + 1,
        idMetodologiaAnalise: c.idMetodologiaAnalise,
        idMetodologia: c.idMetodologia,
        analise: c.analise,
        metodo: c.metodo,
        tipoMetodo: c.tipoMetodo,
        unidadeMedida: c.unidadeMedida,
        incerteza: c.incerteza,
        ld: c.ld,
        lq: c.lq,
        grupoAnalise: null,
      },
    ]);
  }

  removerAnalise(index: number): void {
    this.analises.update((lista) =>
      lista.filter((_, i) => i !== index).map((a, i) => ({ ...a, ordem: i + 1 }))
    );
  }

  // ---------------- Ações ----------------
  voltar(): void {
    this.router.navigate(['/comercial', this.idProposta, 'editar']);
  }

  salvar(): void {
    if (!this.idAmostra) return;
    const v = this.form.value;
    this.service
      .atualizar(this.idAmostra, {
        identificacao: (v.identificacao || '').trim() || null,
        idCliente: this.amostra()?.idCliente ?? null,
        pontoColeta: (v.pontoColeta || '').trim() || null,
        dataColeta: v.dataColeta || null,
        motivo: v.motivo || null,
        analises: this.analises().map((a, i) => ({ ...a, ordem: i + 1 })),
      })
      .subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Amostra salva com sucesso.' }),
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar a amostra.' }),
      });
  }
}
