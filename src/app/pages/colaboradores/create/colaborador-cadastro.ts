import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-colaborador-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './colaborador-cadastro.html',
})
export class ColaboradorCadastro implements OnInit {
  formColaborador!: FormGroup;
  permissoes = [
    { label: 'Leitura', value: 'leitura' },
    { label: 'Operacional', value: 'operacional' },
    { label: 'Gestão', value: 'gestao' },
    { label: 'Administrador', value: 'administrador' },
  ];
  fotoNome = 'Nenhum arquivo selecionado';

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formColaborador = this.fb.group({
      nomeCompleto: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.pattern('^[0-9]{10,11}$')]],
      cargo: ['', Validators.required],
      departamento: ['', Validators.required],
      matricula: ['', Validators.required],
      permissao: ['', Validators.required],
      senhaTemporaria: [''],
      enviarEmail: [true],
    });
  }

  get controle() {
    return this.formColaborador.controls;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.fotoNome = file ? file.name : 'Nenhum arquivo selecionado';
  }

  async salvar() {
    if (this.formColaborador.invalid) {
      this.formColaborador.markAllAsTouched();
      return;
    }

    // TODO: substituir por integração real com a API quando disponível.
    alert('Colaborador salvo com sucesso.');
  }

  descartar() {
    this.formColaborador.reset({ enviarEmail: true });
    this.fotoNome = 'Nenhum arquivo selecionado';
  }
}
