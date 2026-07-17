import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.js').then((m) => m.Dashboard) },

    { path: 'colaboradores', loadComponent: () => import('./pages/colaboradores/list/list.js').then((m) => m.List) },
    { path: 'colaboradores/novo', loadComponent: () => import('./pages/colaboradores/create/colaborador-cadastro.js').then((m) => m.ColaboradorCadastro) },
    { path: 'colaboradores/:id/editar', loadComponent: () => import('./pages/colaboradores/create/colaborador-cadastro.js').then((m) => m.ColaboradorCadastro), data: { modo: 'editar' } },
    { path: 'colaboradores/:id', loadComponent: () => import('./pages/colaboradores/create/colaborador-cadastro.js').then((m) => m.ColaboradorCadastro), data: { modo: 'visualizar' } },

    { path: 'clientes', loadComponent: () => import('./pages/clientes/list/list.js').then((m) => m.List) },
    { path: 'clientes/novo', loadComponent: () => import('./pages/clientes/create/cliente-cadastro.js').then((m) => m.ClienteCadastro) },
    { path: 'clientes/:id/editar', loadComponent: () => import('./pages/clientes/create/cliente-cadastro.js').then((m) => m.ClienteCadastro), data: { modo: 'editar' } },
    { path: 'clientes/:id', loadComponent: () => import('./pages/clientes/create/cliente-cadastro.js').then((m) => m.ClienteCadastro), data: { modo: 'visualizar' } },

    { path: 'metodologias', loadComponent: () => import('./pages/metodologias/list/metodologias-list.js').then((m) => m.MetodologiasList) },
    { path: 'metodologias/novo', loadComponent: () => import('./pages/metodologias/create/metodologia-cadastro.js').then((m) => m.MetodologiaCadastro) },
    { path: 'metodologias/:id/editar', loadComponent: () => import('./pages/metodologias/create/metodologia-cadastro.js').then((m) => m.MetodologiaCadastro), data: { modo: 'editar' } },
    { path: 'metodologias/:id', loadComponent: () => import('./pages/metodologias/create/metodologia-cadastro.js').then((m) => m.MetodologiaCadastro), data: { modo: 'visualizar' } },

    { path: 'tipos-amostras', loadComponent: () => import('./pages/tipos-amostras/list/list.js').then((m) => m.List) },
    { path: 'tipos-amostras/novo', loadComponent: () => import('./pages/tipos-amostras/create/tipo-amostra-cadastro.js').then((m) => m.TipoAmostraCadastro) },
    { path: 'tipos-amostras/:id/editar', loadComponent: () => import('./pages/tipos-amostras/create/tipo-amostra-cadastro.js').then((m) => m.TipoAmostraCadastro), data: { modo: 'editar' } },
    { path: 'tipos-amostras/:id', loadComponent: () => import('./pages/tipos-amostras/create/tipo-amostra-cadastro.js').then((m) => m.TipoAmostraCadastro), data: { modo: 'visualizar' } },

    { path: 'tipos-atividades', loadComponent: () => import('./pages/tipos-atividades/list/list.js').then((m) => m.List) },
    { path: 'tipos-atividades/novo', loadComponent: () => import('./pages/tipos-atividades/create/tipo-atividade-cadastro.js').then((m) => m.TipoAtividadeCadastro) },
    { path: 'tipos-atividades/:id/editar', loadComponent: () => import('./pages/tipos-atividades/create/tipo-atividade-cadastro.js').then((m) => m.TipoAtividadeCadastro), data: { modo: 'editar' } },
    { path: 'tipos-atividades/:id', loadComponent: () => import('./pages/tipos-atividades/create/tipo-atividade-cadastro.js').then((m) => m.TipoAtividadeCadastro), data: { modo: 'visualizar' } },

    { path: 'itens-preco', loadComponent: () => import('./pages/itens-preco/list/list.js').then((m) => m.ItensPrecoList) },
    { path: 'itens-preco/novo', loadComponent: () => import('./pages/itens-preco/create/item-preco-cadastro.js').then((m) => m.ItemPrecoCadastro) },
    { path: 'itens-preco/:id/editar', loadComponent: () => import('./pages/itens-preco/create/item-preco-cadastro.js').then((m) => m.ItemPrecoCadastro), data: { modo: 'editar' } },
    { path: 'itens-preco/:id', loadComponent: () => import('./pages/itens-preco/create/item-preco-cadastro.js').then((m) => m.ItemPrecoCadastro), data: { modo: 'visualizar' } },

    { path: 'informacoes', loadComponent: () => import('./pages/informacoes/list/list.js').then((m) => m.List) },
    { path: 'informacoes/novo', loadComponent: () => import('./pages/informacoes/create/informacao-cadastro.js').then((m) => m.InformacaoCadastro) },
    { path: 'informacoes/:id/editar', loadComponent: () => import('./pages/informacoes/create/informacao-cadastro.js').then((m) => m.InformacaoCadastro), data: { modo: 'editar' } },
    { path: 'informacoes/:id', loadComponent: () => import('./pages/informacoes/create/informacao-cadastro.js').then((m) => m.InformacaoCadastro), data: { modo: 'visualizar' } },

    { path: 'comercial', loadComponent: () => import('./pages/comercial/list/list.js').then((m) => m.List) },
    { path: 'comercial/nova', loadComponent: () => import('./pages/comercial/create/proposta-cadastro.js').then((m) => m.PropostaCadastro) },
    { path: 'comercial/:id/editar', loadComponent: () => import('./pages/comercial/create/proposta-cadastro.js').then((m) => m.PropostaCadastro), data: { modo: 'editar' } },
    { path: 'comercial/:id', loadComponent: () => import('./pages/comercial/create/proposta-cadastro.js').then((m) => m.PropostaCadastro), data: { modo: 'visualizar' } },
];
