// import { Component, inject } from '@angular/core';
// import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { AutoFocusModule } from 'primeng/autofocus';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';
import { TextareaModule } from 'primeng/textarea';
import { ResgistroStatusTag } from '@/core/components/registro-status-tag/registro-status-tag';
import { ColaboradorResponseModel } from '@/models/colaborador.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { StepperModule } from 'primeng/stepper';

@Component({
  selector: 'app-list',
  imports: [
    ButtonModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    TableModule,
    ResgistroStatusTag,
    AutoFocusModule,
    DialogModule,
    InputMaskModule,
    DatePickerModule,
    TextareaModule,
    ReactiveFormsModule,
    StepperModule],
  templateUrl: './list.html',
})
export class List {
  visible = true
  filtrosDepartamento = [
  "Departamento",
  "Laboratório",
  "Coleta",
  "Administrativo",
  "Operações",
  "Diretoria"
];
  filtroSelecionadoDepartamento: string = "Departamento";

  filtrosStatus = [
  "Status",
  "Ativo",
  "Férias",
  "Afastado" ];
  filtroSelecionadoStatus: string = "Status";

  pesquisa: string = "";

colaboradores: ColaboradorResponseModel[] = [
    {
      "id": "1",
      "nome": "Ana Paula Ribeiro",
      "cargo": "Analista de Qualidade da Água",
      "departamento": "Laboratório",
      "status": "Ativo"
    },
    {
      "id": "2",
      "nome": "Carlos Eduardo Santos",
      "cargo": "Técnico de Coleta",
      "departamento": "Coleta",
      "status": "Ativo"
    },
    {
      "id": "3",
      "nome": "Mariana Lopes Ferreira",
      "cargo": "Bióloga",
      "departamento": "Laboratório",
      "status": "Ativo"
    },
    {
      "id": "4",
      "nome": "João Victor Almeida",
      "cargo": "Técnico de Laboratório",
      "departamento": "Laboratório",
      "status": "Férias"
    },
    {
      "id": "5",
      "nome": "Fernanda Costa Lima",
      "cargo": "Coordenadora de Laboratório",
      "departamento": "Laboratório",
      "status": "Ativo"
    },
    {
      "id": "6",
      "nome": "Ricardo Nogueira",
      "cargo": "Motorista de Coleta",
      "departamento": "Coleta",
      "status": "Ativo"
    },
    {
      "id": "7",
      "nome": "Juliana Martins Rocha",
      "cargo": "Analista Químico",
      "departamento": "Laboratório",
      "status": "Ativo"
    },
    {
      "id": "8",
      "nome": "Paulo Henrique Silva",
      "cargo": "Auxiliar de Coleta",
      "departamento": "Coleta",
      "status": "Ativo"
    },
    {
      "id": "9",
      "nome": "Camila Azevedo",
      "cargo": "Engenheira Ambiental",
      "departamento": "Laboratório",
      "status": "Ativo"
    },
    {
      "id": "10",
      "nome": "Lucas Teixeira",
      "cargo": "Estagiário de Laboratório",
      "departamento": "Laboratório",
      "status": "Ativo"
    },
    {
      "id": "11",
      "nome": "Renata Pires",
      "cargo": "Assistente Administrativo",
      "departamento": "Administrativo",
      "status": "Ativo"
    },
    {
      "id": "12",
      "nome": "Marcos Vinícius Oliveira",
      "cargo": "Analista Financeiro",
      "departamento": "Administrativo",
      "status": "Ativo"
    },
    {
      "id": "13",
      "nome": "Daniela Farias",
      "cargo": "Supervisora Administrativa",
      "departamento": "Administrativo",
      "status": "Ativo"
    },
    {
      "id": "14",
      "nome": "Thiago Barros",
      "cargo": "Analista de Compras",
      "departamento": "Administrativo",
      "status": "Afastado"
    },
    {
      "id": "15",
      "nome": "Patrícia Gomes",
      "cargo": "Recepcionista",
      "departamento": "Administrativo",
      "status": "Ativo"
    },
    {
      "id": "16",
      "nome": "Eduardo Batista",
      "cargo": "Técnico de Manutenção de Equipamentos",
      "departamento": "Operações",
      "status": "Ativo"
    },
    {
      "id": "17",
      "nome": "Vanessa Correia",
      "cargo": "Analista de Documentação Técnica",
      "departamento": "Administrativo",
      "status": "Ativo"
    },
    {
      "id": "18",
      "nome": "Felipe Moura",
      "cargo": "Coordenador de Coletas",
      "departamento": "Coleta",
      "status": "Ativo"
    },
    {
      "id": "19",
      "nome": "Simone Rangel",
      "cargo": "Analista de Atendimento ao Cliente",
      "departamento": "Administrativo",
      "status": "Ativo"
    },
    {
      "id": "20",
      "nome": "André Luiz Moreira",
      "cargo": "Diretor Técnico",
      "departamento": "Diretoria",
      "status": "Ativo"
    },
    {
      "id": "21",
      "nome": "Beatriz Cunha",
      "cargo": "Analista de Controle de Qualidade",
      "departamento": "Laboratório",
      "status": "Ativo"
    },
    {
      "id": "22",
      "nome": "Guilherme Pacheco",
      "cargo": "Técnico de Amostragem",
      "departamento": "Coleta",
      "status": "Férias"
    },
    {
      "id": "23",
      "nome": "Natalia Souza",
      "cargo": "Analista de Recursos Humanos",
      "departamento": "Administrativo",
      "status": "Ativo"
    },
    {
      "id": "24",
      "nome": "Roberto Araujo",
      "cargo": "Almoxarife",
      "departamento": "Operações",
      "status": "Ativo"
    },
    {
      "id": "25",
      "nome": "Luciana Menezes",
      "cargo": "Gerente Administrativa",
      "departamento": "Diretoria",
      "status": "Ativo"
    },
    {
      "id": "26",
      "nome": "Lucas Martins",
      "cargo": "Estagiário Administrativo",
      "departamento": "Administrativo",
      "status": "Inativo"
    },
    {
      "id": "27",
      "nome": "Mariana Costa",
      "cargo": "Assistente de Coleta",
      "departamento": "Coleta",
      "status": "Inativo"
    },
    {
      "id": "28",
      "nome": "Thiago Lima",
      "cargo": "Analista de Laboratório",
      "departamento": "Laboratório",
      "status": "Inativo"
    },
    {
      "id": "29",
      "nome": "Patrícia Ramos",
      "cargo": "Auxiliar Administrativo",
      "departamento": "Administrativo",
      "status": "Inativo"
    },
    {
      "id": "30",
      "nome": "Felipe Alves",
      "cargo": "Motorista",
      "departamento": "Coleta",
      "status": "Inativo"
    }
]


somarTotalEquipe(): number {
  return this.colaboradores.filter(c => c.status !== 'Inativo').length;
}

somarAnalistasAtivos(): number {
  return this.colaboradores.filter(c => c.status === 'Ativo' && c.cargo.toLowerCase().includes('analista')).length;
}
}
