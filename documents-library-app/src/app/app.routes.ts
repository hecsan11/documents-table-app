import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  // Lazy loading of standalone components
  {
    path: 'home',
    loadComponent: () => import('./components/table/table.component').then((m) => m.TableComponent)
  }
  
];

