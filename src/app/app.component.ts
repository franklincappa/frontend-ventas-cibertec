import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="brand">
            <span class="brand-icon">🛒</span>
            @if (!sidebarCollapsed()) {
              <span class="brand-text">Ventas API</span>
            }
          </div>
          <button class="toggle-btn" (click)="toggleSidebar()">
            {{ sidebarCollapsed() ? '▶' : '◀' }}
          </button>
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path"
               routerLinkActive="active"
               class="nav-item"
               [title]="item.label">
              <span class="nav-icon">{{ item.icon }}</span>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          @if (!sidebarCollapsed()) {
            <small>Ventas API v1.0</small>
          }
        </div>
      </aside>

      <!-- Main content -->
      <main class="main-content">
        <header class="topbar">
          <h2 class="page-title">Sistema de Ventas</h2>
          <div class="topbar-actions">
            <span class="api-badge">API v1</span>
          </div>
        </header>
        <div class="content-area">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; height: 100vh; overflow: hidden; font-family: 'Segoe UI', sans-serif; }

    .sidebar {
      width: 240px; min-width: 240px; background: #1e293b; color: #fff;
      display: flex; flex-direction: column; transition: all .3s ease; overflow: hidden;
    }
    .sidebar.collapsed { width: 64px; min-width: 64px; }

    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem; border-bottom: 1px solid #334155;
    }
    .brand { display: flex; align-items: center; gap: .5rem; font-weight: 700; font-size: 1.1rem; }
    .toggle-btn {
      background: none; border: 1px solid #475569; color: #94a3b8;
      border-radius: 4px; padding: 2px 6px; cursor: pointer;
    }

    .sidebar-nav { flex: 1; padding: .5rem 0; overflow-y: auto; }
    .nav-item {
      display: flex; align-items: center; gap: .75rem; padding: .6rem 1rem;
      color: #94a3b8; text-decoration: none; transition: all .2s;
    }
    .nav-item:hover { background: #334155; color: #fff; }
    .nav-item.active { background: #3b82f6; color: #fff; }
    .nav-icon { font-size: 1.2rem; min-width: 1.5rem; text-align: center; }

    .sidebar-footer { padding: 1rem; border-top: 1px solid #334155; color: #64748b; }

    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #f8fafc; }

    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: .75rem 1.5rem; background: #fff; border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,.05);
    }
    .page-title { margin: 0; font-size: 1.1rem; color: #1e293b; }
    .api-badge {
      background: #dbeafe; color: #1d4ed8; padding: .2rem .6rem;
      border-radius: 999px; font-size: .75rem; font-weight: 600;
    }

    .content-area { flex: 1; padding: 1.5rem; overflow-y: auto; }
  `]
})
export class AppComponent {
  sidebarCollapsed = signal(false);

  navItems: NavItem[] = [
    { path: '/dashboard',  label: 'Dashboard',  icon: '📊' },
    { path: '/distritos',  label: 'Distritos',  icon: '🗺️' },
    { path: '/cargos',     label: 'Cargos',     icon: '💼' },
    { path: '/empleados',  label: 'Empleados',  icon: '👥' },
    { path: '/clientes',   label: 'Clientes',   icon: '🧑' },
    { path: '/categorias', label: 'Categorías', icon: '🏷️' },
    { path: '/productos',  label: 'Productos',  icon: '📦' },
    { path: '/boletas',    label: 'Boletas',    icon: '🧾' },
  ];

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }
}
