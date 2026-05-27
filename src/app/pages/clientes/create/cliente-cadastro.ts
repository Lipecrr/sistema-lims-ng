import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cliente-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cliente-cadastro.html',
})
export class ClienteCadastro implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  clienteForm!: FormGroup;

  segmentos = [
    { label: 'Farmacêutico', value: 'farmaceutico' },
    { label: 'Alimentos', value: 'alimentos' },
    { label: 'Químico', value: 'quimico' },
    { label: 'Ambiental', value: 'ambiental' },
    { label: 'Outros', value: 'outros' },
  ];

  estados = [
    { label: 'SP', value: 'SP' },
    { label: 'RJ', value: 'RJ' },
    { label: 'MG', value: 'MG' },
    { label: 'BA', value: 'BA' },
    { label: 'PR', value: 'PR' },
    { label: 'RS', value: 'RS' },
    { label: 'Outros', value: 'OUT' },
  ];

  gerentes = [
    { label: 'Ana Paula', value: 'ana-paula' },
    { label: 'Carlos Eduardo', value: 'carlos-eduardo' },
    { label: 'Mariana Costa', value: 'mariana-costa' },
    { label: 'João Victor', value: 'joao-victor' },
  ];

  condicoesPagamento = [
    { label: 'À vista', value: 'avista' },
    { label: '30 dias', value: '30-dias' },
    { label: '60 dias', value: '60-dias' },
    { label: '90 dias', value: '90-dias' },
  ];

  ngOnInit() {
    this.clienteForm = this.fb.group({
      razaoSocial: ['', Validators.required],
      nomeFantasia: ['', Validators.required],
      cnpj: ['', [Validators.required, Validators.pattern('^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')]],
      inscricaoEstadual: ['', Validators.required],
      segmento: ['', Validators.required],
      cep: ['', [Validators.required, Validators.pattern('^\d{5}-\d{3}$')]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      telefone: ['', [Validators.required, Validators.pattern('^\(\d{2}\) \d{4,5}-\d{4}$')]],
      emailFaturamento: ['', [Validators.required, Validators.email]],
      gerenteConta: ['', Validators.required],
      condicaoPagamento: ['', Validators.required],
      limiteCredito: ['', [Validators.required, Validators.pattern('^[0-9]+(\,[0-9]{2})?$')]],
      observacoes: [''],
    });
  }

  get controle() {
    return this.clienteForm.controls;
  }

  cancelar() {
    this.router.navigate(['/clientes']);
  }

  limparFormulario() {
    this.clienteForm.reset();
  }

  async finalizarCadastro() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    alert('Cliente cadastrado com sucesso.');
    this.router.navigate(['/clientes']);
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
    this.clienteForm.get('cnpj')?.setValue(input.value, { emitEvent: false });
  }

  formatCep(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
    this.clienteForm.get('cep')?.setValue(input.value, { emitEvent: false });
  }

  formatTelefone(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const formatted = digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/^(\(\d{2}\) \d{4,5})(\d)/, '$1-$2')
      .slice(0, 15);
    input.value = formatted;
    this.clienteForm.get('telefone')?.setValue(input.value, { emitEvent: false });
  }
}
