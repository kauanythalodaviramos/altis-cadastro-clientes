import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/cliente-lista/cliente-lista').then(m => m.ClienteLista)
  },
  {
    path: 'clientes/novo',
    loadComponent: () => import('./pages/cliente-form/cliente-form').then(m => m.ClienteForm)
  },
  {
    path: 'clientes/:id/editar',
    loadComponent: () => import('./pages/cliente-form/cliente-form').then(m => m.ClienteForm)
  },
  { path: '**', redirectTo: 'clientes' }
];
