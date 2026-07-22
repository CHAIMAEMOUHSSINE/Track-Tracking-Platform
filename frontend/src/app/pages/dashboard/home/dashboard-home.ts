import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('trendChart') trendChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef?: ElementRef<HTMLCanvasElement>;

  private trendChart?: Chart;
  private statusChart?: Chart;

  stats = [
    { label: 'Camions actifs', value: '24', delta: '+12%', icon: 'fa-truck-fast', tone: 'blue' },
    { label: 'Alertes ouvertes', value: '7', delta: '-18%', icon: 'fa-triangle-exclamation', tone: 'red' },
    { label: 'Livraisons du jour', value: '86%', delta: '+6%', icon: 'fa-boxes-stacked', tone: 'green' },
    { label: 'Temps moyen cycle', value: '41 min', delta: '-4 min', icon: 'fa-clock', tone: 'amber' }
  ];

  alerts = [
    { title: 'Camion 18 en retard', detail: 'Retard de 22 minutes sur la tournée Meknès Nord.', level: 'critical' },
    { title: 'Maintenance préventive', detail: 'Camion 07 à planifier avant la fin de journée.', level: 'warning' },
    { title: 'Sortie de zone valide', detail: '12 véhicules conformes au périmètre de Meknès.', level: 'info' }
  ];

  fleet = [
    { id: 'TRK-018', driver: 'A. El Idrissi', status: 'En route', load: '22 t', eta: '11:40', mood: 'success' },
    { id: 'TRK-011', driver: 'S. Bennis', status: 'Chargement', load: '18 t', eta: '12:05', mood: 'warning' },
    { id: 'TRK-004', driver: 'M. Ait Haddou', status: 'Maintenance', load: '—', eta: '15:30', mood: 'danger' },
    { id: 'TRK-026', driver: 'Y. Kabbaj', status: 'Retour site', load: '20 t', eta: '13:10', mood: 'success' }
  ];

  ngAfterViewInit(): void {
    this.trendChart = new Chart(this.trendChartRef?.nativeElement as HTMLCanvasElement, this.trendConfig());
    this.statusChart = new Chart(this.statusChartRef?.nativeElement as HTMLCanvasElement, this.statusConfig());
  }

  ngOnDestroy(): void {
    this.trendChart?.destroy();
    this.statusChart?.destroy();
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
            data: [16, 5, 3],
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
}