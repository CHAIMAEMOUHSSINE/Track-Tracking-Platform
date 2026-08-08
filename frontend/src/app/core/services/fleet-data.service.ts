import { Injectable, computed, signal } from '@angular/core';

export type TruckStatus = 'green' | 'orange' | 'red';
export type TruckTone = 'ok' | 'warning' | 'danger';

export interface FleetTruck {
  id: string;
  driver: string;
  product: string;
  destination: string;
  quay: string;
  time: number;
  progress: number;
  status: TruckStatus;
  color: TruckTone;
  lat: number;
  lng: number;
  heureEntree: string;
  pointControleActuel: string;
  responsable: string;
  justification?: string;
}

export interface DashboardTruckRow {
  immatriculation: string;
  heureEntree: string;
  pointControleActuel: string;
  tempsEcouleMinutes: number;
  statut: 'VERT' | 'ORANGE' | 'ROUGE';
  responsable: string;
  justification?: string;
}

export interface DashboardAlertRow {
  immatriculation: string;
  etape: string;
  tempsTotalMinutes: number;
  service: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
  statut: 'ACTIVE' | 'JUSTIFIEE';
}

export interface DashboardStats {
  totalCamions: number;
  camionsEnCours: number;
  camionsTermines: number;
  nombreRetards: number;
  tempsMoyenParcoursMinutes: number;
  pourcentageRetards: number;
  alertesActives: number;
  repartitionParEtat: Record<string, number>;
}

const INITIAL_TRUCKS: FleetTruck[] = [
  {
    id: 'CAM-025',
    driver: 'Mohamed',
    product: 'CPJ 45',
    destination: 'Fès',
    quay: 'Quai 1',
    time: 18,
    progress: 82,
    status: 'green',
    color: 'ok',
    lat: 33.9105,
    lng: -5.4972,
    heureEntree: '08:10',
    pointControleActuel: 'Atelier d’expédition',
    responsable: 'Expédition'
  },
  {
    id: 'CAM-031',
    driver: 'Youssef',
    product: 'CPA 55',
    destination: 'Rabat',
    quay: 'Quai 2',
    time: 38,
    progress: 55,
    status: 'orange',
    color: 'warning',
    lat: 33.9095,
    lng: -5.4957,
    heureEntree: '08:42',
    pointControleActuel: 'Parking camions',
    responsable: 'Production'
  },
  {
    id: 'CAM-044',
    driver: 'Ahmed',
    product: 'CPJ 35',
    destination: 'Casablanca',
    quay: 'Quai 3',
    time: 52,
    progress: 97,
    status: 'red',
    color: 'danger',
    lat: 33.9083,
    lng: -5.4936,
    heureEntree: '09:12',
    pointControleActuel: 'Agent Commercial',
    responsable: 'Maintenance',
    justification: 'Intervention en cours'
  },
  {
    id: 'CAM-052',
    driver: 'Hamza',
    product: 'CPJ 45',
    destination: 'Meknès',
    quay: 'Quai 1',
    time: 24,
    progress: 68,
    status: 'green',
    color: 'ok',
    lat: 33.9101,
    lng: -5.4964,
    heureEntree: '09:30',
    pointControleActuel: 'Porte d’entrée',
    responsable: 'Sécurité'
  },
  {
    id: 'CAM-061',
    driver: 'Sara',
    product: 'CPA 55',
    destination: 'Khénifra',
    quay: 'Quai 2',
    time: 44,
    progress: 74,
    status: 'orange',
    color: 'warning',
    lat: 33.9079,
    lng: -5.4928,
    heureEntree: '09:48',
    pointControleActuel: 'Pont bascule',
    responsable: 'Expédition'
  }
];

@Injectable({
  providedIn: 'root'
})
export class FleetDataService {
  private readonly trucksState = signal<FleetTruck[]>(INITIAL_TRUCKS);
  private readonly notificationsState = signal<string[]>([
    'Trucking Truck prêt pour la supervision',
    'Justification active sur CAM-044',
    'Surveillance renforcée sur le quai 2'
  ]);

  readonly trucks = this.trucksState.asReadonly();
  readonly notifications = this.notificationsState.asReadonly();

  readonly dashboardRows = computed<DashboardTruckRow[]>(() =>
    this.trucksState().map((truck) => ({
      immatriculation: truck.id,
      heureEntree: truck.heureEntree,
      pointControleActuel: truck.pointControleActuel,
      tempsEcouleMinutes: truck.time,
      statut: this.toDashboardStatus(truck.status),
      responsable: truck.responsable,
      justification: truck.justification
    }))
  );

  readonly alerts = computed<DashboardAlertRow[]>(() =>
    this.trucksState()
      .filter((truck) => truck.status !== 'green')
      .map((truck) => ({
        immatriculation: truck.id,
        etape: truck.pointControleActuel,
        tempsTotalMinutes: truck.time,
        service: truck.responsable,
        priorite: truck.status === 'red' ? 'Haute' : 'Moyenne',
        statut: truck.justification ? 'JUSTIFIEE' : 'ACTIVE'
      }))
  );

  readonly stats = computed<DashboardStats>(() => {
    const trucks = this.trucksState();
    const green = trucks.filter((truck) => truck.status === 'green').length;
    const orange = trucks.filter((truck) => truck.status === 'orange').length;
    const red = trucks.filter((truck) => truck.status === 'red').length;
    const active = trucks.filter((truck) => truck.progress < 100).length;
    const completed = trucks.length - active;
    const average = trucks.length
      ? trucks.reduce((sum, truck) => sum + truck.time, 0) / trucks.length
      : 0;

    return {
      totalCamions: trucks.length,
      camionsEnCours: active,
      camionsTermines: completed,
      nombreRetards: red,
      tempsMoyenParcoursMinutes: Number(average.toFixed(1)),
      pourcentageRetards: trucks.length ? Number(((red / trucks.length) * 100).toFixed(1)) : 0,
      alertesActives: this.alerts().filter((alert) => alert.statut === 'ACTIVE').length,
      repartitionParEtat: {
        VERT: green,
        ORANGE: orange,
        ROUGE: red
      }
    };
  });

  refreshTrucks(notify = true): void {
    this.trucksState.update((trucks) =>
      trucks.map((truck) => ({
        ...truck,
        time: truck.time + (truck.status === 'red' ? 1 : 0),
        lat: this.clamp(truck.lat + (Math.random() - 0.5) / 12000, 33.9066, 33.9118),
        lng: this.clamp(truck.lng + (Math.random() - 0.5) / 12000, -5.4995, -5.4900)
      }))
    );
    if (notify) {
      this.publishActivity('Cartographie', 'Synchronisation en temps réel');
    }
  }

  updateJustification(plate: string, reason: string): boolean {
    let updated = false;

    this.trucksState.update((trucks) =>
      trucks.map((truck) => {
        if (truck.id !== plate) {
          return truck;
        }

        updated = true;
        return {
          ...truck,
          justification: reason,
          status: 'red',
          color: 'danger',
          progress: Math.max(truck.progress, 92),
          time: Math.max(truck.time, 45)
        };
      })
    );

    if (updated) {
      this.publishActivity('Expédition', `Justification enregistrée pour ${plate}`);
    }

    return updated;
  }

  focusTruck(plate: string): FleetTruck | undefined {
    return this.trucksState().find((truck) => truck.id === plate);
  }

  publishActivity(source: string, message: string): void {
    this.notificationsState.update((notifications) => [`${source} : ${message}`, ...notifications].slice(0, 6));
  }

  private toDashboardStatus(status: TruckStatus): 'VERT' | 'ORANGE' | 'ROUGE' {
    switch (status) {
      case 'green':
        return 'VERT';
      case 'orange':
        return 'ORANGE';
      case 'red':
      default:
        return 'ROUGE';
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}