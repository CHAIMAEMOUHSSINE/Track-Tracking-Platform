import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-cartography',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cartography.html',
  styleUrl: './cartography.css'
})
export class CartographyComponent implements AfterViewInit, OnDestroy {
  private map?: L.Map;

  ngAfterViewInit(): void {
    const meknesBounds: L.LatLngBoundsExpression = [
      [33.95, -5.75],
      [33.75, -5.35]
    ];

    this.map = L.map('meknes-map', {
      zoomControl: true,
      maxBounds: meknesBounds,
      maxBoundsViscosity: 1.0
    }).setView([33.885, -5.547], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    const truckIcon = (color: string): L.DivIcon => L.divIcon({
      className: 'truck-marker-shell',
      html: `<div class="truck-marker" style="background:${color}"><i class="fas fa-truck"></i></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const trucks = [
      {
        name: 'TRK-018',
        position: [33.891, -5.555] as L.LatLngExpression,
        color: '#e53935',
        label: 'Dépassé 45 min'
      },
      {
        name: 'TRK-011',
        position: [33.879, -5.538] as L.LatLngExpression,
        color: '#f9a825',
        label: 'Presque 45 min'
      },
      {
        name: 'TRK-026',
        position: [33.887, -5.545] as L.LatLngExpression,
        color: '#00c853',
        label: 'Dans le temps'
      }
    ];

    trucks.forEach((truck) => {
      L.marker(truck.position, { icon: truckIcon(truck.color) })
        .addTo(this.map as L.Map)
        .bindPopup(`<strong>${truck.name}</strong><br/>${truck.label}`);
    });

    const meknesMarker = L.marker([33.885, -5.547]).addTo(this.map);
    meknesMarker.bindPopup('<strong>Usine de Meknès</strong><br/>Périmètre de supervision logistique.').openPopup();

    L.circle([33.885, -5.547], {
      radius: 2200,
      color: '#003b8e',
      fillColor: '#003b8e',
      fillOpacity: 0.12
    }).addTo(this.map);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}