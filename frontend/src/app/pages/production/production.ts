import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Produit {

  id:number;

  nom:string;

  ligne:string;

  stock:number;

  production:number;

  objectif:number;

  unite:string;

  statut:string;

  color:string;

}

interface Alerte{

  produit:string;

  message:string;

}

interface Ligne{

  nom:string;

  responsable:string;

  statut:string;

  color:string;

}

@Component({

  selector:'app-production',

  standalone:true,

  imports:[CommonModule,FormsModule],

  templateUrl:'./production.html',

  styleUrl:'./production.css'

})

export class ProductionComponent{

  recherche='';

  produits:Produit[]=[

    {

      id:1,

      nom:'CPJ 35',

      ligne:'Ligne 1',

      stock:420,

      production:820,

      objectif:1000,

      unite:'tonnes',

      statut:'Disponible',

      color:'success'

    },

    {

      id:2,

      nom:'CPJ 45',

      ligne:'Ligne 2',

      stock:85,

      production:650,

      objectif:900,

      unite:'tonnes',

      statut:'Stock faible',

      color:'warning'

    },

    {

      id:3,

      nom:'CPA 55',

      ligne:'Ligne 3',

      stock:0,

      production:310,

      objectif:700,

      unite:'tonnes',

      statut:'Rupture',

      color:'danger'

    },

    {

      id:4,

      nom:'CLC',

      ligne:'Ligne 1',

      stock:620,

      production:1100,

      objectif:1200,

      unite:'tonnes',

      statut:'Disponible',

      color:'success'

    }

  ];

  alertes:Alerte[]=[

    {

      produit:'CPA 55',

      message:'Rupture de stock'

    },

    {

      produit:'CPJ 45',

      message:'Stock inférieur au seuil'

    }

  ];

  lignes:Ligne[]=[

    {

      nom:'Ligne 1',

      responsable:'Ahmed',

      statut:'En fonctionnement',

      color:'success'

    },

    {

      nom:'Ligne 2',

      responsable:'Youssef',

      statut:'Maintenance',

      color:'warning'

    },

    {

      nom:'Ligne 3',

      responsable:'Hamza',

      statut:'En fonctionnement',

      color:'success'

    }

  ];

  demande={

    produit:'',

    quantite:0,

    priorite:'',

    commentaire:''

  };

  message='';

  get produitsFiltres(){

    if(!this.recherche.trim()){

      return this.produits;

    }

    return this.produits.filter(p=>

      p.nom.toLowerCase().includes(this.recherche.toLowerCase())

      ||

      p.ligne.toLowerCase().includes(this.recherche.toLowerCase())

    );

  }

  get totalProduits(){

    return this.produits.length;

  }

  get productionJour(){

    return this.produits.reduce((s,p)=>s+p.production,0);

  }

  get stockDisponible(){

    return this.produits.reduce((s,p)=>s+p.stock,0);

  }

  get ruptures(){

    return this.produits.filter(p=>p.statut==='Rupture').length;

  }

  lancerProduction(){

    if(

      !this.demande.produit ||

      !this.demande.quantite ||

      !this.demande.priorite

    ){

      alert("Veuillez remplir tous les champs.");

      return;

    }

    this.message="Demande envoyée avec succès.";

    this.demande={

      produit:'',

      quantite:0,

      priorite:'',

      commentaire:''

    };

    setTimeout(()=>{

      this.message='';

    },3000);

  }

  refresh(){

    console.log("Actualisation Production...");

  }

}
