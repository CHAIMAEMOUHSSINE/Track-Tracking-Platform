import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface DashboardStatsResponse {
  totalCamions: number;
  camionsEnCours: number;
  camionsTermines: number;
  nombreRetards: number;
  tempsMoyenParcoursMinutes: number;
  pourcentageRetards: number;
  alertesActives: number;
  repartitionParEtat: Record<string, number>;
}

interface TruckRow {
  immatriculation: string;
  heureEntree: string;
  pointControleActuel: string;
  tempsEcouleMinutes: number;
  statut: 'VERT' | 'ORANGE' | 'ROUGE';
  responsable: string;
  justification?: string;
}

interface AlertRow {
  immatriculation: string;
  etape: string;
  tempsTotalMinutes: number;
  service: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
  statut: 'ACTIVE' | 'JUSTIFIEE';
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('trendChart') trendChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('serviceChart') serviceChartRef?: ElementRef<HTMLCanvasElement>;

  private trendChart?: Chart;
  private statusChart?: Chart;
  private serviceChart?: Chart;

  loading = false;

  stats: DashboardStatsResponse = {
    totalCamions: 0,
    camionsEnCours: 0,
    camionsTermines: 0,
    nombreRetards: 0,
    tempsMoyenParcoursMinutes: 0,
    pourcentageRetards: 0,
    alertesActives: 0,
    repartitionParEtat: { VERT: 0, ORANGE: 0, ROUGE: 0 }
  };

  kpis = [
    { label: 'Total camions', value: () => this.stats.totalCamions, tone: 'blue', icon: 'fa-truck-fast' },
    { label: 'Camions arrivés', value: () => this.stats.camionsTermines, tone: 'green', icon: 'fa-circle-check' },
    { label: 'Camions en cours', value: () => this.stats.camionsEnCours, tone: 'amber', icon: 'fa-gears' },
    { label: 'Dépassements 45 min', value: () => this.stats.nombreRetards, tone: 'red', icon: 'fa-triangle-exclamation' },
    { label: 'Alertes actives', value: () => this.stats.alertesActives, tone: 'blue', icon: 'fa-bell' }
  ];

  trackers: TruckRow[] = [
    { immatriculation: 'TRK-018', heureEntree: '08:10', pointControleActuel: 'Atelier d’expédition', tempsEcouleMinutes: 67, statut: 'ROUGE', responsable: 'Expédition', justification: 'Retard de quai' },
    { immatriculation: 'TRK-011', heureEntree: '08:42', pointControleActuel: 'Parking', tempsEcouleMinutes: 43, statut: 'ORANGE', responsable: 'Production' },
    { immatriculation: 'TRK-026', heureEntree: '09:05', pointControleActuel: 'Porte de sortie', tempsEcouleMinutes: 24, statut: 'VERT', responsable: 'Sécurité' },
    { immatriculation: 'TRK-004', heureEntree: '09:12', pointControleActuel: 'Agent Commercial', tempsEcouleMinutes: 51, statut: 'ROUGE', responsable: 'Maintenance', justification: 'Intervention en cours' },
    { immatriculation: 'TRK-031', heureEntree: '09:30', pointControleActuel: 'Porte d’entrée', tempsEcouleMinutes: 18, statut: 'VERT', responsable: 'Expédition' }
  ];

  alerts = [
    { immatriculation: 'TRK-018', etape: 'Atelier d’expédition', tempsTotalMinutes: 67, service: 'Expédition', priorite: 'Haute', statut: 'ACTIVE' },
    { immatriculation: 'TRK-004', etape: 'Agent Commercial', tempsTotalMinutes: 51, service: 'Maintenance', priorite: 'Haute', statut: 'ACTIVE' },
    { immatriculation: 'TRK-011', etape: 'Parking', tempsTotalMinutes: 43, service: 'Production', priorite: 'Moyenne', statut: 'ACTIVE' }
  ];

  notifications = [
    'Nouveau camion arrivé à la porte d’entrée',
    'Justification ajoutée pour TRK-004',
    'Alerte rouge levée sur TRK-026'
  ];

  trackingFilter = '';
  statusFilter = 'Tous';

  constructor(private readonly http: HttpClient) {}

  get filteredTrackers(): TruckRow[] {
    const search = this.trackingFilter.trim().toLowerCase();
    return this.trackers.filter((truck) => {
      const matchSearch = !search || truck.immatriculation.toLowerCase().includes(search);
      const matchStatus = this.statusFilter === 'Tous' || truck.statut === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  ngAfterViewInit(): void {
    this.trendChart = new Chart(this.trendChartRef?.nativeElement as HTMLCanvasElement, this.trendConfig());
    this.statusChart = new Chart(this.statusChartRef?.nativeElement as HTMLCanvasElement, this.statusConfig());
    this.serviceChart = new Chart(this.serviceChartRef?.nativeElement as HTMLCanvasElement, this.serviceConfig());
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.loading = true;

    this.http.get<DashboardStatsResponse>('http://localhost:8080/api/dashboard/stats')
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (response) => {
          this.stats = response;
          this.syncStatusChart();
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.trendChart?.destroy();
    this.statusChart?.destroy();
    this.serviceChart?.destroy();
  }

  private trendConfig(): ChartConfiguration<'line'> {
    return {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
          {
            label: 'Livraisons',
            data: [62, 68, 71, 76, 82, 88, 91],
            borderColor: '#003b8e',
            backgroundColor: 'rgba(0, 59, 142, 0.14)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#003b8e'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(15, 29, 51, 0.06)'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(15, 29, 51, 0.06)'
            }
          }
        }
      }
    };
  }

  private statusConfig(): ChartConfiguration<'doughnut'> {
    return {
      type: 'doughnut',
      data: {
        labels: ['Dans le temps', 'Presque 45 min', 'Au-delà de 45 min'],
        datasets: [
          {
            data: [this.stats.repartitionParEtat['VERT'], this.stats.repartitionParEtat['ORANGE'], this.stats.repartitionParEtat['ROUGE']],
            backgroundColor: ['#00c853', '#f9a825', '#e53935'],
            borderWidth: 0,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    };
  }

  private serviceConfig(): ChartConfiguration<'bar'> {
    return {
      type: 'bar',
      data: {
        labels: ['Production', 'Maintenance', 'Expédition'],
        datasets: [
          {
            label: 'Alertes par service',
            data: [3, 2, 4],
            backgroundColor: ['#003b8e', '#9b5a00', '#e53935'],
            borderRadius: 12
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(15, 29, 51, 0.06)'
            }
          }
        }
      }
    };
  }

  private syncStatusChart(): void {
    if (!this.statusChart) {
      return;
    }

    this.statusChart.data.datasets[0].data = [
      this.stats.repartitionParEtat['VERT'],
      this.stats.repartitionParEtat['ORANGE'],
      this.stats.repartitionParEtat['ROUGE']
    ];
    this.statusChart.update();
  }
}