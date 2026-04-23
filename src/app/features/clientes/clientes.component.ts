import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService, DistritoService, CategoriaService } from '../../core/services/api.services';
import { Cliente, CreateCliente, Distrito, Categoria } from '../../core/models/models';

// ─────────────────────────────────────────────
// CLIENTES COMPONENT
// ─────────────────────────────────────────────
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>🧑‍💼 Clientes</h2><p class="sub">Gestión de clientes</p></div>
        <button class="btn-primary" (click)="openForm()">➕ Nuevo Cliente</button>
      </div>

      @if (alertMsg()) {
        <div class="alert" [class.s]="alertType()==='success'" [class.e]="alertType()==='error'">
          {{ alertMsg() }}
        </div>
      }

      <div class="search-bar">
        <input [(ngModel)]="searchTerm" (input)="applyFilter()"
               placeholder="Buscar por nombre, email..." class="search-input">
        <select [(ngModel)]="filterDistrito" (change)="applyFilter()" class="filter-sel">
          <option value="">Todos los distritos</option>
          @for (d of distritos(); track d.idDistrito) {
            <option [value]="d.idDistrito">{{ d.nombreDistrito }}</option>
          }
        </select>
      </div>

      @if (loading()) {
        <div class="loading">Cargando clientes...</div>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>ID</th><th>Nombre Completo</th><th>Teléfono</th><th>Email</th><th>Distrito</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              @for (c of filtered(); track c.idCliente) {
                <tr>
                  <td><code>{{ c.idCliente }}</code></td>
                  <td><strong>{{ c.nombres }} {{ c.apellidos }}</strong></td>
                  <td>{{ c.fono ?? '—' }}</td>
                  <td class="email">{{ c.email ?? '—' }}</td>
                  <td>{{ c.nombreDistrito }}</td>
                  <td class="actions">
                    <button class="btn-edit" (click)="editItem(c)">✏️</button>
                    <button class="btn-del"  (click)="deleteItem(c.idCliente)">🗑️</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="empty">No hay clientes registrados</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showForm()) {
        <div class="modal-overlay" (click)="closeForm()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editingId() ? 'Editar' : 'Nuevo' }} Cliente</h3>
              <button class="close-btn" (click)="closeForm()">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body">
              @if (!editingId()) {
                <div class="field">
                  <label>ID Cliente (6 chars) *</label>
                  <input formControlName="idCliente" maxlength="6" placeholder="CLI001">
                </div>
              }
              <div class="row2">
                <div class="field">
                  <label>Nombres *</label>
                  <input formControlName="nombres" placeholder="Juan Carlos">
                </div>
                <div class="field">
                  <label>Apellidos *</label>
                  <input formControlName="apellidos" placeholder="García">
                </div>
              </div>
              <div class="field">
                <label>Dirección</label>
                <input formControlName="direccion" placeholder="Av. Lima 123">
              </div>
              <div class="row2">
                <div class="field">
                  <label>Teléfono</label>
                  <input formControlName="fono" maxlength="9" placeholder="999888777">
                </div>
                <div class="field">
                  <label>Email</label>
                  <input formControlName="email" type="email" placeholder="correo@mail.com">
                </div>
              </div>
              <div class="field">
                <label>Distrito *</label>
                <select formControlName="idDistrito">
                  <option value="">-- Seleccione --</option>
                  @for (d of distritos(); track d.idDistrito) {
                    <option [value]="d.idDistrito">{{ d.nombreDistrito }}</option>
                  }
                </select>
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
    .page { max-width: 1000px; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
    .page-header h2 { margin:0; font-size:1.4rem; color:#1e293b; }
    .sub { color:#64748b; margin:.2rem 0 0; font-size:.85rem; }
    .search-bar { display:flex; gap:.75rem; margin-bottom:1rem; }
    .search-input { flex:1; padding:.5rem .75rem; border:1px solid #e2e8f0; border-radius:8px; }
    .filter-sel { padding:.5rem .75rem; border:1px solid #e2e8f0; border-radius:8px; background:#fff; }
    .loading { text-align:center; padding:3rem; color:#64748b; }
    .alert { padding:.75rem 1rem; border-radius:8px; margin-bottom:1rem; }
    .alert.s { background:#d1fae5; color:#065f46; }
    .alert.e { background:#fee2e2; color:#991b1b; }
    .table-wrap { overflow-x:auto; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.07); }
    .data-table { width:100%; border-collapse:collapse; background:#fff; }
    .data-table th { background:#f8fafc; padding:.75rem 1rem; text-align:left; font-size:.8rem; color:#64748b; border-bottom:1px solid #e2e8f0; }
    .data-table td { padding:.7rem 1rem; border-bottom:1px solid #f1f5f9; font-size:.875rem; }
    code { background:#f1f5f9; padding:.1rem .4rem; border-radius:4px; font-size:.8rem; }
    .email { font-size:.8rem; color:#64748b; }
    .empty { text-align:center; color:#94a3b8; padding:2rem; }
    .actions { display:flex; gap:.4rem; }
    .btn-primary { background:#3b82f6; color:#fff; border:none; padding:.5rem 1rem; border-radius:8px; cursor:pointer; }
    .btn-primary:hover { background:#2563eb; }
    .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .btn-secondary { background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; padding:.5rem 1rem; border-radius:8px; cursor:pointer; }
    .btn-edit, .btn-del { background:none; border:none; cursor:pointer; font-size:1rem; padding:.2rem .4rem; border-radius:4px; }
    .btn-edit:hover { background:#dbeafe; } .btn-del:hover { background:#fee2e2; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:100; }
    .modal { background:#fff; border-radius:16px; width:520px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid #e2e8f0; }
    .modal-header h3 { margin:0; color:#1e293b; }
    .close-btn { background:none; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8; }
    .modal-body { padding:1.5rem; display:flex; flex-direction:column; gap:.9rem; }
    .modal-footer { display:flex; justify-content:flex-end; gap:.5rem; padding-top:.5rem; }
    .field { display:flex; flex-direction:column; gap:.3rem; }
    .field label { font-size:.8rem; font-weight:600; color:#374151; }
    .field input, .field select { padding:.45rem .75rem; border:1px solid #e2e8f0; border-radius:8px; font-size:.875rem; }
    .row2 { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
  `]
})
export class ClientesComponent implements OnInit {
  items     = signal<Cliente[]>([]);
  filtered  = signal<Cliente[]>([]);
  distritos = signal<Distrito[]>([]);
  loading   = signal(true);
  saving    = signal(false);
  showForm  = signal(false);
  editingId = signal<string | null>(null);
  alertMsg  = signal<string | null>(null);
  alertType = signal<'success'|'error'>('success');
  searchTerm = '';
  filterDistrito = '';
  form: FormGroup;

  constructor(
    private svc: ClienteService,
    private distritoSvc: DistritoService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      idCliente:  ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      nombres:    ['', [Validators.required, Validators.minLength(2)]],
      apellidos:  ['', [Validators.required, Validators.minLength(2)]],
      direccion:  [null],
      fono:       [null],
      idDistrito: ['', Validators.required],
      email:      [null, Validators.email]
    });
  }

  ngOnInit() {
    this.loadData();
    this.distritoSvc.getAll().subscribe(r => this.distritos.set(r.data ?? []));
  }

  loadData() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: r => { this.items.set(r.data ?? []); this.filtered.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  applyFilter() {
    let res = this.items();
    if (this.searchTerm)
      res = res.filter(c =>
        `${c.nombres} ${c.apellidos}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(this.searchTerm.toLowerCase()));
    if (this.filterDistrito)
      res = res.filter(c => c.idDistrito === this.filterDistrito);
    this.filtered.set(res);
  }

  openForm() {
    this.form.reset(); this.editingId.set(null);
    this.form.get('idCliente')?.enable(); this.showForm.set(true);
  }

  editItem(c: Cliente) {
    this.editingId.set(c.idCliente); this.form.patchValue(c);
    this.form.get('idCliente')?.disable(); this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.form.reset(); }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    const obs = this.editingId()
      ? this.svc.update(this.editingId()!, val)
      : this.svc.create(val as CreateCliente);
    obs.subscribe({
      next: () => {
        this.showAlert(`Cliente ${this.editingId() ? 'actualizado' : 'creado'} exitosamente`, 'success');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: e => { this.showAlert(e.message, 'error'); this.saving.set(false); }
    });
  }

  deleteItem(id: string) {
    if (!confirm(`¿Eliminar cliente ${id}?`)) return;
    this.svc.delete(id).subscribe({
      next: () => { this.showAlert('Cliente eliminado', 'success'); this.loadData(); },
      error: e => this.showAlert(e.message, 'error')
    });
  }

  showAlert(msg: string, type: 'success'|'error') {
    this.alertMsg.set(msg); this.alertType.set(type); setTimeout(() => this.alertMsg.set(null), 3500);
  }
}

// ─────────────────────────────────────────────
// CATEGORIAS COMPONENT
// ─────────────────────────────────────────────
@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>🏷️ Categorías</h2><p class="sub">Gestión de categorías de productos</p></div>
        <button class="btn-primary" (click)="openForm()">➕ Nueva Categoría</button>
      </div>
      @if (alertMsg()) {
        <div class="alert" [class.s]="alertType()==='success'" [class.e]="alertType()==='error'">{{ alertMsg() }}</div>
      }
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Código</th><th>Nombre</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (c of items(); track c.codCate) {
              <tr>
                <td><code>{{ c.codCate }}</code></td>
                <td>{{ c.nombre }}</td>
                <td class="actions">
                  <button class="btn-edit" (click)="editItem(c)">✏️</button>
                  <button class="btn-del"  (click)="deleteItem(c.codCate)">🗑️</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="empty">No hay categorías registradas</td></tr>
            }
          </tbody>
        </table>
      </div>
      @if (showForm()) {
        <div class="modal-overlay" (click)="closeForm()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editingId() ? 'Editar' : 'Nueva' }} Categoría</h3>
              <button class="close-btn" (click)="closeForm()">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body">
              @if (!editingId()) {
                <div class="field">
                  <label>Código (3 chars) *</label>
                  <input formControlName="codCate" maxlength="3" placeholder="ELE">
                </div>
              }
              <div class="field">
                <label>Nombre Categoría *</label>
                <input formControlName="nombre" placeholder="Ej: Electrónica">
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeForm()">Cancelar</button>
                <button type="submit" class="btn-primary" [disabled]="form.invalid">
                  {{ editingId() ? 'Actualizar' : 'Crear' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 700px; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
    .page-header h2 { margin:0; font-size:1.4rem; color:#1e293b; }
    .sub { color:#64748b; margin:.2rem 0 0; font-size:.85rem; }
    .alert { padding:.75rem 1rem; border-radius:8px; margin-bottom:1rem; }
    .alert.s { background:#d1fae5; color:#065f46; }
    .alert.e { background:#fee2e2; color:#991b1b; }
    .table-wrap { overflow-x:auto; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.07); }
    .data-table { width:100%; border-collapse:collapse; background:#fff; }
    .data-table th { background:#f8fafc; padding:.75rem 1rem; text-align:left; font-size:.8rem; color:#64748b; border-bottom:1px solid #e2e8f0; }
    .data-table td { padding:.7rem 1rem; border-bottom:1px solid #f1f5f9; font-size:.9rem; }
    code { background:#f1f5f9; padding:.1rem .4rem; border-radius:4px; font-size:.8rem; }
    .empty { text-align:center; color:#94a3b8; padding:2rem; }
    .actions { display:flex; gap:.4rem; }
    .btn-primary { background:#3b82f6; color:#fff; border:none; padding:.5rem 1rem; border-radius:8px; cursor:pointer; }
    .btn-primary:hover { background:#2563eb; }
    .btn-primary:disabled { opacity:.5; }
    .btn-secondary { background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; padding:.5rem 1rem; border-radius:8px; cursor:pointer; }
    .btn-edit, .btn-del { background:none; border:none; cursor:pointer; font-size:1rem; padding:.2rem .4rem; border-radius:4px; }
    .btn-edit:hover { background:#dbeafe; } .btn-del:hover { background:#fee2e2; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:100; }
    .modal { background:#fff; border-radius:16px; width:440px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid #e2e8f0; }
    .modal-header h3 { margin:0; color:#1e293b; }
    .close-btn { background:none; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8; }
    .modal-body { padding:1.5rem; display:flex; flex-direction:column; gap:1rem; }
    .modal-footer { display:flex; justify-content:flex-end; gap:.5rem; }
    .field { display:flex; flex-direction:column; gap:.3rem; }
    .field label { font-size:.8rem; font-weight:600; color:#374151; }
    .field input { padding:.5rem .75rem; border:1px solid #e2e8f0; border-radius:8px; font-size:.9rem; }
  `]
})
export class CategoriasComponent implements OnInit {
  items     = signal<Categoria[]>([]);
  showForm  = signal(false);
  editingId = signal<string | null>(null);
  alertMsg  = signal<string | null>(null);
  alertType = signal<'success'|'error'>('success');
  form: FormGroup;

  constructor(private svc: CategoriaService, private fb: FormBuilder) {
    this.form = this.fb.group({
      codCate: ['', [Validators.required, Validators.maxLength(3)]],
      nombre:  ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() { this.loadData(); }
  loadData() { this.svc.getAll().subscribe(r => this.items.set(r.data ?? [])); }

  openForm() {
    this.form.reset(); this.editingId.set(null);
    this.form.get('codCate')?.enable(); this.showForm.set(true);
  }

  editItem(c: Categoria) {
    this.editingId.set(c.codCate); this.form.patchValue(c);
    this.form.get('codCate')?.disable(); this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.form.reset(); }

  onSubmit() {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const obs = this.editingId()
      ? this.svc.update(this.editingId()!, val)
      : this.svc.create(val);
    obs.subscribe({
      next: () => {
        this.showAlert(`Categoría ${this.editingId() ? 'actualizada' : 'creada'} exitosamente`, 'success');
        this.closeForm(); this.loadData();
      },
      error: e => this.showAlert(e.message, 'error')
    });
  }

  deleteItem(id: string) {
    if (!confirm(`¿Eliminar categoría ${id}?`)) return;
    this.svc.delete(id).subscribe({
      next: () => { this.showAlert('Categoría eliminada', 'success'); this.loadData(); },
      error: e => this.showAlert(e.message, 'error')
    });
  }

  showAlert(msg: string, type: 'success'|'error') {
    this.alertMsg.set(msg); this.alertType.set(type); setTimeout(() => this.alertMsg.set(null), 3500);
  }
}
