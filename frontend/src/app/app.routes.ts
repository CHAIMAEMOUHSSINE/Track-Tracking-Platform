import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { DashboardHomeComponent } from './pages/dashboard/home/dashboard-home';
import { CartographyComponent } from './pages/cartography/cartography';
import { ProductionComponent } from './pages/production/production';
import { MaintenanceComponent } from './pages/maintenance/maintenance';
import { ExpeditionComponent } from './pages/expedition/expedition';
export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: DashboardHomeComponent
      },
      {
        path: 'cartographie',
        component: CartographyComponent
      },
      {
        path: 'production',
        component: ProductionComponent
      },
      {
        path: 'maintenance',
        component: MaintenanceComponent
      },
      {
        path: 'expedition',
        component: ExpeditionComponent
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
