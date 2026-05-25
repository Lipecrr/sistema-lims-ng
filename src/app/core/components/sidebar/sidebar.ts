import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  navItems = [
    { label: 'Dashboard', icon: 'layout-grid', route: '/dashboard' },
    { label: 'Comercial', icon: 'briefcase', route: '/comercial' },
    { label: 'Ordem de Serviço', icon: 'clipboard-list', route: '/ordens' },
    { label: 'Amostras', icon: 'beaker', route: '/amostras' },
    { label: 'Recebimento', icon: 'package-plus', route: '/recebimento' },
    { label: 'Execução Técnica', icon: 'microscope', route: '/execucao' },
    { label: 'Qualidade e Laudos', icon: 'shield-check', route: '/qualidade' },
    { label: 'Relatórios', icon: 'bar-chart-3', route: '/relatorios' }
  ];

  cadastro = [
    { label: 'Colaboradores', route: '/colaboradores' },
    { label: 'Clientes', route: '/clientes' },
    { label: 'Metodologias', route: '/metodologias' },
    { label: 'Tipos de Amostras', route: '/tipos-amostras' },
  ];

  user = {
    name: 'Usuário',
    role: 'Administrador',
    avatarUrl: null
  };
}
