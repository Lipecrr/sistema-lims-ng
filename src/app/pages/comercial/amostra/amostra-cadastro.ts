import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AmostraModel, AmostraAnaliseModel } from '@/models/amostra.model';
import { ClienteResponseModel } from '@/models/cliente.model';
import { MetodologiaModel } from '@/models/metodologia.model';
import { TipoAmostraResponseModel } from '@/models/tipo-amostra.model';
import { AmostrasService } from 'src/services/amostras.service';
import { ClientesService } from 'src/services/clientes.service';
import { MetodologiasListService } from 'src/services/metodologias-list.service';
import { TiposAmostrasService } from 'src/services/tipos-amostras.service';
import { matchFiltro } from '@/core/utils/filtro';

type Aba = 'detalhes' | 'analises';
type Modo = 'nova' | 'edit';

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

  modo = signal<Modo>('edit');
  idProposta: string | null = null;
  idAmostra: string | null = null;
  carregando = signal(true);
  erro = signal(false);
  tituloAmostra = signal('Amostra');

  form!: FormGroup;
  amostra = signal<AmostraModel | null>(null);
  analises = signal<AmostraAnaliseModel[]>([]);

  private readonly tiposAmostrasService = inject(TiposAmostrasService);
  tiposAmostra = toSignal(this.tiposAmostrasService.tipos$, { initialValue: [] as TipoAmostraResponseModel[] });

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
    this.modo.set(this.route.snapshot.data['modo'] === 'nova' ? 'nova' : 'edit');

    this.form = this.fb.group({
      idTipoAmostra: [null as number | null],
      identificacao: [''],
      dataColeta: [''],
      motivo: [''],
    });

    if (this.modo() === 'nova') {
      this.prepararNova();
      return;
    }

    if (!this.idAmostra) {
      this.erro.set(true);
      this.carregando.set(false);
      return;
    }
    this.carregar();
  }

  private prepararNova(): void {
    const tipoParam = this.route.snapshot.queryParamMap.get('tipo');
    const idTipo = tipoParam ? Number(tipoParam) : null;
    this.form.patchValue({ idTipoAmostra: idTipo });
    this.tituloAmostra.set('Nova Amostra');

    // Resolve nome do tipo (título) e motivo padrão quando os tipos carregarem.
    this.tiposAmostrasService.tipos$.pipe(take(1)).subscribe((tipos) => {
      const t = tipos.find((x) => x.id === idTipo);
      if (t) {
        this.form.patchValue({ motivo: t.motivo }, { emitEvent: false });
        this.tituloAmostra.set(`Nova amostra — ${t.tipo}`);
      }
      this.carregando.set(false);
    });
  }

  private carregar(): void {
    this.service.obterPorId(this.idAmostra!).subscribe({
      next: (a) => {
        this.amostra.set(a);
        this.tituloAmostra.set(`${a.tipoAmostra}${a.identificacao ? ' — ' + a.identificacao : ''}`);
        this.form.patchValue({
          idTipoAmostra: a.idTipoAmostra,
          identificacao: a.identificacao ?? '',
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
    const v = this.form.value;
    const idTipo: number | null = v.idTipoAmostra ?? null;
    const tipoNome = this.tiposAmostra().find((t) => t.id === idTipo)?.tipo ?? this.amostra()?.tipoAmostra ?? '';
    if (!tipoNome) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Selecione o tipo de amostra.' });
      return;
    }

    const analises = this.analises().map((a, i) => ({ ...a, ordem: i + 1 }));

    if (this.modo() === 'nova') {
      this.service
        .criar({
          idProposta: Number(this.idProposta),
          idTipoAmostra: idTipo,
          tipoAmostra: tipoNome,
          identificacao: (v.identificacao || '').trim() || null,
          idCliente: null, // herdado da proposta pelo backend
          dataColeta: v.dataColeta || null,
          motivo: v.motivo || null,
          analises,
        })
        .subscribe({
          next: (nova) => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Amostra criada com sucesso.' });
            setTimeout(() => this.router.navigate(['/comercial', this.idProposta, 'amostra', nova.id]), 800);
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar a amostra.' }),
        });
      return;
    }

    this.service
      .atualizar(this.idAmostra!, {
        idTipoAmostra: idTipo,
        tipoAmostra: tipoNome,
        identificacao: (v.identificacao || '').trim() || null,
        idCliente: this.amostra()?.idCliente ?? null,
        dataColeta: v.dataColeta || null,
        motivo: v.motivo || null,
        analises,
      })
      .subscribe({
        next: () => {
          const atual = this.amostra();
          if (atual) this.amostra.set({ ...atual, idTipoAmostra: idTipo, tipoAmostra: tipoNome });
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Amostra salva com sucesso.' });
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar a amostra.' }),
      });
  }
}
