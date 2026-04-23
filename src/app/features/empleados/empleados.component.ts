import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpleadoService, CargoService, DistritoService } from '../../core/services/api.services';
import { Empleado, CreateEmpleado, Cargo, Distrito } from '../../core/models/models';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>👥 Empleados</h2><p class="sub">Gestión de personal</p></div>
        <button class="btn-primary" (click)="openForm()">➕ Nuevo Empleado</button>
      </div>

      @if (alertMsg()) {
        <div class="alert" [class.s]="alertType()==='success'" [class.e]="alertType()==='error'">
          {{ alertMsg() }}
        </div>
      }

      <div class="search-bar">
        <input [(ngModel)]="searchTerm" (input)="applyFilter()"
               placeholder="Buscar por nombre, DNI..." class="search-input">
        <select [(ngModel)]="filterCargo" (change)="applyFilter()" class="filter-sel">
          <option value="">Todos los cargos</option>
          @for (c of cargos(); track c.codCargo) {
            <option [value]="c.codCargo">{{ c.nombreCargo }}</option>
          }
        </select>
      </div>

      @if (loading()) {
        <div class="loading">Cargando empleados...</div>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th><th>Nombre Completo</th><th>DNI</th>
                <th>Cargo</th><th>Distrito</th><th>Email</th>
                <th>Sueldo</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (e of filtered(); track e.codEmple) {
                <tr>
                  <td><code>{{ e.codEmple }}</code></td>
                  <td><strong>{{ e.nombres }} {{ e.apellidos }}</strong></td>
                  <td>{{ e.dniEmple }}</td>
                  <td><span class="badge-cargo">{{ e.nombreCargo }}</span></td>
                  <td>{{ e.nombreDistrito }}</td>
                  <td class="email">{{ e.email }}</td>
                  <td class="price">S/. {{ e.sueldoBasico | number:'1.2-2' }}</td>
                  <td class="actions">
                    <button class="btn-edit" (click)="editItem(e)">✏️</button>
                    <button class="btn-del"  (click)="deleteItem(e.codEmple)">🗑️</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="empty">No hay empleados registrados</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showForm()) {
        <div class="modal-overlay" (click)="closeForm()">
          <div class="modal large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editingId() ? 'Editar' : 'Nuevo' }} Empleado</h3>
              <button class="close-btn" (click)="closeForm()">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body">

              @if (!editingId()) {
                <div class="field">
                  <label>Código Empleado (5 chars) *</label>
                  <input formControlName="codEmple" maxlength="5" placeholder="EMP01">
                </div>
              }

              <div class="row2">
                <div class="field">
                  <label>Nombres *</label>
                  <input formControlName="nombres" placeholder="Juan Carlos">
                </div>
                <div class="field">
                  <label>Apellidos *</label>
                  <input formControlName="apellidos" placeholder="García López">
                </div>
              </div>

              <div class="row3">
                <div class="field">
                  <label>DNI (8 dígitos) *</label>
                  <input formControlName="dniEmple" maxlength="8" placeholder="12345678">
                </div>
                <div class="field">
                  <label>Estado Civil *</label>
                  <select formControlName="estadoCivil">
                    <option value="S">Soltero</option>
                    <option value="C">Casado</option>
                    <option value="D">Divorciado</option>
                    <option value="V">Viudo</option>
                  </select>
                </div>
                <div class="field">
                  <label>Nivel Educativo *</label>
                  <select formControlName="nivelEduca">
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Tecnico">Técnico</option>
                    <option value="Universitario">Universitario</option>
                    <option value="Postgrado">Postgrado</option>
                  </select>
                </div>
              </div>

              <div class="field">
                <label>Dirección *</label>
                <input formControlName="direccion" placeholder="Av. Principal 123">
              </div>

              <div class="row3">
                <div class="field">
                  <label>Teléfono *</label>
                  <input formControlName="telefono" placeholder="999888777">
                </div>
                <div class="field">
                  <label>Email *</label>
                  <input formControlName="email" type="email" placeholder="correo@empresa.com">
                </div>
                <div class="field">
                  <label>Fecha Ingreso *</label>
                  <input formControlName="fechaIngreso" type="date">
                </div>
              </div>

              <div class="row3">
                <div class="field">
                  <label>Sueldo Básico *</label>
                  <input formControlName="sueldoBasico" type="number" step="0.01" min="0">
                </div>
                <div class="field">
                  <label>Cargo *</label>
                  <select formControlName="codCargo">
                    <option value="">-- Seleccione --</option>
                    @for (c of cargos(); track c.codCargo) {
                      <option [value]="c.codCargo">{{ c.nombreCargo }}</option>
                    }
                  </select>
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
    .price { font-weight:600; color:#059669; }
    .badge-cargo { background:#e0f2fe; color:#0369a1; padding:.15rem .5rem; border-radius:999px; font-size:.75rem; }
    .empty { text-align:center; color:#94a3b8; padding:2rem; }
    .actions { display:flex; gap:.4rem; }
    .btn-primary { background:#3b82f6; color:#fff; border:none; padding:.5rem 1rem; border-radius:8px; cursor:pointer; }
    .btn-primary:hover { background:#2563eb; }
    .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .btn-secondary { background:#f1f5f9; color:#475569; border:1px solid #e2e8f0; padding:.5rem 1rem; border-radius:8px; cursor:pointer; }
    .btn-edit, .btn-del { background:none; border:none; cursor:pointer; font-size:1rem; padding:.2rem .4rem; border-radius:4px; }
    .btn-edit:hover { background:#dbeafe; }
    .btn-del:hover { background:#fee2e2; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:100; }
    .modal { background:#fff; border-radius:16px; width:480px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,.2); }
    .modal.large { width:680px; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid #e2e8f0; }
    .modal-header h3 { margin:0; color:#1e293b; }
    .close-btn { background:none; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8; }
    .modal-body { padding:1.5rem; display:flex; flex-direction:column; gap:.9rem; max-height:80vh; overflow-y:auto; }
    .modal-footer { display:flex; justify-content:flex-end; gap:.5rem; padding-top:.5rem; }
    .field { display:flex; flex-direction:column; gap:.3rem; }
    .field label { font-size:.8rem; font-weight:600; color:#374151; }
    .field input, .field select { padding:.45rem .75rem; border:1px solid #e2e8f0; border-radius:8px; font-size:.875rem; }
    .row2 { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
    .row3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:.75rem; }
  `]
})
export class EmpleadosComponent implements OnInit {
  items    = signal<Empleado[]>([]);
  filtered = signal<Empleado[]>([]);
  cargos   = signal<Cargo[]>([]);
  distritos = signal<Distrito[]>([]);
  loading  = signal(true);
  saving   = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  alertMsg  = signal<string | null>(null);
  alertType = signal<'success'|'error'>('success');
  searchTerm = '';
  filterCargo = '';
  form: FormGroup;

  constructor(
    private svc: EmpleadoService,
    private cargoSvc: CargoService,
    private distritoSvc: DistritoService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      codEmple:    ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      nombres:     ['', [Validators.required, Validators.minLength(2)]],
      apellidos:   ['', [Validators.required, Validators.minLength(2)]],
      dniEmple:    ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      direccion:   ['', Validators.required],
      estadoCivil: ['S', Validators.required],
      nivelEduca:  ['Universitario', Validators.required],
      telefono:    ['', Validators.required],
      email:       ['', [Validators.required, Validators.email]],
      sueldoBasico:['', [Validators.required, Validators.min(0)]],
      fechaIngreso:['', Validators.required],
      idDistrito:  ['', Validators.required],
      codCargo:    ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
    this.cargoSvc.getAll().subscribe(r => this.cargos.set(r.data ?? []));
    this.distritoSvc.getAll().subscribe(r => this.distritos.set(r.data ?? []));
  }

  loadData() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: r => {
        this.items.set(r.data ?? []);
        this.filtered.set(r.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter() {
    let res = this.items();
    if (this.searchTerm)
      res = res.filter(e =>
        `${e.nombres} ${e.apellidos}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        e.dniEmple.includes(this.searchTerm));
    if (this.filterCargo)
      res = res.filter(e => e.codCargo === this.filterCargo);
    this.filtered.set(res);
  }

  openForm() {
    this.form.reset({ estadoCivil: 'S', nivelEduca: 'Universitario' });
    this.form.get('codEmple')?.enable();
    this.editingId.set(null);
    this.showForm.set(true);
  }

  editItem(e: Empleado) {
    this.editingId.set(e.codEmple);
    this.form.patchValue({ ...e });
    this.form.get('codEmple')?.disable();
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.form.reset(); }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    const obs = this.editingId()
      ? this.svc.update(this.editingId()!, val)
      : this.svc.create(val as CreateEmpleado);
    obs.subscribe({
      next: () => {
        this.showAlert(`Empleado ${this.editingId() ? 'actualizado' : 'creado'} exitosamente`, 'success');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: e => { this.showAlert(e.message, 'error'); this.saving.set(false); }
    });
  }

  deleteItem(id: string) {
    if (!confirm(`¿Eliminar empleado ${id}?`)) return;
    this.svc.delete(id).subscribe({
      next: () => { this.showAlert('Empleado eliminado', 'success'); this.loadData(); },
      error: e => this.showAlert(e.message, 'error')
    });
  }

  showAlert(msg: string, type: 'success'|'error') {
    this.alertMsg.set(msg); this.alertType.set(type);
    setTimeout(() => this.alertMsg.set(null), 3500);
  }
}
