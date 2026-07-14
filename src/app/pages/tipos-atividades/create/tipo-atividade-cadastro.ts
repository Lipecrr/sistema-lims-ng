import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InformacaoAtividadeModel, TipoAtividadeModel } from '@/models/tipo-atividade.model';
import { TiposAtividadesService } from 'src/services/tipos-atividades.service';

@Component({
  selector: 'app-tipo-atividade-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
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
    this.router.navigate(['/tipos-atividades']);
  }

  salvar(): void {
    if (this.formAtividade.invalid || !this.formAtividade.get('tipo')?.value) {
      this.formAtividade.markAllAsTouched();
      return;
    }

    const payload: Omit<TipoAtividadeModel, 'id'> = {
      versao: this.formAtividade.get('versao')?.value,
      tipo: this.formAtividade.get('tipo')?.value,
      fluxoEtapas: this.fluxoEtapas,
      informacoes: this.informacoes,
    };

    this.service.addTipoAtividade(payload).subscribe({
      next: () => {
        alert('Tipo de atividade salvo com sucesso.');
        this.router.navigate(['/tipos-atividades']);
      },
      error: () => {
        alert('Não foi possível salvar o tipo de atividade. Tente novamente.');
      },
    });
  }
}
