import { AfterViewInit, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { FleetDataService, FleetTruck } from '../../core/services/fleet-data.service';

type StatutCamion = 'green' | 'orange' | 'red';
type FiltreStatut = 'tous' | StatutCamion;

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

@Component({
  selector: 'app-cartography',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cartography.html',
  styleUrl: './cartography.css',
})
export class CartographyComponent implements AfterViewInit, OnDestroy {
  private readonly fleet = inject(FleetDataService);
  private map!: L.Map;
  private markers = new Map<string, L.Marker>();
  private movementInterval?: ReturnType<typeof setInterval>;

  trucks = computed(() => this.fleet.trucks());
  selectedTruck = signal<FleetTruck | null>(null);
  filtre = signal<FiltreStatut>('tous');
  recherche = signal('');
  isRefreshing = signal(false);

  private readonly syncMarkers = effect(() => {
    if (!this.map) {
      return;
    }

    this.syncTrucks(this.trucks());
  });

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
    this.syncTrucks(this.trucks());
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

  private syncTrucks(trucks: FleetTruck[]): void {
    trucks.forEach((truck) => this.drawOrUpdateTruckMarker(truck));

    this.markers.forEach((marker, truckId) => {
      if (!trucks.some((truck) => truck.id === truckId)) {
        marker.remove();
        this.markers.delete(truckId);
      }
    });

    const selected = this.selectedTruck();
    if (selected) {
      const refreshed = trucks.find((truck) => truck.id === selected.id) ?? null;
      this.selectedTruck.set(refreshed);
    }
  }

  private drawOrUpdateTruckMarker(truck: FleetTruck): void {
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

  private popupContent(truck: FleetTruck): string {
    return `<b>${truck.id}</b><br>Produit : ${truck.product}<br>Chauffeur : ${truck.driver}<br>Destination : ${truck.destination}<br>Temps : ${truck.time} min`;
  }

  private truckIcon(truck: FleetTruck): L.DivIcon {
    const estSelectionne = this.selectedTruck()?.id === truck.id;
    return L.divIcon({
      className: 'truck-icon',
      html: `<div class="truck ${truck.status} ${estSelectionne ? 'selected' : ''}"><i class="fas fa-truck"></i></div>`,
      iconSize: estSelectionne ? [46, 46] : [38, 38],
      iconAnchor: estSelectionne ? [23, 23] : [19, 19],
    });
  }

  selectTruck(truck: FleetTruck): void {
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
    this.fleet.refreshTrucks();
    setTimeout(() => this.isRefreshing.set(false), 700);
  }

  /** Le déplacement simulé reste confiné dans les bornes de l'usine. */
  private simulateMovement(): void {
    this.movementInterval = setInterval(() => {
      this.fleet.refreshTrucks(false);
    }, 5000);
  }
}
