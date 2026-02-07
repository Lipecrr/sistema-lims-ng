import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: 'colaboradores', loadComponent: () => import('./pages/colaboradores/list/list.js').then((m) => m.List)},
    {path: 'clientes', loadComponent: () => import('./pages/clientes/list/list.js').then((m) => m.List)},
];
