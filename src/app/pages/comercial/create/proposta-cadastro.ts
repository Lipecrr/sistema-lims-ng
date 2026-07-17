import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { combineLatest, take } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CriarPropostaPayload, PropostaPrecoModel } from '@/models/proposta.model';
import { ClienteResponseModel } from '@/models/cliente.model';
import { ItemPrecoResponseModel } from '@/models/item-preco.model';
import { TipoAmostraResponseModel } from '@/models/tipo-amostra.model';
import { AmostraModel } from '@/models/amostra.model';
import { PropostasService } from 'src/services/propostas.service';
import { TiposAtividadesService } from 'src/services/tipos-atividades.service';
import { InformacoesService } from 'src/services/informacoes.service';
import { ClientesService } from 'src/services/clientes.service';
import { ItensPrecoService } from 'src/services/itens-preco.service';
import { TiposAmostrasService } from 'src/services/tipos-amostras.service';
import { AmostrasService } from 'src/services/amostras.service';
import { matchFiltro } from '@/core/utils/filtro';

type Aba = 'detalhes' | 'informacoes' | 'precos' | 'amostras';

interface CampoInfo {
  ordem: number;
  etapa: string;
  informacao: string;
  obrigatorio: boolean;
  opcoes: string[];
  valorLivre: boolean;
  controlName: string;
}

const NOME_TIPO_PROPOSTA = 'Proposta Comercial';
const NOME_INFO_VALIDADE = 'Validade da Proposta';

@Component({
  selector: 'app-proposta-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './proposta-cadastro.html',
})
export class PropostaCadastro implements OnInit {
  currentTab = signal<Aba>('detalhes');

  formDetalhes!: FormGroup;
  formInfos = new FormGroup({});

  camposInfo = signal<CampoInfo[]>([]);
  private validadeControlName: string | null = null;

  idTipoAtividade = signal<number | null>(null);
  etapaInicial = signal<string>('Elaboração');
  carregando = signal<boolean>(true);
  erroTipo = signal<boolean>(false);

  // ---- Busca de cliente ----
  private readonly clientesService = inject(ClientesService);
  clientesLista = toSignal(this.clientesService.clientes$, { initialValue: [] as ClienteResponseModel[] });
  clienteBusca = signal('');
  clienteSelecionado = signal<ClienteResponseModel | null>(null);
  mostrarResultados = signal(false);
  clientesFiltrados = computed(() => {
    const termo = this.clienteBusca();
    return this.clientesLista()
      .filter((c) => matchFiltro(c.nome_empresa_nome_pf, termo) || matchFiltro(c.cnpj_cpf, termo))
      .slice(0, 12);
  });

  // ---- Preços (itens de preço vinculados) ----
  private readonly itensPrecoService = inject(ItensPrecoService);
  catalogoPreco = toSignal(this.itensPrecoService.getItensPreco(), { initialValue: [] as ItemPrecoResponseModel[] });
  precos = signal<PropostaPrecoModel[]>([]);
  itemBusca = signal('');
  mostrarResultadosItem = signal(false);
  itensFiltrados = computed(() => {
    const termo = this.itemBusca();
    return this.catalogoPreco()
      .filter((i) => i.status === 'Ativo' && matchFiltro(i.identificacao, termo))
      .slice(0, 12);
  });
  totalGeral = computed(() =>
    this.precos().reduce((soma, p) => soma + this.totalLinha(p), 0)
  );

  // ---- Amostras (modelo) ----
  private readonly tiposAmostrasService = inject(TiposAmostrasService);
  private readonly amostrasService = inject(AmostrasService);
  tiposAmostra = toSignal(this.tiposAmostrasService.tipos$, { initialValue: [] as TipoAmostraResponseModel[] });
  amostras = signal<AmostraModel[]>([]);
  mostrarModalAmostra = signal(false);
  tipoAmostraBusca = signal('');
  tiposAmostraFiltrados = computed(() => {
    const termo = this.tipoAmostraBusca();
    return this.tiposAmostra().filter((t) => t.status === 'Ativo' && matchFiltro(t.tipo, termo));
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
    if (this.modoVisualizacao) return 'Visualizar Proposta';
    return this.id ? 'Editar Proposta' : 'Nova Proposta Comercial';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly service: PropostasService,
    private readonly tiposService: TiposAtividadesService,
    private readonly informacoesService: InformacoesService,
  ) {}

  ngOnInit(): void {
    this.formDetalhes = this.fb.group({
      id: [{ value: '—', disabled: true }],
      numero: [{ value: '—', disabled: true }],
      identificacao: ['', [Validators.required, Validators.minLength(2)]],
      idCliente: [null],
      dataExecucao: [{ value: this.agora(), disabled: true }],
      dataConclusao: [''],
    });

    this.id = this.route.snapshot.paramMap.get('id');
    this.modoVisualizacao = this.route.snapshot.data['modo'] === 'visualizar';

    combineLatest([this.tiposService.tipos$, this.informacoesService.lista$])
      .pipe(take(1))
      .subscribe({
        next: ([tipos, catalogo]) => {
          const pc = tipos.find((t) => t.identificacao === NOME_TIPO_PROPOSTA && t.status === 'Ativo')
            ?? tipos.find((t) => t.identificacao === NOME_TIPO_PROPOSTA);
          if (!pc) {
            this.erroTipo.set(true);
            this.carregando.set(false);
            return;
          }
          this.idTipoAtividade.set(pc.id);
          const entrada = pc.etapas.find((e) => !e.etapaAnterior);
          const etapa = entrada?.etapaSeguinte ?? 'Elaboração';
          this.etapaInicial.set(etapa);

          const catMap = new Map(catalogo.map((c) => [c.identificacao, c]));
          const campos = pc.informacoes
            .filter((i) => i.etapa === etapa)
            .sort((a, b) => a.ordem - b.ordem)
            .map((i, idx): CampoInfo => {
              const cat = catMap.get(i.informacao);
              return {
                ordem: i.ordem,
                etapa: i.etapa,
                informacao: i.informacao,
                obrigatorio: i.obrigatorioEntrar,
                opcoes: cat ? cat.opcoes.map((o) => o.valor) : [],
                valorLivre: cat ? cat.valorLivre : true,
                controlName: `info_${idx}`,
              };
            });

          const grupo: Record<string, FormControl> = {};
          for (const c of campos) {
            const original = pc.informacoes.find((i) => i.informacao === c.informacao && i.ordem === c.ordem);
            grupo[c.controlName] = new FormControl(original?.valor ?? '', c.obrigatorio ? [Validators.required] : []);
            if (c.informacao === NOME_INFO_VALIDADE) this.validadeControlName = c.controlName;
          }
          this.formInfos = new FormGroup(grupo);
          this.camposInfo.set(campos);

          // Conclusão = execução + validade (recalcula quando a validade muda)
          if (this.validadeControlName) {
            this.formInfos.get(this.validadeControlName)!.valueChanges.subscribe(() => this.recalcularConclusao());
          }
          this.recalcularConclusao();

          if (this.id) {
            this.carregarProposta();
          } else {
            this.carregando.set(false);
          }
        },
        error: () => {
          this.erroTipo.set(true);
          this.carregando.set(false);
        },
      });
  }

  private carregarProposta(): void {
    this.service.obterPorId(this.id!).subscribe({
      next: (p) => {
        this.formDetalhes.patchValue({
          id: p.id,
          numero: p.numero,
          identificacao: p.identificacao,
          idCliente: p.idCliente,
          dataExecucao: p.dataExecucao ? p.dataExecucao.substring(0, 16) : this.agora(),
          dataConclusao: p.dataConclusao ? p.dataConclusao.substring(0, 16) : '',
        });
        const cli = this.clientesLista().find((c) => c.id === p.idCliente) ?? null;
        this.clienteSelecionado.set(cli);
        this.clienteBusca.set(cli ? cli.nome_empresa_nome_pf : '');
        for (const campo of this.camposInfo()) {
          const salva = p.informacoes.find((i) => i.informacao === campo.informacao);
          if (salva) this.formInfos.get(campo.controlName)?.setValue(salva.valor ?? '', { emitEvent: false });
        }
        this.precos.set(
          [...p.precos]
            .sort((a, b) => a.ordem - b.ordem)
            .map((pr) => ({
              id: pr.id,
              ordem: pr.ordem,
              idItemPreco: pr.idItemPreco,
              identificacao: pr.identificacao,
              precoTabela: pr.precoTabela,
              preco: pr.preco,
              quantidade: pr.quantidade,
            }))
        );
        if (this.modoVisualizacao) {
          this.formDetalhes.disable();
          this.formInfos.disable();
        }
        this.carregando.set(false);
        this.carregarAmostras();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a proposta.' });
        this.carregando.set(false);
      },
    });
  }

  private carregarAmostras(): void {
    if (!this.id) return;
    this.amostrasService.listarPorProposta(this.id).subscribe({
      next: (lista) => this.amostras.set(lista),
      error: () => this.amostras.set([]),
    });
  }

  // ---------------- Datas ----------------
  private agora(): string {
    return this.toDatetimeLocal(new Date());
  }

  private toDatetimeLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private recalcularConclusao(): void {
    if (this.modoVisualizacao) return;
    const execucao = this.formDetalhes?.get('dataExecucao')?.value;
    const validade = this.validadeControlName ? this.formInfos.get(this.validadeControlName)?.value : null;
    if (!execucao) return;
    const base = new Date(execucao);
    if (isNaN(base.getTime())) return;
    const v = (validade || '').toString().toLowerCase().trim();
    const m = v.match(/(\d+)\s*(dia|mes|mês|ano)/);
    const d = new Date(base);
    if (m) {
      const qtd = parseInt(m[1], 10);
      const unidade = m[2];
      if (unidade.startsWith('dia')) d.setDate(d.getDate() + qtd);
      else if (unidade.startsWith('me') || unidade.startsWith('mê')) d.setMonth(d.getMonth() + qtd);
      else if (unidade.startsWith('ano')) d.setFullYear(d.getFullYear() + qtd);
    }
    this.formDetalhes.get('dataConclusao')?.setValue(this.toDatetimeLocal(d));
  }

  // ---------------- Cliente (busca) ----------------
  onBuscaCliente(texto: string): void {
    this.clienteBusca.set(texto);
    this.mostrarResultados.set(true);
    if (this.clienteSelecionado() && texto !== this.clienteSelecionado()!.nome_empresa_nome_pf) {
      this.clienteSelecionado.set(null);
      this.formDetalhes.get('idCliente')?.setValue(null);
    }
  }

  selecionarCliente(c: ClienteResponseModel): void {
    this.clienteSelecionado.set(c);
    this.clienteBusca.set(c.nome_empresa_nome_pf);
    this.formDetalhes.get('idCliente')?.setValue(c.id);
    this.mostrarResultados.set(false);
  }

  limparCliente(): void {
    this.clienteSelecionado.set(null);
    this.clienteBusca.set('');
    this.formDetalhes.get('idCliente')?.setValue(null);
    this.mostrarResultados.set(false);
  }

  fecharResultados(): void {
    setTimeout(() => this.mostrarResultados.set(false), 150);
  }

  // ---------------- Preços ----------------
  onBuscaItem(texto: string): void {
    this.itemBusca.set(texto);
    this.mostrarResultadosItem.set(true);
  }

  fecharResultadosItem(): void {
    setTimeout(() => this.mostrarResultadosItem.set(false), 150);
  }

  adicionarItemPreco(item: ItemPrecoResponseModel): void {
    if (this.modoVisualizacao) return;
    this.precos.update((lista) => [
      ...lista,
      {
        ordem: lista.length + 1,
        idItemPreco: item.id,
        identificacao: item.identificacao,
        precoTabela: item.preco,
        preco: item.preco,
        quantidade: 1,
      },
    ]);
    this.itemBusca.set('');
    this.mostrarResultadosItem.set(false);
  }

  removerPreco(index: number): void {
    if (this.modoVisualizacao) return;
    this.precos.update((lista) =>
      lista.filter((_, i) => i !== index).map((p, i) => ({ ...p, ordem: i + 1 }))
    );
  }

  atualizarPreco(index: number, valor: string): void {
    const preco = this.parseNumero(valor);
    this.precos.update((lista) => lista.map((p, i) => (i === index ? { ...p, preco } : p)));
  }

  atualizarQuantidade(index: number, valor: string): void {
    const quantidade = this.parseNumero(valor);
    this.precos.update((lista) => lista.map((p, i) => (i === index ? { ...p, quantidade } : p)));
  }

  totalLinha(p: PropostaPrecoModel): number {
    return (p.preco || 0) * (p.quantidade || 0);
  }

  private parseNumero(valor: string): number {
    const n = parseFloat((valor ?? '').toString().replace(',', '.'));
    return isNaN(n) || n < 0 ? 0 : n;
  }

  private montarPrecos(): PropostaPrecoModel[] {
    return this.precos().map((p, i) => ({
      ordem: i + 1,
      idItemPreco: p.idItemPreco,
      identificacao: p.identificacao,
      precoTabela: p.precoTabela,
      preco: p.preco || 0,
      quantidade: p.quantidade || 0,
    }));
  }

  // ---------------- Amostras (modelo) ----------------
  abrirModalAmostra(): void {
    this.tipoAmostraBusca.set('');
    this.mostrarModalAmostra.set(true);
  }

  fecharModalAmostra(): void {
    this.mostrarModalAmostra.set(false);
  }

  criarAmostraDoTipo(tipo: TipoAmostraResponseModel): void {
    if (!this.id) return;
    // Não grava aqui: abre a tela de nova amostra; o id só nasce ao Salvar.
    this.mostrarModalAmostra.set(false);
    this.router.navigate(['/comercial', this.id, 'amostra', 'nova'], { queryParams: { tipo: tipo.id } });
  }

  abrirAmostra(a: AmostraModel): void {
    this.router.navigate(['/comercial', this.id, 'amostra', a.id]);
  }

  removerAmostra(a: AmostraModel): void {
    this.confirmationService.confirm({
      message: `Remover a amostra "${a.identificacao || a.tipoAmostra}" (id ${a.id})?`,
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sim, remover',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.amostrasService.deletar(a.id).subscribe({
          next: () => {
            this.amostras.set(this.amostras().filter((x) => x.id !== a.id));
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Amostra removida.' });
          },
          error: () =>
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível remover a amostra.' }),
        }),
    });
  }

  irParaEdicao(): void {
    if (this.id) this.router.navigate(['/comercial', this.id, 'editar']);
  }

  setTab(tab: Aba): void {
    this.currentTab.set(tab);
  }

  private montarInformacoes() {
    return this.camposInfo().map((c) => ({
      ordem: c.ordem,
      etapa: c.etapa,
      informacao: c.informacao,
      valor: (this.formInfos.get(c.controlName)?.value || '').toString().trim() || null,
    }));
  }

  cancelar(): void {
    this.confirmationService.confirm({
      message: 'Deseja realmente descartar as alterações?',
      header: 'Confirmar Descarte',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sim, descartar',
      rejectLabel: 'Cancelar',
      accept: () => this.router.navigate(['/comercial']),
    });
  }

  salvar(): void {
    if (this.formDetalhes.invalid) {
      this.formDetalhes.markAllAsTouched();
      this.currentTab.set('detalhes');
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha a identificação da proposta.' });
      return;
    }
    if (this.formInfos.invalid) {
      this.formInfos.markAllAsTouched();
      this.currentTab.set('informacoes');
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha as informações obrigatórias antes de salvar.' });
      return;
    }

    if (this.precos().some((p) => (p.quantidade || 0) <= 0)) {
      this.currentTab.set('precos');
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Cada item de preço precisa de uma quantidade maior que zero.' });
      return;
    }

    const idTipo = this.idTipoAtividade();
    if (idTipo === null) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Tipo de atividade "Proposta Comercial" não encontrado.' });
      return;
    }

    const payload: CriarPropostaPayload = {
      idTipoAtividade: idTipo,
      identificacao: this.formDetalhes.get('identificacao')?.value,
      idCliente: this.formDetalhes.get('idCliente')?.value ?? null,
      idResponsavel: null, // definido pelo usuário logado (pendente de login)
      dataExecucao: this.formDetalhes.get('dataExecucao')?.value || null,
      dataConclusao: this.formDetalhes.get('dataConclusao')?.value || null,
      informacoes: this.montarInformacoes(),
      precos: this.montarPrecos(),
    };

    const erro = () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar a proposta. Tente novamente.' });

    if (this.id) {
      this.service.atualizar(this.id, payload).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Proposta atualizada com sucesso.' }),
        error: erro,
      });
    } else {
      this.service.criar(payload).subscribe({
        next: (criada) => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Proposta criada com sucesso.' });
          setTimeout(() => this.router.navigate(['/comercial', criada.id, 'editar']), 1000);
        },
        error: erro,
      });
    }
  }
}
