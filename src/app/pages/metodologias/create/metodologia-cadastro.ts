import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetodologiaCadastroService } from '../services/metodologia-cadastro.service';

@Component({
  selector: 'app-metodologia-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './metodologia-cadastro.html',
})
export class MetodologiaCadastro implements OnInit {
  formMetodologia!: FormGroup;

  historicoModelos = [
    { title: 'Template Padrão', subtitle: 'Criado em 18/04/2026', status: 'Base' },
    { title: 'Revisão QC', subtitle: 'Atualizado em 05/05/2026', status: 'Atualizado' },
    { title: 'Versão Final', subtitle: 'Publicado em 12/05/2026', status: 'Revisão' },
  ];

  setores = [
    { label: 'Química', value: 'quimica' },
    { label: 'Microbiologia', value: 'microbiologia' },
    { label: 'Ambiental', value: 'ambiental' },
    { label: 'Controle de Qualidade', value: 'qualidade' }
  ];

  criticidades = [
    { label: 'Baixa', value: 'baixa' },
    { label: 'Média', value: 'media' },
    { label: 'Alta', value: 'alta' }
  ];

  constructor(private fb: FormBuilder, private service: MetodologiaCadastroService) {}

  ngOnInit() {
    this.formMetodologia = this.fb.group({
      nome: ['', Validators.required],
      norma: ['', Validators.required],
      tempo: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      setor: ['', Validators.required],
      criticidade: ['media', Validators.required],
      equipamentos: this.fb.array([this.createEquipamentoGroup()]),
      reagentes: this.fb.array([this.createReagenteGroup()])
    });
  }

  get equipamentos(): FormArray {
    return this.formMetodologia.get('equipamentos') as FormArray;
  }

  get reagentes(): FormArray {
    return this.formMetodologia.get('reagentes') as FormArray;
  }

  createEquipamentoGroup(): FormGroup {
    return this.fb.group({
      nome: ['', Validators.required],
      quantidade: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  createReagenteGroup(): FormGroup {
    return this.fb.group({
      nome: ['', Validators.required],
      quantidade: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  adicionarEquipamento() {
    this.equipamentos.push(this.createEquipamentoGroup());
  }

  removerEquipamento(index: number) {
    if (this.equipamentos.length > 1) {
      this.equipamentos.removeAt(index);
    }
  }

  adicionarReagente() {
    this.reagentes.push(this.createReagenteGroup());
  }

  removerReagente(index: number) {
    if (this.reagentes.length > 1) {
      this.reagentes.removeAt(index);
    }
  }

  setCriticidade(value: string) {
    this.formMetodologia.get('criticidade')?.setValue(value);
  }

  async salvar() {
    if (this.formMetodologia.invalid) {
      this.formMetodologia.markAllAsTouched();
      return;
    }

    await this.service.save(this.formMetodologia);
    alert('Metodologia de Análise salva com sucesso.');
  }

  descartar() {
    this.formMetodologia.reset({
      nome: '',
      norma: '',
      tempo: '',
      setor: '',
      criticidade: 'media'
    });

    while (this.equipamentos.length > 0) {
      this.equipamentos.removeAt(0);
    }
    this.equipamentos.push(this.createEquipamentoGroup());

    while (this.reagentes.length > 0) {
      this.reagentes.removeAt(0);
    }
    this.reagentes.push(this.createReagenteGroup());
  }
}
