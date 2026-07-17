import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TiposAmostrasService } from 'src/services/tipos-amostras.service';

@Component({
  selector: 'app-tipo-amostra-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tipo-amostra-cadastro.html',
})
export class TipoAmostraCadastro implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TiposAmostrasService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  formAmostra!: FormGroup;
  statusOptions = ['Ativo', 'Inativo'];
  motivoOptions = ['Rotina', 'Controle de Qualidade', 'Prioritária (Rush)'] as const;

  id: string | null = null;
  modoVisualizacao = false;

  get tituloPagina(): string {
    if (this.modoVisualizacao) return 'Visualizar Amostra Padrão';
    return this.id ? 'Editar Amostra Padrão' : 'Nova Amostra Padrão';
  }

  ngOnInit(): void {
    this.formAmostra = this.fb.group({
      tipo: ['', Validators.required],
      motivo: ['Rotina', Validators.required],
      publicacaoManual: [false],
      obrigarDataColeta: [false],
      status: ['Ativo', Validators.required],
      observacoes: [''],
    });

    this.id = this.route.snapshot.paramMap.get('id');
    this.modoVisualizacao = this.route.snapshot.data['modo'] === 'visualizar';

    if (this.id) {
      this.service.obterPorId(this.id).subscribe({
        next: (item) => {
          this.formAmostra.patchValue({
            tipo: item.tipo,
            motivo: item.motivo,
            publicacaoManual: item.publicacaoManual,
            obrigarDataColeta: item.obrigarDataColeta,
            status: item.status,
            observacoes: item.observacoes ?? '',
          });
          if (this.modoVisualizacao) {
            this.formAmostra.disable();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o tipo de amostra.' });
        },
      });
    }
  }

  get controle() {
    return this.formAmostra.controls;
  }

  irParaEdicao(): void {
    if (this.id) {
      this.router.navigate(['/tipos-amostras', this.id, 'editar']);
    }
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
        this.router.navigate(['/tipos-amostras']);
      },
    });
  }

  salvar(): void {
    if (this.formAmostra.invalid) {
      this.formAmostra.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    const valores = this.formAmostra.getRawValue();
    const erro = () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar o tipo de amostra. Tente novamente.' });

    if (this.id) {
      this.service.atualizar(this.id, valores).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipo de amostra atualizado com sucesso.' }),
        error: erro,
      });
    } else {
      this.service.addTipoAmostra(valores).subscribe({
        next: (criado) => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipo de amostra cadastrado com sucesso.' });
          setTimeout(() => this.router.navigate(['/tipos-amostras', criado.id, 'editar']), 1000);
        },
        error: erro,
      });
    }
  }
}
