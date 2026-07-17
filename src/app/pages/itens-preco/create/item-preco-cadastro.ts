import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TipoItemPreco } from '@/models/item-preco.model';
import { ItensPrecoService } from 'src/services/itens-preco.service';

@Component({
  selector: 'app-item-preco-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './item-preco-cadastro.html',
})
export class ItemPrecoCadastro implements OnInit {
  private route = inject(ActivatedRoute);

  itemPrecoForm!: FormGroup;
  precoDisplayValue = '';

  id: string | null = null;
  modoVisualizacao = false;
  carregando = false;

  tipos: { label: string; value: TipoItemPreco }[] = [
    { label: 'Despesa', value: 'Despesa' },
    { label: 'Produto', value: 'Produto' },
    { label: 'Serviço', value: 'Serviço' },
  ];

  get tituloPagina(): string {
    if (this.modoVisualizacao) return 'Visualizar Item de Preço';
    return this.id ? 'Editar Item de Preço' : 'Novo Item de Preço';
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private itensPrecoService: ItensPrecoService
  ) {}

  ngOnInit() {
    this.initForm();

    this.id = this.route.snapshot.paramMap.get('id');
    this.modoVisualizacao = this.route.snapshot.data['modo'] === 'visualizar';

    if (this.id) {
      this.carregando = true;
      this.itensPrecoService.obterPorId(this.id).subscribe({
        next: (item) => {
          this.itemPrecoForm.patchValue({
            identificacao: item.identificacao,
            preco: item.preco,
            tipo: item.tipo,
          });
          this.precoDisplayValue = item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          this.carregando = false;
          if (this.modoVisualizacao) {
            this.itemPrecoForm.disable();
          }
        },
        error: () => {
          this.carregando = false;
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o item de preço.' });
        },
      });
    }
  }

  initForm() {
    this.itemPrecoForm = this.fb.group({
      identificacao: ['', [Validators.required]],
      preco: [0, [Validators.required, Validators.min(0)]],
      tipo: ['', [Validators.required]],
    });
  }

  irParaEdicao(): void {
    if (this.id) {
      this.router.navigate(['/itens-preco', this.id, 'editar']);
    }
  }

  onPrecoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^\d]/g, '');

    if (value) {
      const numberValue = parseInt(value, 10) / 100;
      this.precoDisplayValue = numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      this.itemPrecoForm.patchValue({ preco: numberValue });
    } else {
      this.precoDisplayValue = '';
      this.itemPrecoForm.patchValue({ preco: 0 });
    }
  }

  descartar() {
    this.confirmationService.confirm({
      message: 'Deseja realmente descartar o cadastro? Todos os dados serão perdidos.',
      header: 'Confirmar Descarte',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sim, descartar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.itemPrecoForm.reset();
        this.precoDisplayValue = '';

        this.messageService.add({
          severity: 'info',
          summary: 'Descartado',
          detail: 'Cadastro descartado com sucesso.',
        });

        setTimeout(() => {
          this.router.navigate(['/itens-preco']);
        }, 1500);
      },
    });
  }

  salvar() {
    if (this.itemPrecoForm.invalid) {
      this.itemPrecoForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos obrigatórios.',
      });
      return;
    }

    const payload = {
      identificacao: this.itemPrecoForm.value.identificacao,
      preco: this.itemPrecoForm.value.preco,
      tipo: this.itemPrecoForm.value.tipo,
    };

    const erro = () => this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível salvar o item de preço. Tente novamente.',
    });

    if (this.id) {
      this.itensPrecoService.atualizar(this.id, payload).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Item de preço atualizado com sucesso!' }),
        error: erro,
      });
      return;
    }

    this.itensPrecoService.addItemPreco(payload).subscribe({
      next: (criado) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Item de preço cadastrado com sucesso!',
        });
        setTimeout(() => this.router.navigate(['/itens-preco', criado.id, 'editar']), 1000);
      },
      error: erro,
    });
  }
}
