import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FleetDataService } from '../../core/services/fleet-data.service';

interface Equipment {
  id: number;
  name: string;
  zone: string;
  type: string;
  technician: string;
  lastMaintenance: string;
  status: string;
  statusClass: string;
}

interface Incident {
  equipment: string;
  problem: string;
  priority: string;
}

interface Technician {
  name: string;
  speciality: string;
  available: boolean;
}

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.css'
})
export class MaintenanceComponent {

  private readonly fleet = inject(FleetDataService);

  search = '';

  equipments: Equipment[] = [

    {
      id: 1,
      name: 'Convoyeur C-01',
      zone: 'Atelier',
      type: 'Convoyeur',
      technician: 'Ahmed',
      lastMaintenance: '18/07/2026',
      status: 'En service',
      statusClass: 'success'
    },

    {
      id: 2,
      name: 'Chargeur L-02',
      zone: 'Quai 2',
      type: 'Chargeur',
      technician: 'Youssef',
      lastMaintenance: '15/07/2026',
      status: 'Maintenance',
      statusClass: 'warning'
    },

    {
      id: 3,
      name: 'Balance B-01',
      zone: 'Sortie',
      type: 'Balance',
      technician: 'Hamza',
      lastMaintenance: '10/07/2026',
      status: 'Panne',
      statusClass: 'danger'
    },

    {
      id: 4,
      name: 'Ensacheuse E-01',
      zone: 'Production',
      type: 'Ensacheuse',
      technician: 'Rachid',
      lastMaintenance: '20/07/2026',
      status: 'En service',
      statusClass: 'success'
    }

  ];

  incidents: Incident[] = [

    {
      equipment: 'Balance B-01',
      problem: 'Capteur défectueux',
      priority: 'Critique'
    },

    {
      equipment: 'Chargeur L-02',
      problem: 'Vidange hydraulique',
      priority: 'Normale'
    }

  ];

  technicians: Technician[] = [

    {
      name: 'Ahmed',
      speciality: 'Électricité',
      available: true
    },

    {
      name: 'Youssef',
      speciality: 'Hydraulique',
      available: false
    },

    {
      name: 'Hamza',
      speciality: 'Mécanique',
      available: true
    },

    {
      name: 'Rachid',
      speciality: 'Automation',
      available: true
    }

  ];

  intervention = {

    equipment: '',

    type: '',

    priority: '',

    description: ''

  };

  message = '';

  get filteredEquipments() {

    if (!this.search.trim()) {

      return this.equipments;

    }

    return this.equipments.filter(e =>

      e.name.toLowerCase().includes(this.search.toLowerCase())

      ||

      e.zone.toLowerCase().includes(this.search.toLowerCase())

      ||

      e.type.toLowerCase().includes(this.search.toLowerCase())

    );

  }

  get totalEquipments() {

    return this.equipments.length;

  }

  get activeEquipments() {

    return this.equipments.filter(e => e.status == 'En service').length;

  }

  get maintenanceEquipments() {

    return this.equipments.filter(e => e.status == 'Maintenance').length;

  }

  get breakdownEquipments() {

    return this.equipments.filter(e => e.status == 'Panne').length;

  }

  createIntervention() {

    if (

      !this.intervention.equipment ||

      !this.intervention.type ||

      !this.intervention.priority ||

      !this.intervention.description

    ) {

      alert('Veuillez remplir tous les champs.');

      return;

    }

    this.message = "Intervention enregistrée avec succès.";

    this.fleet.publishActivity(
      'Maintenance',
      `${this.intervention.equipment} - ${this.intervention.type} - ${this.intervention.priority}`
    );

    setTimeout(() => {

      this.message = '';

    },3000);

    this.intervention = {

      equipment:'',

      type:'',

      priority:'',

      description:''

    };

  }

  refresh(){

    this.fleet.publishActivity('Maintenance', 'Actualisation de la page maintenance');

  }

}
