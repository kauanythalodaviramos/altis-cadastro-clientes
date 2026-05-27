import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import Chart from 'chart.js/auto';

import { FotoService } from '../album/services/foto.service';
import { AuthImgDirective } from '../shared/directives/auth-img.directive';
import { ThemeService } from '../core/theme.service';
import { DashboardStats } from './dashboard.model';
import { DashboardServiceFront } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TranslateModule, AuthImgDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements AfterViewInit, OnDestroy {
  private readonly dashboardService = inject(DashboardServiceFront);
  private readonly fotoService = inject(FotoService);
  private readonly theme = inject(ThemeService);

  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  private pieChart: Chart | null = null;
  private barChart: Chart | null = null;

  constructor() {
    // Re-render charts quando o tema mudar (cores podem precisar ajustar)
    effect(() => {
      this.theme.theme();
      if (this.stats()) {
        setTimeout(() => this.renderCharts(), 0);
      }
    });
  }

  ngAfterViewInit(): void {
    this.dashboardService.stats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.carregando.set(false);
        setTimeout(() => this.renderCharts(), 0);
      },
      error: () => {
        this.erro.set('Erro ao carregar estatisticas.');
        this.carregando.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
    this.barChart?.destroy();
  }

  protected imagemUrl(id: number): string {
    return this.fotoService.imagemUrl(id);
  }

  private renderCharts(): void {
    const s = this.stats();
    if (!s) return;

    const textColor = this.theme.theme() === 'dark' ? '#e9ecef' : '#212529';
    const gridColor = this.theme.theme() === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    // Pizza: fotos por emocao
    if (this.pieCanvas) {
      this.pieChart?.destroy();
      this.pieChart = new Chart(this.pieCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: s.fotosPorEmocao.map(e => e.nome),
          datasets: [{
            data: s.fotosPorEmocao.map(e => e.total),
            backgroundColor: s.fotosPorEmocao.map(e => e.cor || '#6c757d'),
            borderColor: this.theme.theme() === 'dark' ? '#25282d' : '#fff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, padding: 12 } }
          },
          animation: { animateRotate: true, duration: 600 }
        }
      });
    }

    // Barras: clientes por UF
    if (this.barCanvas) {
      this.barChart?.destroy();
      const ufs = Object.keys(s.clientesPorUf);
      const valores = ufs.map(uf => s.clientesPorUf[uf]);
      this.barChart = new Chart(this.barCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ufs,
          datasets: [{
            label: 'Clientes por UF',
            data: valores,
            backgroundColor: '#0d6efd',
            borderRadius: 8,
            maxBarThickness: 40
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor }, grid: { color: 'transparent' } },
            y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor }, beginAtZero: true }
          },
          animation: { duration: 600 }
        }
      });
    }
  }
}
