import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TiposAmostrasService } from '@/services/tipos-amostras.service';

@Component({
  selector: 'app-tipo-amostra-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tipo-amostra-cadastro.html',
})
export class TipoAmostraCadastro implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(TiposAmostrasService);

  formAmostra!: FormGroup;
  statusOptions = ['Ativo', 'Inativo'];
  motivoOptions = ['Rotina', 'Controle de Qualidade', 'Prioritária (Rush)'] as const;

  ngOnInit(): void {
    this.formAmostra = this.fb.group({
      tipo: ['', Validators.required],
      motivo: ['Rotina', Validators.required],
      publicacaoManual: [false],
      obrigarDataColeta: [false],
      status: ['Ativo', Validators.required],
      observacoes: [''],
    });
  }

  get controle() {
    return this.formAmostra.controls;
  }

  cancelar(): void {
    this.router.navigate(['/tipos-amostras']);
  }

  salvar(): void {
    if (this.formAmostra.invalid) {
      this.formAmostra.markAllAsTouched();
      return;
    }

    this.service.addTipoAmostra({
      id: Date.now().toString(),
      ...this.formAmostra.getRawValue(),
    });

    alert('Tipo de amostra cadastrado com sucesso.');
    this.router.navigate(['/tipos-amostras']);
  }
}
