import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DistritoService } from '../../core/services/api.services';
import { CargoService } from '../../core/services/api.services';
import { EmpleadoService } from '../../core/services/api.services';
import { ClienteService } from '../../core/services/api.services';
import { ProductoService } from '../../core/services/api.services';
import { BoletaService } from '../../core/services/api.services';

interface StatCard { label: string; count: number; icon: string; route: string; color: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1 class="dash-title">📊 Dashboard</h1>
      <p class="dash-subtitle">Resumen general del sistema de ventas</p>

      @if (loading()) {
        <div class="loading">Cargando estadísticas...</div>
      } @else {
        <div class="stats-grid">
          @for (card of stats(); track card.label) {
            <a [routerLink]="card.route" class="stat-card" [style.border-top-color]="card.color">
              <div class="stat-icon">{{ card.icon }}</div>
              <div class="stat-info">
                <span class="stat-count">{{ card.count }}</span>
                <span class="stat-label">{{ card.label }}</span>
              </div>
            </a>
          }
        </div>
      }

      <div class="quick-links">
        <h3>Accesos rápidos</h3>
        <div class="links-grid">
          <a routerLink="/boletas" class="quick-link">➕ Nueva Boleta</a>
          <a routerLink="/productos" class="quick-link">📦 Ver Productos</a>
          <a routerLink="/clientes" class="quick-link">🧑 Ver Clientes</a>
          <a routerLink="/productos" [queryParams]="{stockBajo: true}" class="quick-link warn">
            ⚠️ Stock Bajo
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; }
    .dash-title { font-size: 1.6rem; color: #1e293b; margin: 0 0 .25rem; }
    .dash-subtitle { color: #64748b; margin: 0 0 2rem; }
    .loading { text-align: center; padding: 3rem; color: #64748b; }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;
    }
    .stat-card {
      background: #fff; border-radius: 12px; padding: 1.25rem; border-top: 4px solid #3b82f6;
      box-shadow: 0 1px 3px rgba(0,0,0,.07); display: flex; align-items: center; gap: 1rem;
      text-decoration: none; color: inherit; transition: transform .2s, box-shadow .2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.12); }
    .stat-icon { font-size: 2rem; }
    .stat-count { display: block; font-size: 1.8rem; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: .8rem; color: #64748b; }

    .quick-links h3 { color: #1e293b; margin: 0 0 1rem; }
    .links-grid { display: flex; gap: .75rem; flex-wrap: wrap; }
    .quick-link {
      background: #3b82f6; color: #fff; padding: .6rem 1.2rem;
      border-radius: 8px; text-decoration: none; font-size: .9rem; font-weight: 500;
      transition: background .2s;
    }
    .quick-link:hover { background: #2563eb; }
    .quick-link.warn { background: #f59e0b; }
    .quick-link.warn:hover { background: #d97706; }
  `]
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<StatCard[]>([]);

  constructor(
    private distritoSvc: DistritoService,
    private cargoSvc: CargoService,
    private empleadoSvc: EmpleadoService,
    private clienteSvc: ClienteService,
    private productoSvc: ProductoService,
    private boletaSvc: BoletaService
  ) {}

  ngOnInit() {
    forkJoin({
      distritos: this.distritoSvc.getAll(),
      cargos: this.cargoSvc.getAll(),
      empleados: this.empleadoSvc.getAll(),
      clientes: this.clienteSvc.getAll(),
      productos: this.productoSvc.getAll(),
      boletas: this.boletaSvc.getAll()
    }).subscribe({
      next: (res) => {
        this.stats.set([
          { label: 'Distritos',  count: res.distritos.data?.length ?? 0,  icon: '🗺️', route: '/distritos',  color: '#8b5cf6' },
          { label: 'Cargos',     count: res.cargos.data?.length ?? 0,     icon: '💼', route: '/cargos',     color: '#06b6d4' },
          { label: 'Empleados',  count: res.empleados.data?.length ?? 0,  icon: '👥', route: '/empleados',  color: '#10b981' },
          { label: 'Clientes',   count: res.clientes.data?.length ?? 0,   icon: '🧑‍💼', route: '/clientes',   color: '#f59e0b' },
          { label: 'Productos',  count: res.productos.data?.length ?? 0,  icon: '📦', route: '/productos',  color: '#ef4444' },
          { label: 'Boletas',    count: res.boletas.data?.length ?? 0,    icon: '🧾', route: '/boletas',    color: '#3b82f6' },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
