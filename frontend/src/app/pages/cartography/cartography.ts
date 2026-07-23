import { AfterViewInit, Component, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

type StatutCamion = 'green' | 'orange' | 'red';
type FiltreStatut = 'tous' | StatutCamion;

interface Truck {
  id: string;
  driver: string;
  product: string;
  destination: string;
  status: StatutCamion;
  time: number;
  lat: number;
  lng: number;
}

/**
 * Position réelle de l'usine LafargeHolcim Meknès :
 * route de Fès, km 8, quartier Ouisslane, Meknès.
 */
const FACTORY_CENTER: L.LatLngExpression = [33.9092, -5.4945];

/** Emprise du site industriel (utilisée pour verrouiller la carte, cf. initMap) */
const FACTORY_BOUNDS: L.LatLngBoundsExpression = [
  [33.9042, -5.5010], // sud-ouest
  [33.9142, -5.4880], // nord-est
];

/** Zone bâtie de l'usine (polygone approximatif affiché sur la carte) */
const FACTORY_ZONE: L.LatLngExpression[] = [
  [33.9118, -5.4995],
  [33.9118, -5.4900],
  [33.9066, -5.4900],
  [33.9066, -5.4995],
];

const ZONES = [
  { name: 'Entrée principale', lat: 33.9114, lng: -5.4988, color: '#00c853', icon: 'fa-door-open' },
  { name: 'Parking camions', lat: 33.9106, lng: -5.4975, color: '#1565c0', icon: 'fa-square-parking' },
  { name: 'Pont bascule', lat: 33.9096, lng: -5.4958, color: '#f9a825', icon: 'fa-weight-scale' },
  { name: 'Zone chargement', lat: 33.9084, lng: -5.4938, color: '#673ab7', icon: 'fa-warehouse' },
  { name: 'Sortie poids lourds', lat: 33.9072, lng: -5.4918, color: '#e53935', icon: 'fa-door-closed' },
];

const TRUCKS_DEMO: Truck[] = [
  { id: 'CAM-025', driver: 'Mohamed', product: 'CPJ 45', destination: 'Fès', status: 'green', time: 18, lat: 33.9105, lng: -5.4972 },
  { id: 'CAM-031', driver: 'Youssef', product: 'CPA 55', destination: 'Rabat', status: 'orange', time: 38, lat: 33.9095, lng: -5.4957 },
  { id: 'CAM-044', driver: 'Ahmed', product: 'CPJ 35', destination: 'Casablanca', status: 'red', time: 52, lat: 33.9083, lng: -5.4936 },
];

@Component({
  selector: 'app-cartography',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cartography.html',
  styleUrl: './cartography.css',
})
export class CartographyComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers = new Map<string, L.Marker>();
  private movementInterval?: ReturnType<typeof setInterval>;

  trucks = signal<Truck[]>(TRUCKS_DEMO);
  selectedTruck = signal<Truck | null>(null);
  filtre = signal<FiltreStatut>('tous');
  recherche = signal('');
  isRefreshing = signal(false);

  kpis = computed(() => {
    const list = this.trucks();
    return {
      total: list.length,
      green: list.filter((t) => t.status === 'green').length,
      orange: list.filter((t) => t.status === 'orange').length,
      red: list.filter((t) => t.status === 'red').length,
    };
  });

  trucksFiltres = computed(() => {
    const f = this.filtre();
    const q = this.recherche().trim().toLowerCase();
    return this.trucks().filter((t) => {
      const matchStatut = f === 'tous' || t.status === f;
      const matchRecherche = !q || t.id.toLowerCase().includes(q) || t.driver.toLowerCase().includes(q);
      return matchStatut && matchRecherche;
    });
  });

  ngAfterViewInit(): void {
    this.initMap();
    this.drawFactoryZone();
    this.drawCheckpoints();
    this.drawTrucks();
    this.simulateMovement();
  }

  ngOnDestroy(): void {
    if (this.movementInterval) clearInterval(this.movementInterval);
    this.map?.remove();
  }

  /** Carte centrée et verrouillée sur le périmètre de l'usine de Meknès uniquement. */
  private initMap(): void {
    this.map = L.map('map', {
      zoomControl: true,
      minZoom: 15,
      maxZoom: 19,
      maxBounds: FACTORY_BOUNDS,       // impossible de faire glisser la carte hors du site
      maxBoundsViscosity: 1.0,         // "rebond" dur sur les bords, pas de fuite possible
    }).setView(FACTORY_CENTER, 17);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Esri Satellite', maxZoom: 19 }
    ).addTo(this.map);

    // Empêche de dézoomer au point de sortir de l'usine
    this.map.setMinZoom(this.map.getBoundsZoom(FACTORY_BOUNDS));
  }

  private drawFactoryZone(): void {
    L.polygon(FACTORY_ZONE, { color: '#1b3b6f', fillColor: '#1e88b8', fillOpacity: 0.2, weight: 3 })
      .addTo(this.map)
      .bindPopup('<b>Holcim Maroc Meknès</b><br>Route de Fès, km 8 — Ouisslane');
  }

  private drawCheckpoints(): void {
    ZONES.forEach((zone) => {
      const icon = L.divIcon({
        className: 'checkpoint-icon',
        html: `<div class="checkpoint" style="background:${zone.color}"><i class="fas ${zone.icon}"></i></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker([zone.lat, zone.lng], { icon }).addTo(this.map).bindTooltip(zone.name, { direction: 'top' });
    });
  }

  private drawTrucks(): void {
    this.trucks().forEach((truck) => this.drawOrUpdateTruckMarker(truck));
  }

  private drawOrUpdateTruckMarker(truck: Truck): void {
    const existing = this.markers.get(truck.id);
    if (existing) {
      existing.setLatLng([truck.lat, truck.lng]);
      existing.setIcon(this.truckIcon(truck));
      return;
    }
    const marker = L.marker([truck.lat, truck.lng], { icon: this.truckIcon(truck) }).addTo(this.map);
    marker.on('click', () => this.selectTruck(truck));
    marker.bindPopup(this.popupContent(truck));
    this.markers.set(truck.id, marker);
  }

  private popupContent(truck: Truck): string {
    return `<b>${truck.id}</b><br>Produit : ${truck.product}<br>Chauffeur : ${truck.driver}<br>Destination : ${truck.destination}<br>Temps : ${truck.time} min`;
  }

  private truckIcon(truck: Truck): L.DivIcon {
    const estSelectionne = this.selectedTruck()?.id === truck.id;
    return L.divIcon({
      className: 'truck-icon',
      html: `<div class="truck ${truck.status} ${estSelectionne ? 'selected' : ''}"><i class="fas fa-truck"></i></div>`,
      iconSize: estSelectionne ? [46, 46] : [38, 38],
      iconAnchor: estSelectionne ? [23, 23] : [19, 19],
    });
  }

  selectTruck(truck: Truck): void {
    this.selectedTruck.set(truck);
    this.trucks().forEach((t) => this.markers.get(t.id)?.setIcon(this.truckIcon(t)));
    this.map.flyTo([truck.lat, truck.lng], 18);
  }

  closeDetail(): void {
    this.selectedTruck.set(null);
    this.trucks().forEach((t) => this.markers.get(t.id)?.setIcon(this.truckIcon(t)));
  }

  setFiltre(f: FiltreStatut): void {
    this.filtre.set(f);
  }

  refresh(): void {
    this.isRefreshing.set(true);
    setTimeout(() => this.isRefreshing.set(false), 700);
  }

  /** Le déplacement simulé reste confiné dans les bornes de l'usine. */
  private simulateMovement(): void {
    this.movementInterval = setInterval(() => {
      const updated = this.trucks().map((t) => ({
        ...t,
        lat: this.clamp(t.lat + (Math.random() - 0.5) / 12000, 33.9066, 33.9118),
        lng: this.clamp(t.lng + (Math.random() - 0.5) / 12000, -5.4995, -5.4900),
      }));
      this.trucks.set(updated);
      updated.forEach((t) => this.drawOrUpdateTruckMarker(t));

      const selected = this.selectedTruck();
      if (selected) this.selectedTruck.set(updated.find((t) => t.id === selected.id) ?? null);
    }, 5000);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
