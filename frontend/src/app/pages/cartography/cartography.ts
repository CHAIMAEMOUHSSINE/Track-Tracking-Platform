import {
  AfterViewInit,
  Component,
  OnDestroy
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import * as L from 'leaflet';


interface Truck {

  id:string;

  driver:string;

  product:string;

  status:'green'|'orange'|'red';

  time:number;

  lat:number;

  lng:number;

  destination:string;

}



@Component({

  selector:'app-cartography',

  standalone:true,

  imports:[CommonModule],

  templateUrl:'./cartography.html',

  styleUrl:'./cartography.css'

})


export class CartographyComponent
  implements AfterViewInit,OnDestroy {



  private map!:L.Map;


  private interval:any;



  selectedTruck?:Truck;



  total=0;

  green=0;

  orange=0;

  red=0;



  trucks:Truck[]=[



    {

      id:'CAM-025',

      driver:'Mohamed',

      product:'CPJ45',

      status:'green',

      time:18,

      lat:33.9145,

      lng:-5.5205,

      destination:'Fès'

    },



    {

      id:'CAM-031',

      driver:'Youssef',

      product:'CPA55',

      status:'orange',

      time:38,

      lat:33.9138,

      lng:-5.5190,

      destination:'Rabat'

    },



    {

      id:'CAM-044',

      driver:'Ahmed',

      product:'CPJ35',

      status:'red',

      time:52,

      lat:33.9125,

      lng:-5.5175,

      destination:'Casablanca'

    }



  ];





  ngAfterViewInit(){

    this.initMap();

    this.loadFactory();

    this.loadTrucks();

    this.calculateStats();

    this.simulateMovement();


  }





  initMap(){


    this.map=L.map('map',{

      zoomControl:true

    })

      .setView(

        [
          33.914,
          -5.520
        ],

        17

      );



// Satellite

    L.tileLayer(

      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',

      {

        attribution:'Esri Satellite'

      }

    )

      .addTo(this.map);



  }





  loadFactory(){



// Zone usine

    const factory=[

      [
        33.918,
        -5.526
      ],

      [
        33.918,
        -5.514
      ],

      [
        33.909,
        -5.514
      ],

      [
        33.909,
        -5.526
      ]

    ];



    L.polygon(

      factory as L.LatLngExpression[],

      {

        color:'#003b8e',

        fillColor:'#1976d2',

        fillOpacity:.25,

        weight:3

      }

    )

      .addTo(this.map)

      .bindPopup(

        `

<h3>
🏭 Holcim Maroc Meknès
</h3>

<p>
Zone industrielle de production
</p>

`

      );





// Points opérationnels


    const zones=[


      {

        name:'🚪 Entrée principale',

        lat:33.916,

        lng:-5.524,

        color:'#00c853'

      },



      {

        name:'🅿 Parking camions',

        lat:33.915,

        lng:-5.522,

        color:'#1565c0'

      },



      {

        name:'⚖ Pont bascule',

        lat:33.914,

        lng:-5.520,

        color:'#f9a825'

      },



      {

        name:'📦 Zone chargement',

        lat:33.912,

        lng:-5.518,

        color:'#673ab7'

      },



      {

        name:'🚪 Sortie poids lourds',

        lat:33.910,

        lng:-5.516,

        color:'#e53935'

      }



    ];





    zones.forEach(zone=>{


      L.circleMarker(

        [zone.lat,zone.lng],

        {


          radius:10,

          color:zone.color,

          fillColor:zone.color,

          fillOpacity:1

        }

      )

        .addTo(this.map)

        .bindPopup(

          `

<b>${zone.name}</b>

`

        );



    });



  }







  loadTrucks(){



    this.trucks.forEach(truck=>{



      const marker=L.marker(

        [

          truck.lat,

          truck.lng

        ],

        {

          icon:this.truckIcon(truck.status)

        }

      )



        .addTo(this.map);



      marker.on(

        'click',

        ()=>{

          this.selectedTruck=truck;

        }

      );



      marker.bindPopup(

        `

<h3>
🚛 ${truck.id}
</h3>


<b>Produit:</b>
${truck.product}

<br>

<b>Chauffeur:</b>
${truck.driver}

<br>

<b>Destination:</b>
${truck.destination}

<br>

<b>Temps:</b>

${truck.time} min


<br>

<b>Status:</b>

${truck.status}


`

      );



    });



  }







  truckIcon(status:string){



    let color='';



    if(status==='green')
      color='#00c853';



    if(status==='orange')
      color='#f9a825';



    if(status==='red')
      color='#e53935';



    return L.divIcon({

      className:'truck-icon',

      html:

        `

<div class="truck ${status}"

style="background:${color}">

<i class="fas fa-truck"></i>

</div>

`,

      iconSize:[40,40],

      iconAnchor:[20,20]

    });



  }







  calculateStats(){


    this.total=this.trucks.length;


    this.green=this.trucks
      .filter(t=>t.status==='green')
      .length;



    this.orange=this.trucks
      .filter(t=>t.status==='orange')
      .length;



    this.red=this.trucks
      .filter(t=>t.status==='red')
      .length;


  }







  simulateMovement(){



    this.interval=setInterval(()=>{


      this.trucks.forEach(t=>{


        t.lat +=

          (Math.random()-.5)/10000;


        t.lng +=

          (Math.random()-.5)/10000;


      });



    },5000);



  }







  focusTruck(){


    if(!this.selectedTruck)
      return;



    this.map.flyTo(

      [

        this.selectedTruck.lat,

        this.selectedTruck.lng

      ],

      18

    );



  }







  ngOnDestroy(){


    clearInterval(this.interval);


    this.map?.remove();



  }




}
