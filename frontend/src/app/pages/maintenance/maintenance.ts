import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.css'
})
export class MaintenanceComponent {
  alerts = [
    { truck: 'TRK-004', reason: 'Panne mécanique', status: 'Intervention en cours', action: 'Indiquer la durée estimée' },
    { truck: 'TRK-020', reason: 'Dysfonctionnement capteur', status: 'Planifiée', action: 'Clôturer l’intervention' }
  ];
}
