import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'colaboradores', loadComponent: () => import('./pages/colaboradores/list/list.js').then((m) => m.List) },
    { path: 'colaboradores/novo', loadComponent: () => import('./pages/colaboradores/create/colaborador-cadastro.js').then((m) => m.ColaboradorCadastro) },
    { path: 'clientes', loadComponent: () => import('./pages/clientes/list/list.js').then((m) => m.List) },
    { path: 'clientes/novo', loadComponent: () => import('./pages/clientes/create/cliente-cadastro.js').then((m) => m.ClienteCadastro) },
    { path: 'metodologias', loadComponent: () => import('./pages/metodologias/list/metodologias-list.js').then((m) => m.MetodologiasList) },
    { path: 'metodologias/novo', loadComponent: () => import('./pages/metodologias/create/metodologia-cadastro.js').then((m) => m.MetodologiaCadastro) }
];
