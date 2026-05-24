import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'colaboradores', loadComponent: () => import('./pages/colaboradores/list/list.js').then((m) => m.List) },
    { path: 'clientes', loadComponent: () => import('./pages/clientes/list/list.js').then((m) => m.List) },
    { path: 'metodologias', loadComponent: () => import('./pages/metodologias/list/metodologias-list.js').then((m) => m.MetodologiasList) },
    { path: 'metodologias/novo', loadComponent: () => import('./pages/metodologias/create/metodologia-cadastro.js').then((m) => m.MetodologiaCadastro) }
];
