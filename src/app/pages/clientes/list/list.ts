import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { AutoFocusModule } from 'primeng/autofocus';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';
import { TextareaModule } from 'primeng/textarea';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ClienteResponseModel } from '@/models/cliente.model';
import { CommonModule } from '@angular/common';
import { StepperModule } from 'primeng/stepper';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    TableModule,
    AutoFocusModule,
    DialogModule,
    InputMaskModule,
    DatePickerModule,
    TextareaModule,
    ReactiveFormsModule,
    CommonModule,
    StepperModule
  ],
  templateUrl: './list.html',
})
export class List implements OnInit {

  pesquisa: string = "";
  formCliente!: FormGroup;
  visible = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formCliente = this.fb.group({
      razaoSocial: [''],
      cnpj: [''],

      emailPrincipal: [''],
      emailFaturamento: [''],
      emailRelatorio: [''],

      emails: this.fb.array([]),

      enderecoPrincipal: [''],
      enderecoColeta: ['']
    });
  }

  get emails(): FormArray<FormGroup> {
    return this.formCliente.get('emails') as FormArray<FormGroup>;
  }

  adicionarEmail() {
    this.emails.push(
      this.fb.group({
        email: [''],
        tipo: ['']
      })
    );
  }

  removerEmail(index: number) {
    this.emails.removeAt(index);
  }

  tiposEmail = [
    { label: 'Financeiro', value: 'financeiro' },
    { label: 'Comercial', value: 'comercial' },
    { label: 'Suporte', value: 'suporte' }
  ];


  clientes: ClienteResponseModel[] = [
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      logo: 'https://picsum.photos/id/1011/80/80',
      nome_empresa_nome_pf: 'Tech Solutions Ltda',
      cnpj_cpf: '12.345.678/0001-90',
      contratos_ativos: 5,
      contato_principal: 'ana.silva@techsolutions.com'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      logo: 'https://picsum.photos/id/1012/80/80',
      nome_empresa_nome_pf: 'Inova Consultoria',
      cnpj_cpf: '98.765.432/0001-10',
      contratos_ativos: 3,
      contato_principal: 'joao.pereira@inovac.com'
    },
    {
      id: '6fa459ea-ee8a-3ca4-894e-db77e160355e',
      logo: 'https://picsum.photos/id/1013/80/80',
      nome_empresa_nome_pf: 'Alpha Engenharia',
      cnpj_cpf: '23.456.789/0001-20',
      contratos_ativos: 8,
      contato_principal: 'carla.melo@alphaeng.com'
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      logo: 'https://picsum.photos/id/1015/80/80',
      nome_empresa_nome_pf: 'Green Energy S.A.',
      cnpj_cpf: '34.567.890/0001-30',
      contratos_ativos: 2,
      contato_principal: 'marcos.rodrigues@greenenergy.com'
    },
    {
      id: '9c858901-8a57-4791-81fe-4c455b099bc9',
      logo: 'https://picsum.photos/id/1016/80/80',
      nome_empresa_nome_pf: 'BlueTech Serviços',
      cnpj_cpf: '45.678.901/0001-40',
      contratos_ativos: 6,
      contato_principal: 'lucia.santos@bluetech.com'
    },
    {
      id: '16fd2706-8baf-433b-82eb-8c7fada847da',
      logo: '',
      nome_empresa_nome_pf: 'Carlos Eduardo',
      cnpj_cpf: '123.456.789-00',
      contratos_ativos: 1,
      contato_principal: 'carlos.eduardo@email.com'
    },
    {
      id: '7d444840-9dc0-11d1-b245-5ffdce74fad2',
      logo: '',
      nome_empresa_nome_pf: 'Maria Oliveira',
      cnpj_cpf: '987.654.321-11',
      contratos_ativos: 4,
      contato_principal: 'maria.oliveira@email.com'
    }
  ];

  cadastrarCliente() {
    this.visible = true;
  }

}