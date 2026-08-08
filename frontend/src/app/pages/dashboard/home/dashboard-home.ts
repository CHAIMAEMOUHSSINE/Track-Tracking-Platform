import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardAlertRow, DashboardStats, DashboardTruckRow, FleetDataService } from '../../../core/services/fleet-data.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHomeComponent implements AfterViewInit, OnDestroy {
  private readonly fleet = inject(FleetDataService);
  @ViewChild('trendChart') trendChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('serviceChart') serviceChartRef?: ElementRef<HTMLCanvasElement>;

  private trendChart?: Chart;
  private statusChart?: Chart;
  private serviceChart?: Chart;

  loading = false;

  stats: DashboardStats = this.fleet.stats();

  kpis = [
    { label: 'Total camions', value: () => this.stats.totalCamions, tone: 'blue', icon: 'fa-truck-fast' },
    { label: 'Camions arrivés', value: () => this.stats.camionsTermines, tone: 'green', icon: 'fa-circle-check' },
    { label: 'Camions en cours', value: () => this.stats.camionsEnCours, tone: 'amber', icon: 'fa-gears' },
    { label: 'Dépassements 45 min', value: () => this.stats.nombreRetards, tone: 'red', icon: 'fa-triangle-exclamation' },
    { label: 'Alertes actives', value: () => this.stats.alertesActives, tone: 'blue', icon: 'fa-bell' }
  ];

  trackers: DashboardTruckRow[] = this.fleet.dashboardRows();

  alerts: DashboardAlertRow[] = this.fleet.alerts();

  notifications: string[] = this.fleet.notifications();

  trackingFilter = '';
  statusFilter = 'Tous';

  constructor() {
    effect(() => {
      this.stats = this.fleet.stats();
      this.trackers = this.fleet.dashboardRows();
      this.alerts = this.fleet.alerts();
      this.notifications = this.fleet.notifications();

      if (this.statusChart) {
        this.syncStatusChart();
      }

      if (this.serviceChart) {
        this.serviceChart.data.datasets[0].data = [
          this.alerts.filter((alert) => alert.service === 'Production').length,
          this.alerts.filter((alert) => alert.service === 'Maintenance').length,
          this.alerts.filter((alert) => alert.service === 'Expédition').length
        ];
        this.serviceChart.update();
      }

      if (this.trendChart) {
        this.trendChart.data.datasets[0].data = this.fleet.trucks().map((truck) => truck.time + 40);
        this.trendChart.update();
      }
    });
  }

  get filteredTrackers(): DashboardTruckRow[] {
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
    this.syncStatusChart();
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