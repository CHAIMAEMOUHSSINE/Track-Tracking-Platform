import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expedition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expedition.html',
  styleUrl: './expedition.css'
})
export class ExpeditionComponent {
  alerts = [
    { truck: 'TRK-018', reason: 'Retard de chargement', status: 'Justification requise', action: 'Suivre le chargement' },
    { truck: 'TRK-033', reason: 'Validation de sortie', status: 'En attente', action: 'Justifier le dépassement' }
  ];
}
