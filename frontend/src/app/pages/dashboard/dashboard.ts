import { Component } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NavbarComponent,
    SidebarComponent,
    RouterOutlet
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {}
