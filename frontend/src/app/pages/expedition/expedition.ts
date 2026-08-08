import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BaseChartDirective } from 'ng2-charts';

import {
  ChartConfiguration,
  ChartData
} from 'chart.js';
import { FleetDataService } from '../../core/services/fleet-data.service';

interface Camion {

  plate: string;

  product: string;

  chauffeur: string;

  destination: string;

  quai: string;

  temps: number;

  progress: number;

  status: string;

  color: 'ok' | 'warning' | 'danger';

}

interface Alert {

  truck: string;

  reason: string;

}

@Component({

  selector: 'app-expedition',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    BaseChartDirective

  ],

  templateUrl: './expedition.html',

  styleUrl: './expedition.css'

})

export class ExpeditionComponent {
  private readonly fleet = inject(FleetDataService);

  recherche = '';

  camionJustification = '';

  causeJustification = '';

  messageConfirmation = signal('');
  trucks = signal<Camion[]>([]);
  alerts = signal<Alert[]>([]);
  docks=[

    {

      nom:'Quai 1',

      pct:80,

      couleur:'green'

    },

    {

      nom:'Quai 2',

      pct:45,

      couleur:'blue'

    },

    {

      nom:'Quai 3',

      pct:95,

      couleur:'orange'

    }

  ];

  constructor() {

    effect(() => {

      this.fleet.trucks();
      this.fleet.alerts();
      this.syncFromFleet();

    });

  }

  private syncFromFleet(): void {

    this.trucks.set(

      this.fleet.trucks().map((truck) => ({

        plate: truck.id,

        product: truck.product,

        chauffeur: truck.driver,

        destination: truck.destination,

        quai: truck.quay,

        temps: truck.time,

        progress: truck.progress,

        status: truck.status === 'green' ? 'En cours' : truck.status === 'orange' ? 'Retard' : 'Critique',

        color: truck.color

      }))

    );

    this.alerts.set(

      this.fleet.alerts().map((alert) => ({

        truck: alert.immatriculation,

        reason: `${alert.etape} - ${alert.service}`

      }))

    );

  }
  camionsFiltres = computed(() => {

    const q=this.recherche.toLowerCase();

    return this.trucks().filter(t =>

      t.plate.toLowerCase().includes(q)

      ||

      t.product.toLowerCase().includes(q)

      ||

      t.destination.toLowerCase().includes(q)

      ||

      t.chauffeur.toLowerCase().includes(q)

    );

  });
  kpis=computed(()=>{

    const list=this.trucks();

    return{

      total:list.length,

      enChargement:list.filter(t=>t.progress<100).length,

      tempsMoyen:

        Math.round(

          list.reduce((s,t)=>s+t.temps,0)

          /list.length

        ),

      retards:

      list.filter(t=>t.color!='ok').length

    };

  });
  saveJustification(){

    if(

      this.camionJustification==''

      ||

      this.causeJustification==''

    ){

      return;

    }

    const created = this.fleet.updateJustification(this.camionJustification.trim(), this.causeJustification.trim());

    if (!created) {

      this.messageConfirmation.set('Camion introuvable.');

      return;

    }

    this.syncFromFleet();

    this.messageConfirmation.set(

      "Justification enregistrée."

    );

    this.camionJustification='';

    this.causeJustification='';

    setTimeout(()=>{

      this.messageConfirmation.set('');

    },3000);

  }
  chartData:ChartData<'line'>={

    labels:[

      '8h',

      '9h',

      '10h',

      '11h',

      '12h',

      '13h',

      '14h',

      '15h'

    ],

    datasets:[

      {

        label:'Temps moyen',

        data:[

          15,

          18,

          20,

          17,

          24,

          19,

          16,

          21

        ],

        borderColor:'#003B8E',

        backgroundColor:'rgba(0,59,142,.15)',

        fill:true,

        tension:.4

      }

    ]

  };

  chartOptions:ChartConfiguration<'line'>['options']={

    responsive:true,

    maintainAspectRatio:false,

    plugins:{

      legend:{

        display:false

      }

    },

    scales:{

      y:{

        beginAtZero:true

      }

    }

  };
  refresh(){

    this.fleet.refreshTrucks();

    this.syncFromFleet();

  }

  openAlert(alert: Alert): void {

    this.camionJustification = alert.truck;

    this.causeJustification = alert.reason;

  }

}
