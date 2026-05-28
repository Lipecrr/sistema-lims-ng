import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TipoItemPreco } from '@/models/item-preco.model';
import { ItensPrecoService } from '@/services/itens-preco.service';

@Component({
  selector: 'app-item-preco-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './item-preco-cadastro.html',
})
export class ItemPrecoCadastro implements OnInit {
  itemPrecoForm!: FormGroup;
  precoDisplayValue = '';

  tipos: { label: string; value: TipoItemPreco }[] = [
    { label: 'Despesa', value: 'Despesa' },
    { label: 'Produto', value: 'Produto' },
    { label: 'Serviço', value: 'Serviço' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private itensPrecoService: ItensPrecoService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.itemPrecoForm = this.fb.group({
      identificacao: ['', [Validators.required]],
      preco: [0, [Validators.required, Validators.min(0)]],
      tipo: ['', [Validators.required]],
    });
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
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, descartar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.router.navigate(['/itens-preco']);
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

    this.itensPrecoService.addItemPreco({
      identificacao: this.itemPrecoForm.value.identificacao,
      preco: this.itemPrecoForm.value.preco,
      tipo: this.itemPrecoForm.value.tipo,
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Item de preço cadastrado com sucesso!',
    });

    setTimeout(() => {
      this.router.navigate(['/itens-preco']);
    }, 1500);
  }
}
