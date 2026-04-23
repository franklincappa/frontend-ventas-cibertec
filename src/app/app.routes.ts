import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'distritos',
    loadComponent: () => import('./features/distritos/distritos.component')
      .then(m => m.DistritosComponent)
  },
  {
    path: 'cargos',
    loadComponent: () => import('./features/cargos/cargos.component')
      .then(m => m.CargosComponent)
  },
  {
    path: 'empleados',
    loadComponent: () => import('./features/empleados/empleados.component')
      .then(m => m.EmpleadosComponent)
  },
  {
    path: 'clientes',
    loadComponent: () => import('./features/clientes/clientes.component')
      .then(m => m.ClientesComponent)
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categorias/categorias.component')
      .then(m => m.CategoriasComponent)
  },
  {
    path: 'productos',
    loadComponent: () => import('./features/productos/productos.component')
      .then(m => m.ProductosComponent)
  },
  {
    path: 'boletas',
    loadComponent: () => import('./features/boletas/boletas.component')
      .then(m => m.BoletasComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
