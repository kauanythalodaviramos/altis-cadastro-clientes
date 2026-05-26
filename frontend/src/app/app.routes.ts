import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },

  // publicas
  {
    path: 'login',
    loadComponent: () => import('./auth/pages/login/login').then(m => m.Login)
  },
  {
    path: 'registrar',
    loadComponent: () => import('./auth/pages/registrar/registrar').then(m => m.Registrar)
  },

  // protegidas
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadComponent: () => import('./clientes/cliente-lista/cliente-lista').then(m => m.ClienteLista)
  },
  {
    path: 'clientes/novo',
    canActivate: [authGuard],
    loadComponent: () => import('./clientes/cliente-form/cliente-form').then(m => m.ClienteForm)
  },
  {
    path: 'clientes/:id/editar',
    canActivate: [authGuard],
    loadComponent: () => import('./clientes/cliente-form/cliente-form').then(m => m.ClienteForm)
  },

  {
    path: 'configuracoes',
    canActivate: [authGuard],
    loadComponent: () => import('./configuracoes/configuracoes').then(m => m.Configuracoes),
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
      {
        path: 'perfil',
        loadComponent: () => import('./configuracoes/perfil/perfil').then(m => m.Perfil)
      }
    ]
  },

  { path: '**', redirectTo: 'clientes' }
];
