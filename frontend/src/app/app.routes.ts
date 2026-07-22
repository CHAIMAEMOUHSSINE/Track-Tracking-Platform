import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { DashboardHomeComponent } from './pages/dashboard/home/dashboard-home';
import { CartographyComponent } from './pages/cartography/cartography';
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
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
