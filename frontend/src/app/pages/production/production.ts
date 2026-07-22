import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-production',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './production.html',
  styleUrl: './production.css'
})
export class ProductionComponent {
  alerts = [
    { truck: 'TRK-011', reason: 'Stock indisponible', status: 'En attente', action: 'Ajouter une justification' },
    { truck: 'TRK-019', reason: 'Palette manquante', status: 'En traitement', action: 'Modifier le statut' }
  ];
}
