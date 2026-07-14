import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MetodologiaCadastroService } from 'src/services/metodologia-cadastro.service';
import { MetodologiasListService } from 'src/services/metodologias-list.service';
import { TipoAmostra, UnidadeMedida, AnaliseModel } from '@/models/analise.model';

interface Equipamento {
  nome: string;
  quantidade: number;
}

interface Reagente {
  nome: string;
  quantidade: number;
}

interface Embalagem {
  tipoEmbalagem: string;
  tipoAmostra: string;
  quantidade: number;
  unidadeMedida: string;
  preservante: string;
}

@Component({
  selector: 'app-metodologia-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './metodologia-cadastro.html',
})
export class MetodologiaCadastro implements OnInit {
  formMetodologia!: FormGroup;
  abaAtiva = 'dados'; // 'dados', 'recursos', 'analises', 'embalagens'

  // Arrays para Equipamentos, Reagentes, Análises e Embalagens
  equipamentos: Equipamento[] = [];
  reagentes: Reagente[] = [];
  analises: AnaliseModel[] = [];
  embalagens: Embalagem[] = [];

  // Campos temporários para adicionar
  equipamentoNome = '';
  equipamentoQuantidade: number | null = null;

  reagenteNome = '';
  reagenteQuantidade: number | null = null;

  analiseNome = '';
  analiseTipo: TipoAmostra = 'agua';
  analiseUnidade: UnidadeMedida = 'mg/L';
  analiseIncerteza: number | null = null;
  analiseLQ: number | null = null;
  analiseLD: number | null = null;
  analiseEditIndex: number | null = null;

  embalagemTipo = '';
  embalagemTipoAmostra: TipoAmostra = 'agua';
  embalagemQuantidade: number | null = null;
  embalagemUnidade: UnidadeMedida = 'mg/L';
  embalagemPreservante = '';

  tiposEmbalagem = [
    { label: 'Estéril', value: 'Estéril' },
    { label: 'Pote Boca Larga', value: 'Pote Boca Larga' },
    { label: 'Plástico', value: 'Plástico' },
    { label: 'Saco Estéil', value: 'Saco Estéil' },
    { label: 'SWAB', value: 'SWAB' },
    { label: 'Vidro', value: 'Vidro' },
    { label: 'Vidro Âmbar', value: 'Vidro Âmbar' },
    { label: 'Vidro Boca Larga', value: 'Vidro Boca Larga' },
    { label: 'Vial', value: 'Vial' },
    { label: 'Vial Âmbar', value: 'Vial Âmbar' },
  ];

  tiposAmostra: { label: string; value: TipoAmostra }[] = [
    { label: 'Água', value: 'agua' },
    { label: 'Efluente', value: 'efluente' },
    { label: 'Solo', value: 'solo' }
  ];

  unidadesPorTipo: Record<TipoAmostra, { label: string; value: UnidadeMedida }[]> = {
    agua: [
      { label: 'mg/L', value: 'mg/L' },
      { label: 'µg/L', value: 'µg/L' },
      { label: 'ng/L', value: 'ng/L' },
      { label: 'pg/L', value: 'pg/L' },
      { label: 'pH', value: 'pH' },
      { label: 'mS/cm', value: 'mS/cm' },
      { label: 'mV', value: 'mV' },
      { label: 'NTU', value: 'NTU' },
      { label: 'mg/L CaCO₃', value: 'mg/L CaCO₃' },
      { label: 'UFC/mL', value: 'UFC/mL' },
      { label: 'UFC/100mL', value: 'UFC/100mL' },
      { label: 'MPN/100mL', value: 'MPN/100mL' }
    ],
    efluente: [
      { label: 'mg/L', value: 'mg/L' },
      { label: 'µg/L', value: 'µg/L' },
      { label: 'ng/L', value: 'ng/L' },
      { label: 'mg/m³', value: 'mg/m³' },
      { label: 'µg/m³', value: 'µg/m³' },
      { label: 'pH', value: 'pH' },
      { label: 'mS/cm', value: 'mS/cm' },
      { label: 'NTU', value: 'NTU' },
      { label: 'UFC/mL', value: 'UFC/mL' },
      { label: 'UFC/100mL', value: 'UFC/100mL' },
      { label: 'MPN/100mL', value: 'MPN/100mL' }
    ],
    solo: [
      { label: 'mg/kg', value: 'mg/kg' },
      { label: 'µg/kg', value: 'µg/kg' },
      { label: 'ng/kg', value: 'ng/kg' },
      { label: '%', value: '%' },
      { label: 'cmol/kg', value: 'cmol/kg' },
      { label: 'mmol/kg', value: 'mmol/kg' },
      { label: 'g/kg', value: 'g/kg' },
      { label: 'mg/dm³', value: 'mg/dm³' }
    ]
  };

  historicoModelos = [
    { title: 'Template Padrão', subtitle: 'Criado em 18/04/2026', status: 'Base' },
    { title: 'Revisão QC', subtitle: 'Atualizado em 05/05/2026', status: 'Atualizado' },
    { title: 'Versão Final', subtitle: 'Publicado em 12/05/2026', status: 'Revisão' },
  ];

  setores = [
    { label: 'Campo - Coleta', value: 'Campo - Coleta' },
    { label: 'Ecotoxicológico', value: 'Ecotoxicológico' },
    { label: 'Fisico-Quimico', value: 'Fisico-Quimico' },
    { label: 'GC - Cromatografia Gasosa', value: 'GC - Cromatografia Gasosa' },
    { label: 'HLPC', value: 'HLPC' },
    { label: 'IC - Cromatografia Iônica', value: 'IC - Cromatografia Iônica' },
    { label: 'Microbiologia', value: 'Microbiologia' },
    { label: 'Parasitologia', value: 'Parasitologia' },
    { label: 'Subcontratado', value: 'Subcontratado' },
    { label: 'Virologia', value: 'Virologia' }
  ];

  criticidades = [
    { label: 'Baixa', value: 'baixa' },
    { label: 'Média', value: 'media' },
    { label: 'Alta', value: 'alta' }
  ];

id: string | null = null;
  modoVisualizacao = false;
  codigoExistente = '';
  obsoletoExistente = false;

  private readonly route = inject(ActivatedRoute);
  private readonly metodologiasListService = inject(MetodologiasListService);

  get tituloPagina(): string {
    if (this.modoVisualizacao) return 'Visualizar Metodologia de Análise';
    return this.id ? 'Editar Metodologia de Análise' : 'Nova Metodologia de Análise';
  }

  constructor(private fb: FormBuilder, private service: MetodologiaCadastroService, private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.formMetodologia = this.fb.group({
      nome: ['', Validators.required],
      norma: ['', Validators.required],
      prazoConclusao: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      setor: ['', Validators.required],
      criticidade: ['media', Validators.required]
    });

    this.id = this.route.snapshot.paramMap.get('id');
    this.modoVisualizacao = this.route.snapshot.data['modo'] === 'visualizar';

    if (this.id) {
      this.metodologiasListService.obterPorId(this.id).subscribe({
        next: (item) => {
          this.formMetodologia.patchValue({
            nome: item.nome,
            norma: item.norma,
            prazoConclusao: item.prazoConclusaoDias,
            setor: item.setor,
            criticidade: item.criticidade,
          });
          this.codigoExistente = item.codigo;
          this.obsoletoExistente = item.obsoleto;
          this.analises = item.analises ?? [];
          this.embalagens = item.embalagens ?? [];
          this.equipamentos = item.equipamentos ?? [];
          this.reagentes = item.reagentes ?? [];
          if (this.modoVisualizacao) {
            this.formMetodologia.disable();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a metodologia.' });
        },
      });
    }
  }

  irParaEdicao(): void {
    if (this.id) {
      this.router.navigate(['/metodologias', this.id, 'editar']);
    }
  }

  // EMBALAGENS
  atualizarUnidadeEmbalagem() {
    const unidades = this.getUnidadesPorTipo(this.embalagemTipoAmostra);
    if (unidades.length > 0 && !unidades.find(u => u.value === this.embalagemUnidade)) {
      this.embalagemUnidade = unidades[0].value;
    }
  }

  adicionarEmbalagem() {
    if (!this.embalagemTipo || !this.embalagemQuantidade || !this.embalagemUnidade) {
      alert('Preencha o Tipo de Embalagem, Quantidade e Unidade de Medida');
      return;
    }
    this.embalagens = [...this.embalagens, {
      tipoEmbalagem: this.embalagemTipo,
      tipoAmostra: this.embalagemTipoAmostra,
      quantidade: this.embalagemQuantidade,
      unidadeMedida: this.embalagemUnidade,
      preservante: this.embalagemPreservante
    }];
    this.embalagemTipo = '';
    this.embalagemTipoAmostra = 'agua';
    this.embalagemQuantidade = null;
    this.embalagemUnidade = 'mg/L';
    this.embalagemPreservante = '';
  }

  removerEmbalagem(index: number) {
    this.embalagens = this.embalagens.filter((_, i) => i !== index);
  }

  // EQUIPAMENTOS
  adicionarEquipamento() {
    if (!this.equipamentoNome || !this.equipamentoQuantidade) {
      alert('Preencha o nome e quantidade do equipamento');
      return;
    }
    this.equipamentos = [...this.equipamentos, { nome: this.equipamentoNome, quantidade: this.equipamentoQuantidade }];
    this.equipamentoNome = '';
    this.equipamentoQuantidade = null;
  }

  removerEquipamento(index: number) {
    this.equipamentos = this.equipamentos.filter((_, i) => i !== index);
  }

  // REAGENTES
  adicionarReagente() {
    if (!this.reagenteNome || !this.reagenteQuantidade) {
      alert('Preencha o nome e quantidade do reagente');
      return;
    }
    this.reagentes = [...this.reagentes, { nome: this.reagenteNome, quantidade: this.reagenteQuantidade }];
    this.reagenteNome = '';
    this.reagenteQuantidade = null;
  }

  removerReagente(index: number) {
    this.reagentes = this.reagentes.filter((_, i) => i !== index);
  }

  // ANÁLISES
  getUnidadesPorTipo(tipoAmostra: TipoAmostra): { label: string; value: UnidadeMedida }[] {
    return this.unidadesPorTipo[tipoAmostra] || [];
  }

  getTipoAmostraLabel(tipoAmostra: string): string {
    return this.tiposAmostra.find(tipo => tipo.value === tipoAmostra)?.label || 'Desconhecido';
  }

  atualizarUnidade() {
    const unidades = this.getUnidadesPorTipo(this.analiseTipo);
    if (unidades.length > 0 && !unidades.find(u => u.value === this.analiseUnidade)) {
      this.analiseUnidade = unidades[0].value;
    }
  }

  adicionarAnalise() {
    if (!this.analiseNome || !this.analiseUnidade || this.analiseIncerteza == null || this.analiseLQ == null || this.analiseLD == null) {
      alert('Preencha todos os campos obrigatórios da análise');
      return;
    }

    const analisePayload: AnaliseModel = {
      identificacao: this.analiseNome,
      tipoAmostra: this.analiseTipo,
      unidadeMedida: this.analiseUnidade,
      incerteza: this.analiseIncerteza,
      lq: this.analiseLQ,
      ld: this.analiseLD
    };

    if (this.analiseEditIndex !== null) {
      this.analises = this.analises.map((item, index) => index === this.analiseEditIndex ? analisePayload : item);
    } else {
      this.analises = [...this.analises, analisePayload];
    }

    this.cancelarEdicaoAnalise();
  }

  editarAnalise(index: number) {
    const analise = this.analises[index];
    if (!analise) {
      return;
    }

    this.analiseEditIndex = index;
    this.analiseNome = analise.identificacao;
    this.analiseTipo = analise.tipoAmostra;
    this.analiseUnidade = analise.unidadeMedida;
    this.analiseIncerteza = analise.incerteza;
    this.analiseLQ = analise.lq;
    this.analiseLD = analise.ld;
    this.trocarAba('analises');
  }

  cancelarEdicaoAnalise() {
    this.analiseEditIndex = null;
    this.analiseNome = '';
    this.analiseTipo = 'agua';
    this.analiseUnidade = 'mg/L';
    this.analiseIncerteza = null;
    this.analiseLQ = null;
    this.analiseLD = null;
  }

  removerAnalise(index: number) {
    this.analises = this.analises.filter((_, i) => i !== index);
  }

  setCriticidade(value: string) {
    this.formMetodologia.get('criticidade')?.setValue(value);
  }

  trocarAba(aba: string) {
    this.abaAtiva = aba;
  }

  async salvar() {
    if (this.formMetodologia.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios do formulário.' });
      this.formMetodologia.markAllAsTouched();
      return;
    }

    const dados = {
      ...this.formMetodologia.value,
      equipamentos: this.equipamentos,
      reagentes: this.reagentes,
      analises: this.analises,
      embalagens: this.embalagens
    };

    try {
      if (this.id) {
        await this.service.atualizar(this.id, dados, this.codigoExistente, this.obsoletoExistente);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Metodologia de Análise atualizada com sucesso!' });
      } else {
        await this.service.save(dados);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Metodologia de Análise salva com sucesso!' });
      }

      // Aguarda um pouco para exibir a mensagem antes de navegar
      setTimeout(() => {
        this.router.navigate(['/metodologias']);
      }, 1500);
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar a metodologia. Tente novamente.' });
      console.error('Erro ao salvar:', error);
    }
  }

  descartar() {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja descartar esta metodologia? Todos os dados serão perdidos.',
      header: 'Confirmar Descarte',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.formMetodologia.reset({
          nome: '',
          norma: '',
          prazoConclusao: '',
          setor: '',
          criticidade: 'media'
        });

        this.equipamentos = [];
        this.equipamentoNome = '';
        this.equipamentoQuantidade = null;

        this.reagentes = [];
        this.reagenteNome = '';
        this.reagenteQuantidade = null;

        this.analises = [];
        this.analiseNome = '';
        this.analiseTipo = 'agua';
        this.analiseUnidade = 'mg/L';
        this.analiseIncerteza = null;
        this.analiseLQ = null;
        this.analiseLD = null;
        this.analiseEditIndex = null;

        this.embalagens = [];
        this.embalagemTipo = '';
        this.embalagemTipoAmostra = 'agua';
        this.embalagemQuantidade = null;
        this.embalagemUnidade = 'mg/L';
        this.embalagemPreservante = '';

        this.messageService.add({ severity: 'info', summary: 'Descartado', detail: 'Metodologia descartada com sucesso.' });
        
        setTimeout(() => {
          this.router.navigate(['/metodologias']);
        }, 1500);
      }
    });
  }
}
