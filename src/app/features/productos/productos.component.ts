import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService, CategoriaService } from '../../core/services/api.services';
import { Producto, CreateProducto, Categoria } from '../../core/models/models';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>📦 Productos</h2>
          <p class="subtitle">Gestión de productos del catálogo</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="loadStockBajo()">⚠️ Stock Bajo</button>
          <button class="btn-primary" (click)="openForm()">➕ Nuevo</button>
        </div>
      </div>

      <!-- Search bar -->
      <div class="search-bar">
        <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar por descripción o categoría..."
               class="search-input" (input)="onSearch()">
        <select [(ngModel)]="filterCategoria" (change)="onFilter()" class="filter-select">
          <option value="">Todas las categorías</option>
          @for (cat of categorias(); track cat.codCate) {
            <option [value]="cat.codCate">{{ cat.nombre }}</option>
          }
        </select>
      </div>

      <!-- Alert messages -->
      @if (alertMsg()) {
        <div class="alert" [class.alert-success]="alertType() === 'success'"
             [class.alert-error]="alertType() === 'error'">
          {{ alertMsg() }}
        </div>
      }

      <!-- Table -->
      @if (loading()) {
        <div class="skeleton-rows">
          @for (i of [1,2,3,4]; track i) { <div class="skeleton-row"></div> }
        </div>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Descripción</th><th>Precio</th>
                <th>Stock Actual</th><th>Stock Mín.</th><th>Vencimiento</th>
                <th>Categoría</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredProductos(); track p.idProducto) {
                <tr [class.stock-alert]="isStockBajo(p)">
                  <td><code>{{ p.idProducto }}</code></td>
                  <td>{{ p.descripcion }}</td>
                  <td class="price">S/. {{ p.precioVenta | number:'1.2-2' }}</td>
                  <td [class.low]="isStockBajo(p)">{{ p.stockActual ?? '-' }}</td>
                  <td>{{ p.stockMinimo ?? '-' }}</td>
                  <td>{{ p.fechaVenc ?? '-' }}</td>
                  <td><span class="badge">{{ p.nombreCategoria }}</span></td>
                  <td class="actions">
                    <button class="btn-edit" (click)="editItem(p)">✏️</button>
                    <button class="btn-del" (click)="deleteItem(p.idProducto)">🗑️</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="empty">No hay productos registrados</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal form -->
      @if (showForm()) {
        <div class="modal-overlay" (click)="closeForm()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editingId() ? 'Editar' : 'Nuevo' }} Producto</h3>
              <button class="close-btn" (click)="closeForm()">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body">
              @if (!editingId()) {
                <div class="field">
                  <label>ID Producto *</label>
                  <input formControlName="idProducto" maxlength="6" placeholder="Ej: PRD001">
                  @if (form.get('idProducto')?.invalid && form.get('idProducto')?.touched) {
                    <span class="err">ID obligatorio (6 chars)</span>
                  }
                </div>
              }
              <div class="field">
                <label>Descripción *</label>
                <input formControlName="descripcion" placeholder="Descripción del producto">
              </div>
              <div class="row-fields">
                <div class="field">
                  <label>Precio Venta *</label>
                  <input type="number" formControlName="precioVenta" step="0.01" min="0.01">
                </div>
                <div class="field">
                  <label>Stock Actual</label>
                  <input type="number" formControlName="stockActual" min="0">
                </div>
                <div class="field">
                  <label>Stock Mínimo</label>
                  <input type="number" formControlName="stockMinimo" min="0">
                </div>
              </div>
              <div class="row-fields">
                <div class="field">
                  <label>Fecha Vencimiento</label>
                  <input type="date" formControlName="fechaVenc">
                </div>
                <div class="field">
                  <label>Categoría *</label>
                  <select formControlName="codCate">
                    <option value="">-- Seleccione --</option>
                    @for (cat of categorias(); track cat.codCate) {
                      <option [value]="cat.codCate">{{ cat.nombre }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeForm()">Cancelar</button>
                <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
                  {{ saving() ? 'Guardando...' : (editingId() ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h2 { margin: 0; font-size: 1.4rem; color: #1e293b; }
    .subtitle { color: #64748b; margin: .2rem 0 0; font-size: .85rem; }
    .header-actions { display: flex; gap: .5rem; }

    .search-bar { display: flex; gap: .75rem; margin-bottom: 1rem; }
    .search-input { flex: 1; padding: .5rem .75rem; border: 1px solid #e2e8f0; border-radius: 8px; }
    .filter-select { padding: .5rem .75rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }

    .alert { padding: .75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
    .alert-success { background: #d1fae5; color: #065f46; }
    .alert-error { background: #fee2e2; color: #991b1b; }

    .skeleton-rows { display: flex; flex-direction: column; gap: .5rem; }
    .skeleton-row { height: 48px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); border-radius: 8px; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

    .table-wrap { overflow-x: auto; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .data-table { width: 100%; border-collapse: collapse; background: #fff; }
    .data-table th { background: #f8fafc; padding: .75rem 1rem; text-align: left; font-size: .8rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: .7rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: .9rem; }
    .data-table tr:hover td { background: #f8fafc; }
    .data-table tr.stock-alert td { background: #fff7ed; }
    code { background: #f1f5f9; padding: .1rem .4rem; border-radius: 4px; font-size: .8rem; }
    .price { font-weight: 600; color: #059669; }
    td.low { color: #dc2626; font-weight: 600; }
    .badge { background: #dbeafe; color: #1d4ed8; padding: .15rem .5rem; border-radius: 999px; font-size: .75rem; }
    .empty { text-align: center; color: #94a3b8; padding: 2rem; }
    .actions { display: flex; gap: .4rem; }

    .btn-primary { background: #3b82f6; color: #fff; border: none; padding: .5rem 1rem; border-radius: 8px; cursor: pointer; font-size: .9rem; }
    .btn-primary:hover { background: #2563eb; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: .5rem 1rem; border-radius: 8px; cursor: pointer; font-size: .9rem; }
    .btn-edit, .btn-del { background: none; border: none; cursor: pointer; font-size: 1rem; padding: .2rem .4rem; border-radius: 4px; }
    .btn-edit:hover { background: #dbeafe; }
    .btn-del:hover { background: #fee2e2; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { background: #fff; border-radius: 16px; width: 560px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
    .modal-header h3 { margin: 0; color: #1e293b; }
    .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: .5rem; padding-top: .5rem; }
    .field { display: flex; flex-direction: column; gap: .3rem; }
    .field label { font-size: .8rem; font-weight: 600; color: #374151; }
    .field input, .field select { padding: .5rem .75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: .9rem; }
    .field input:focus, .field select:focus { outline: none; border-color: #3b82f6; }
    .row-fields { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .75rem; }
    .err { color: #dc2626; font-size: .75rem; }
  `]
})
export class ProductosComponent implements OnInit {
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  filteredProductos = signal<Producto[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  alertMsg = signal<string | null>(null);
  alertType = signal<'success'|'error'>('success');
  searchTerm = '';
  filterCategoria = '';

  form: FormGroup;

  constructor(
    private productoSvc: ProductoService,
    private categoriaSvc: CategoriaService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      idProducto:  ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      descripcion: ['', [Validators.required, Validators.minLength(2)]],
      precioVenta: [0, [Validators.required, Validators.min(0.01)]],
      stockActual: [null],
      stockMinimo: [null],
      fechaVenc:   [null],
      codCate:     ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
    this.categoriaSvc.getAll().subscribe(r => this.categorias.set(r.data ?? []));
  }

  loadData() {
    this.loading.set(true);
    this.productoSvc.getAll().subscribe({
      next: r => { this.productos.set(r.data ?? []); this.filteredProductos.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadStockBajo() {
    this.loading.set(true);
    this.productoSvc.getStockBajo().subscribe({
      next: r => { this.filteredProductos.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch() { this.applyFilter(); }
  onFilter() { this.applyFilter(); }

  applyFilter() {
    let result = this.productos();
    if (this.searchTerm)
      result = result.filter(p => p.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.nombreCategoria.toLowerCase().includes(this.searchTerm.toLowerCase()));
    if (this.filterCategoria)
      result = result.filter(p => p.codCate === this.filterCategoria);
    this.filteredProductos.set(result);
  }

  isStockBajo(p: Producto): boolean {
    return p.stockActual !== undefined && p.stockMinimo !== undefined &&
      p.stockActual !== null && p.stockMinimo !== null &&
      p.stockActual <= p.stockMinimo;
  }

  openForm() {
    this.form.reset(); this.editingId.set(null);
    this.form.get('idProducto')?.enable();
    this.showForm.set(true);
  }

  editItem(p: Producto) {
    this.editingId.set(p.idProducto);
    this.form.get('idProducto')?.disable();
    this.form.patchValue({ ...p });
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.form.reset(); }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = { ...this.form.getRawValue() };
    const obs = this.editingId()
      ? this.productoSvc.update(this.editingId()!, val)
      : this.productoSvc.create(val as CreateProducto);

    obs.subscribe({
      next: () => {
        this.showAlert(`Producto ${this.editingId() ? 'actualizado' : 'creado'} exitosamente`, 'success');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: (e) => { this.showAlert(e.message, 'error'); this.saving.set(false); }
    });
  }

  deleteItem(id: string) {
    if (!confirm(`¿Eliminar producto ${id}?`)) return;
    this.productoSvc.delete(id).subscribe({
      next: () => { this.showAlert('Producto eliminado', 'success'); this.loadData(); },
      error: (e) => this.showAlert(e.message, 'error')
    });
  }

  showAlert(msg: string, type: 'success'|'error') {
    this.alertMsg.set(msg); this.alertType.set(type);
    setTimeout(() => this.alertMsg.set(null), 4000);
  }
}
