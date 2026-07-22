import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BaseChartDirective } from 'ng2-charts';

import {
  ChartConfiguration,
  ChartData
} from 'chart.js';

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

  recherche = '';

  camionJustification = '';

  causeJustification = '';

  messageConfirmation = signal('');
  trucks = signal<Camion[]>([

    {

      plate:'CAM-001',

      product:'CPJ 45',

      chauffeur:'Ahmed Benali',

      destination:'Meknès',

      quai:'Quai 1',

      temps:15,

      progress:82,

      status:'En cours',

      color:'ok'

    },

    {

      plate:'CAM-014',

      product:'CPA 55',

      chauffeur:'Youssef',

      destination:'Fès',

      quai:'Quai 2',

      temps:22,

      progress:55,

      status:'Retard',

      color:'warning'

    },

    {

      plate:'CAM-027',

      product:'CPJ 35',

      chauffeur:'Hamza',

      destination:'Rabat',

      quai:'Quai 3',

      temps:34,

      progress:97,

      status:'Critique',

      color:'danger'

    },

    {

      plate:'CAM-033',

      product:'CPJ 45',

      chauffeur:'Mustapha',

      destination:'Khénifra',

      quai:'Quai 1',

      temps:8,

      progress:28,

      status:'En cours',

      color:'ok'

    }

  ]);
  alerts = signal<Alert[]>([

    {

      truck:'CAM-014',

      reason:'Rupture de stock'

    },

    {

      truck:'CAM-027',

      reason:'Temps de chargement dépassé'

    }

  ]);
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

    console.log("Actualisation...");

  }

}
