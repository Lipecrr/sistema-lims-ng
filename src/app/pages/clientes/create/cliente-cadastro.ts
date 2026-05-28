import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

type TipoPessoa = 'PJ' | 'PF';
type AbaAtiva = 'informacoes' | 'endereco';
type TipoContato = 'telefone' | 'email';
type SetorContato = 'compras' | 'financeiro' | 'tecnico';

interface Contato {
  tipo: TipoContato;
  setor: SetorContato;
  valor: string;
}

@Component({
  selector: 'app-cliente-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cliente-cadastro.html',
})
export class ClienteCadastro implements OnInit {
  clienteForm!: FormGroup;
  tipoPessoa: TipoPessoa = 'PJ';
  abaAtiva: AbaAtiva = 'informacoes';

  // Contatos dinâmicos
  contatos: Contato[] = [];
  novoContatoTipo: TipoContato = 'telefone';
  novoContatoSetor: SetorContato = 'compras';
  novoContatoValor: string = '';

  setores = [
    { label: 'Compras', value: 'compras' },
    { label: 'Financeiro', value: 'financeiro' },
    { label: 'Técnico', value: 'tecnico' },
  ];

  segmentos = [
    { label: 'Farmacêutico', value: 'farmaceutico' },
    { label: 'Alimentos', value: 'alimentos' },
    { label: 'Químico', value: 'quimico' },
    { label: 'Ambiental', value: 'ambiental' },
    { label: 'Outros', value: 'outros' },
  ];

  estados = [
    { label: 'AC', value: 'AC' },
    { label: 'AL', value: 'AL' },
    { label: 'AP', value: 'AP' },
    { label: 'AM', value: 'AM' },
    { label: 'BA', value: 'BA' },
    { label: 'CE', value: 'CE' },
    { label: 'DF', value: 'DF' },
    { label: 'ES', value: 'ES' },
    { label: 'GO', value: 'GO' },
    { label: 'MA', value: 'MA' },
    { label: 'MT', value: 'MT' },
    { label: 'MS', value: 'MS' },
    { label: 'MG', value: 'MG' },
    { label: 'PA', value: 'PA' },
    { label: 'PB', value: 'PB' },
    { label: 'PR', value: 'PR' },
    { label: 'PE', value: 'PE' },
    { label: 'PI', value: 'PI' },
    { label: 'RJ', value: 'RJ' },
    { label: 'RN', value: 'RN' },
    { label: 'RS', value: 'RS' },
    { label: 'RO', value: 'RO' },
    { label: 'RR', value: 'RR' },
    { label: 'SC', value: 'SC' },
    { label: 'SP', value: 'SP' },
    { label: 'SE', value: 'SE' },
    { header: 'TO', value: 'TO' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.clienteForm = this.fb.group({
      // Dados comuns
      tipoPessoa: [this.tipoPessoa],
      
      // Dados PJ
      razaoSocial: [''],
      nomeFantasia: [''],
      cnpj: [''],
      inscricaoEstadual: [''],
      segmento: [''],
      
      // Dados PF
      nomeCompleto: [''],
      cpf: [''],
      
      // Endereço
      cep: [''],
      logradouro: [''],
      numero: [''],
      cidade: [''],
      estado: [''],
      
      // Contato
      telefone: [''],
      emailFaturamento: [''],
    });

    this.updateValidators();
  }

  updateValidators() {
    const razaoSocial = this.clienteForm.get('razaoSocial');
    const nomeFantasia = this.clienteForm.get('nomeFantasia');
    const cnpj = this.clienteForm.get('cnpj');
    const inscricaoEstadual = this.clienteForm.get('inscricaoEstadual');
    const segmento = this.clienteForm.get('segmento');
    const nomeCompleto = this.clienteForm.get('nomeCompleto');
    const cpf = this.clienteForm.get('cpf');
    const cep = this.clienteForm.get('cep');
    const logradouro = this.clienteForm.get('logradouro');
    const numero = this.clienteForm.get('numero');
    const cidade = this.clienteForm.get('cidade');
    const estado = this.clienteForm.get('estado');
    const telefone = this.clienteForm.get('telefone');
    const emailFaturamento = this.clienteForm.get('emailFaturamento');

    if (this.tipoPessoa === 'PJ') {
      razaoSocial?.setValidators([Validators.required]);
      nomeFantasia?.setValidators([Validators.required]);
      cnpj?.setValidators([Validators.required]);
      inscricaoEstadual?.setValidators([Validators.required]);
      segmento?.setValidators([Validators.required]);
      nomeCompleto?.clearValidators();
      cpf?.clearValidators();
    } else {
      razaoSocial?.clearValidators();
      nomeFantasia?.clearValidators();
      cnpj?.clearValidators();
      inscricaoEstadual?.clearValidators();
      segmento?.clearValidators();
      nomeCompleto?.setValidators([Validators.required]);
      cpf?.setValidators([Validators.required]);
    }

    // Validadores comuns
    cep?.setValidators([Validators.required]);
    logradouro?.setValidators([Validators.required]);
    numero?.setValidators([Validators.required]);
    cidade?.setValidators([Validators.required]);
    estado?.setValidators([Validators.required]);
    telefone?.setValidators([Validators.required]);
    emailFaturamento?.setValidators([Validators.required, Validators.email]);

    // Atualizar validações
    razaoSocial?.updateValueAndValidity();
    nomeFantasia?.updateValueAndValidity();
    cnpj?.updateValueAndValidity();
    inscricaoEstadual?.updateValueAndValidity();
    segmento?.updateValueAndValidity();
    nomeCompleto?.updateValueAndValidity();
    cpf?.updateValueAndValidity();
    cep?.updateValueAndValidity();
    logradouro?.updateValueAndValidity();
    numero?.updateValueAndValidity();
    cidade?.updateValueAndValidity();
    estado?.updateValueAndValidity();
    telefone?.updateValueAndValidity();
    emailFaturamento?.updateValueAndValidity();
  }

  trocarTipoPessoa(tipo: TipoPessoa) {
    this.tipoPessoa = tipo;
    this.clienteForm.patchValue({ tipoPessoa: tipo });
    this.updateValidators();
    this.clienteForm.reset({
      tipoPessoa: tipo,
    });
  }

  trocarAba(aba: AbaAtiva) {
    this.abaAtiva = aba;
  }

  adicionarContato() {
    if (!this.novoContatoValor.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha o valor do contato.',
      });
      return;
    }

    this.contatos.push({
      tipo: this.novoContatoTipo,
      setor: this.novoContatoSetor,
      valor: this.novoContatoValor.trim(),
    });

    // Limpar campos
    this.novoContatoValor = '';

    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Contato adicionado com sucesso!',
    });
  }

  removerContato(index: number) {
    this.confirmationService.confirm({
      message: 'Deseja realmente remover este contato?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, remover',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.contatos.splice(index, 1);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Contato removido com sucesso!',
        });
      },
    });
  }

  formatCnpj(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, '$1/$2')
      .replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  }

  formatCpf(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value
      .replace(/\D/g, '')
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2')
      .slice(0, 14);
  }

  formatCep(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  }

  formatTelefone(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
      .slice(0, 15);
  }

  formatNovoContatoTelefone(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
      .slice(0, 15);
  }

  getSetorLabel(setor: SetorContato): string {
    const labels: Record<SetorContato, string> = {
      compras: 'Compras',
      financeiro: 'Financeiro',
      tecnico: 'Técnico',
    };
    return labels[setor];
  }

  descartar() {
    this.confirmationService.confirm({
      message: 'Deseja realmente descartar o cadastro? Todos os dados serão perdidos.',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, descartar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.router.navigate(['/clientes']);
      },
    });
  }

  salvar() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos obrigatórios.',
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Cliente cadastrado com sucesso!',
    });

    setTimeout(() => {
      this.router.navigate(['/clientes']);
    }, 1500);
  }
}
