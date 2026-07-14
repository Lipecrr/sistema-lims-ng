import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ColaboradoresService } from 'src/services/colaboradores.service';

@Component({
  selector: 'app-colaborador-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './colaborador-cadastro.html',
})
export class ColaboradorCadastro implements OnInit {
  formColaborador!: FormGroup;
  abaAtiva = 'informacoes'; // 'informacoes', 'cargo', 'credenciais'
  
  permissoes = [
    { label: 'Leitura', value: 'leitura' },
    { label: 'Operacional', value: 'operacional' },
    { label: 'Gestão', value: 'gestao' },
    { label: 'Administrador', value: 'administrador' },
  ];
  fotoNome = 'Nenhum arquivo selecionado';
  fotoPreview: string | null = null;
  isDragging = false;

  id: string | null = null;
  modoVisualizacao = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  get tituloPagina(): string {
    if (this.modoVisualizacao) return 'Visualizar Colaborador';
    return this.id ? 'Editar Colaborador' : 'Novo Colaborador';
  }

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private colaboradoresService: ColaboradoresService
  ) {}

  ngOnInit() {
    this.formColaborador = this.fb.group({
      nomeCompleto: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      cargo: ['', Validators.required],
      departamento: ['', Validators.required],
      matricula: ['', Validators.required],
      permissao: ['', Validators.required],
      acessoLogin: ['', Validators.required],
      senhaTemporaria: [''],
      confirmarSenha: [''],
      enviarEmail: [true],
      forcarTrocaSenha: [true],
    }, { validators: this.validarSenhas });

    this.id = this.route.snapshot.paramMap.get('id');
    this.modoVisualizacao = this.route.snapshot.data['modo'] === 'visualizar';

    if (this.id) {
      this.colaboradoresService.obterPorId(this.id).subscribe({
        next: (item) => {
          this.formColaborador.patchValue({
            nomeCompleto: item.nome_completo,
            cpf: item.cpf,
            email: item.email,
            telefone: item.telefone,
            cargo: item.cargo,
            departamento: item.departamento,
            matricula: item.matricula,
            permissao: item.permissao,
            acessoLogin: item.acesso_login,
            enviarEmail: item.enviar_email,
            forcarTrocaSenha: item.forcar_troca_senha,
          });
          if (this.modoVisualizacao) {
            this.formColaborador.disable();
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o colaborador.' });
        },
      });
    }
  }

  irParaEdicao(): void {
    if (this.id) {
      this.router.navigate(['/colaboradores', this.id, 'editar']);
    }
  }

  get controle() {
    return this.formColaborador.controls;
  }

  trocarAba(aba: string) {
    this.abaAtiva = aba;
  }

  removerAcentos(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  gerarAcessoLogin(): void {
    const nomeCompleto = this.formColaborador.get('nomeCompleto')?.value;
    if (!nomeCompleto || nomeCompleto.trim() === '') {
      return;
    }

    // Remove acentos antes de processar
    const nomeSemAcentos = this.removerAcentos(nomeCompleto.trim()).toUpperCase();
    const partes = nomeSemAcentos.split(' ').filter((p: string) => p.length > 0);
    
    if (partes.length === 0) {
      return;
    }

    if (partes.length === 1) {
      // Se só tem um nome, usa as 3 primeiras letras
      const login = partes[0].substring(0, Math.min(3, partes[0].length));
      this.formColaborador.get('acessoLogin')?.setValue(login);
      return;
    }

    // Pega a primeira letra de todos os nomes exceto o último
    const iniciais = partes.slice(0, -1).map((p: string) => p.charAt(0)).join('');
    // Pega o último nome completo
    const ultimoNome = partes[partes.length - 1];
    
    const login = `${iniciais}.${ultimoNome}`;
    this.formColaborador.get('acessoLogin')?.setValue(login);
  }

  validarSenhas(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('senhaTemporaria')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;

    if (senha && confirmarSenha && senha !== confirmarSenha) {
      return { senhasNaoConferem: true };
    }

    return null;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.processarArquivo(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processarArquivo(files[0]);
    }
  }

  processarArquivo(file: File | undefined) {
    if (!file) {
      this.fotoNome = 'Nenhum arquivo selecionado';
      this.fotoPreview = null;
      return;
    }

    // Validações
    if (!file.type.startsWith('image/')) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, selecione apenas arquivos de imagem.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'A imagem deve ter no máximo 5MB.' });
      return;
    }

    this.fotoNome = file.name;

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.fotoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removerFoto() {
    this.fotoPreview = null;
    this.fotoNome = 'Nenhum arquivo selecionado';
  }

  async salvar() {
    if (!this.formColaborador.get('acessoLogin')?.value) {
      this.gerarAcessoLogin();
    }

    if (this.formColaborador.invalid) {
      this.formColaborador.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Preencha todos os campos obrigatórios.'
      });
      return;
    }

    const valores = this.formColaborador.getRawValue();

    try {
      if (this.id) {
        await this.colaboradoresService.atualizar(this.id, {
          nome_completo: valores.nomeCompleto,
          cpf: valores.cpf,
          email: valores.email,
          telefone: valores.telefone,
          cargo: valores.cargo,
          departamento: valores.departamento,
          matricula: valores.matricula,
          permissao: valores.permissao,
          acesso_login: valores.acessoLogin,
          enviar_email: valores.enviarEmail,
          forcar_troca_senha: valores.forcarTrocaSenha,
        });
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Colaborador atualizado com sucesso.' });
      } else {
        await this.colaboradoresService.addColaborador({
          nome_completo: valores.nomeCompleto,
          cpf: valores.cpf,
          email: valores.email,
          telefone: valores.telefone,
          cargo: valores.cargo,
          departamento: valores.departamento,
          matricula: valores.matricula,
          permissao: valores.permissao,
          acesso_login: valores.acessoLogin,
          senha_temporaria: valores.senhaTemporaria || null,
          enviar_email: valores.enviarEmail,
          forcar_troca_senha: valores.forcarTrocaSenha,
        });
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Colaborador salvo com sucesso.' });
      }

      setTimeout(() => this.router.navigate(['/colaboradores']), 1200);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível salvar o colaborador. Tente novamente.'
      });
    }
  }

  descartar() {
    this.confirmationService.confirm({
      message: 'Deseja realmente descartar as alterações?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.formColaborador.reset({ enviarEmail: true, forcarTrocaSenha: true });
        this.fotoNome = 'Nenhum arquivo selecionado';
        this.fotoPreview = null;
        this.abaAtiva = 'informacoes';
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Alterações descartadas.'
        });
      }
    });
  }
}
