import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BoletaService, ClienteService, EmpleadoService, ProductoService } from '../../core/services/api.services';
import { Boleta, CreateBoleta, Cliente, Empleado, Producto } from '../../core/models/models';

@Component({
  selector: 'app-boletas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>🧾 Boletas</h2>
          <p class="subtitle">Gestión de ventas y comprobantes</p>
        </div>
        <div class="header-actions">
          <input type="date" [(ngModel)]="filtroDesde" class="date-input">
          <input type="date" [(ngModel)]="filtroHasta" class="date-input">
          <button class="btn-secondary" (click)="filtrarPorFecha()">🔍 Filtrar</button>
          <button class="btn-primary" (click)="openForm()">➕ Nueva Boleta</button>
        </div>
      </div>

      @if (alertMsg()) {
        <div class="alert" [class.success]="alertType()==='success'" [class.error]="alertType()==='error'">
          {{ alertMsg() }}
        </div>
      }

      @if (loading()) {
        <div class="loading-state">Cargando boletas...</div>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>N° Boleta</th><th>Fecha</th><th>Cliente</th><th>Empleado</th><th>Estado</th><th>Total</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              @for (b of boletas(); track b.numBoleta) {
                <tr>
                  <td><code>{{ b.numBoleta }}</code></td>
                  <td>{{ b.fechaEmi }}</td>
                  <td>{{ b.nombreCliente }}</td>
                  <td>{{ b.nombreEmpleado }}</td>
                  <td><span class="badge" [class]="getEstadoClass(b.estadoBoleta)">{{ b.estadoBoleta }}</span></td>
                  <td class="price">S/. {{ b.total | number:'1.2-2' }}</td>
                  <td class="actions">
                    <button class="btn-view" (click)="viewDetail(b)">👁️</button>
                    <button class="btn-edit" (click)="editEstado(b)">📋</button>
                    <button class="btn-del" (click)="deleteItem(b.numBoleta)">🗑️</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="empty">No hay boletas registradas</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Detail Modal -->
      @if (selectedBoleta()) {
        <div class="modal-overlay" (click)="selectedBoleta.set(null)">
          <div class="modal large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Boleta {{ selectedBoleta()!.numBoleta }}</h3>
              <button class="close-btn" (click)="selectedBoleta.set(null)">✕</button>
            </div>
            <div class="detail-body">
              <div class="detail-meta">
                <div><strong>Fecha:</strong> {{ selectedBoleta()!.fechaEmi }}</div>
                <div><strong>Cliente:</strong> {{ selectedBoleta()!.nombreCliente }}</div>
                <div><strong>Empleado:</strong> {{ selectedBoleta()!.nombreEmpleado }}</div>
                <div><strong>Estado:</strong>
                  <span class="badge" [class]="getEstadoClass(selectedBoleta()!.estadoBoleta)">
                    {{ selectedBoleta()!.estadoBoleta }}
                  </span>
                </div>
              </div>
              <table class="detail-table">
                <thead><tr><th>Producto</th><th>Cantidad</th><th>Importe</th></tr></thead>
                <tbody>
                  @for (d of selectedBoleta()!.detalles; track d.idProducto) {
                    <tr>
                      <td>{{ d.descripcionProducto }}</td>
                      <td>{{ d.cantidad }}</td>
                      <td class="price">S/. {{ d.importe | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr><td colspan="2"><strong>TOTAL</strong></td>
                    <td class="price total"><strong>S/. {{ selectedBoleta()!.total | number:'1.2-2' }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- Create Boleta Modal -->
      @if (showForm()) {
        <div class="modal-overlay" (click)="closeForm()">
          <div class="modal large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Nueva Boleta</h3>
              <button class="close-btn" (click)="closeForm()">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body">
              <div class="row-fields">
                <div class="field">
                  <label>N° Boleta *</label>
                  <input formControlName="numBoleta" maxlength="8" placeholder="BOL00001">
                </div>
                <div class="field">
                  <label>Fecha Emisión *</label>
                  <input type="date" formControlName="fechaEmi">
                </div>
              </div>
              <div class="row-fields">
                <div class="field">
                  <label>Cliente *</label>
                  <select formControlName="idCliente">
                    <option value="">-- Seleccione --</option>
                    @for (c of clientes(); track c.idCliente) {
                      <option [value]="c.idCliente">{{ c.nombres }} {{ c.apellidos }}</option>
                    }
                  </select>
                </div>
                <div class="field">
                  <label>Empleado *</label>
                  <select formControlName="codEmple">
                    <option value="">-- Seleccione --</option>
                    @for (e of empleados(); track e.codEmple) {
                      <option [value]="e.codEmple">{{ e.nombres }} {{ e.apellidos }}</option>
                    }
                  </select>
                </div>
                <div class="field">
                  <label>Estado *</label>
                  <select formControlName="estadoBoleta">
                    <option value="EMITIDO">EMITIDO</option>
                    <option value="PAGADO">PAGADO</option>
                    <option value="ANULADO">ANULADO</option>
                  </select>
                </div>
              </div>

              <!-- Detalles -->
              <div class="detalles-section">
                <div class="detalles-header">
                  <strong>Detalle de Productos</strong>
                  <button type="button" class="btn-add-det" (click)="addDetalle()">+ Agregar</button>
                </div>
                <div formArrayName="detalles">
                  @for (det of detallesArray.controls; track $index) {
                    <div [formGroupName]="$index" class="detalle-row">
                      <select formControlName="idProducto" (change)="onProductoChange($index)" class="det-select">
                        <option value="">-- Producto --</option>
                        @for (p of productos(); track p.idProducto) {
                          <option [value]="p.idProducto">{{ p.descripcion }}</option>
                        }
                      </select>
                      <input type="number" formControlName="cantidad" min="1" placeholder="Cant." class="det-input-sm" (change)="calcImporte($index)">
                      <input type="number" formControlName="importe" step="0.01" placeholder="Importe" class="det-input-sm">
                      <button type="button" class="btn-rem" (click)="removeDetalle($index)">✕</button>
                    </div>
                  }
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeForm()">Cancelar</button>
                <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
                  {{ saving() ? 'Guardando...' : 'Crear Boleta' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Estado Modal -->
      @if (showEstadoForm()) {
        <div class="modal-overlay" (click)="showEstadoForm.set(false)">
          <div class="modal small" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Cambiar Estado</h3>
              <button class="close-btn" (click)="showEstadoForm.set(false)">✕</button>
            </div>
            <div class="modal-body">
              <div class="field">
                <label>Nuevo Estado</label>
                <select [(ngModel)]="nuevoEstado" class="full-select">
                  <option value="EMITIDO">EMITIDO</option>
                  <option value="PAGADO">PAGADO</option>
                  <option value="ANULADO">ANULADO</option>
                </select>
              </div>
              <div class="modal-footer">
                <button class="btn-secondary" (click)="showEstadoForm.set(false)">Cancelar</button>
                <button class="btn-primary" (click)="guardarEstado()">Actualizar</button>
              </div>
            </div>
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
    .header-actions { display: flex; gap: .5rem; align-items: center; }
    .date-input { padding: .4rem .6rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: .85rem; }
    .loading-state { text-align: center; padding: 3rem; color: #64748b; }
    .alert { padding: .75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
    .alert.success { background: #d1fae5; color: #065f46; }
    .alert.error { background: #fee2e2; color: #991b1b; }
    .table-wrap { overflow-x: auto; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .data-table { width: 100%; border-collapse: collapse; background: #fff; }
    .data-table th { background: #f8fafc; padding: .75rem 1rem; text-align: left; font-size: .8rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: .7rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: .9rem; }
    code { background: #f1f5f9; padding: .1rem .4rem; border-radius: 4px; font-size: .8rem; }
    .price { font-weight: 600; color: #059669; }
    .total { font-size: 1rem; }
    .empty { text-align: center; color: #94a3b8; padding: 2rem; }
    .actions { display: flex; gap: .4rem; }
    .badge { padding: .2rem .6rem; border-radius: 999px; font-size: .75rem; font-weight: 600; }
    .badge.emitido { background: #dbeafe; color: #1d4ed8; }
    .badge.pagado { background: #d1fae5; color: #065f46; }
    .badge.anulado { background: #fee2e2; color: #991b1b; }
    .btn-primary { background: #3b82f6; color: #fff; border: none; padding: .5rem 1rem; border-radius: 8px; cursor: pointer; }
    .btn-primary:hover { background: #2563eb; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: .5rem 1rem; border-radius: 8px; cursor: pointer; }
    .btn-view, .btn-edit, .btn-del { background: none; border: none; cursor: pointer; font-size: 1rem; padding: .2rem .4rem; border-radius: 4px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { background: #fff; border-radius: 16px; width: 480px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal.large { width: 700px; }
    .modal.small { width: 360px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
    .modal-header h3 { margin: 0; color: #1e293b; }
    .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: .5rem; padding-top: .5rem; }
    .field { display: flex; flex-direction: column; gap: .3rem; }
    .field label { font-size: .8rem; font-weight: 600; color: #374151; }
    .field input, .field select { padding: .5rem .75rem; border: 1px solid #e2e8f0; border-radius: 8px; }
    .full-select { width: 100%; padding: .5rem .75rem; border: 1px solid #e2e8f0; border-radius: 8px; }
    .row-fields { display: grid; grid-template-columns: repeat(3, 1fr); gap: .75rem; }
    .detail-body { padding: 1.25rem 1.5rem; }
    .detail-meta { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; margin-bottom: 1rem; font-size: .9rem; }
    .detail-table { width: 100%; border-collapse: collapse; }
    .detail-table th, .detail-table td { padding: .5rem .75rem; border-bottom: 1px solid #e2e8f0; text-align: left; }
    .detalles-section { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
    .detalles-header { display: flex; justify-content: space-between; margin-bottom: .75rem; font-size: .9rem; }
    .detalle-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: .5rem; margin-bottom: .5rem; align-items: center; }
    .det-select, .det-input-sm { padding: .4rem .5rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: .85rem; }
    .btn-add-det { background: #dcfce7; color: #166534; border: none; padding: .3rem .7rem; border-radius: 6px; cursor: pointer; }
    .btn-rem { background: #fee2e2; color: #dc2626; border: none; padding: .3rem .5rem; border-radius: 6px; cursor: pointer; }
  `]
})
export class BoletasComponent implements OnInit {
  boletas = signal<Boleta[]>([]);
  clientes = signal<Cliente[]>([]);
  empleados = signal<Empleado[]>([]);
  productos = signal<Producto[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  showEstadoForm = signal(false);
  selectedBoleta = signal<Boleta | null>(null);
  alertMsg = signal<string | null>(null);
  alertType = signal<'success'|'error'>('success');
  editingBoletaId = signal<string | null>(null);
  nuevoEstado = 'EMITIDO';
  filtroDesde = '';
  filtroHasta = '';
  form: FormGroup;

  constructor(
    private boletaSvc: BoletaService,
    private clienteSvc: ClienteService,
    private empleadoSvc: EmpleadoService,
    private productoSvc: ProductoService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      numBoleta:    ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      fechaEmi:     ['', Validators.required],
      idCliente:    ['', Validators.required],
      codEmple:     ['', Validators.required],
      estadoBoleta: ['EMITIDO', Validators.required],
      detalles:     this.fb.array([])
    });
  }

  get detallesArray() { return this.form.get('detalles') as FormArray; }

  ngOnInit() {
    this.loadData();
    this.clienteSvc.getAll().subscribe(r => this.clientes.set(r.data ?? []));
    this.empleadoSvc.getAll().subscribe(r => this.empleados.set(r.data ?? []));
    this.productoSvc.getAll().subscribe(r => this.productos.set(r.data ?? []));
  }

  loadData() {
    this.loading.set(true);
    this.boletaSvc.getAll().subscribe({
      next: r => { this.boletas.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filtrarPorFecha() {
    if (!this.filtroDesde || !this.filtroHasta) return;
    this.loading.set(true);
    this.boletaSvc.getByFecha(this.filtroDesde, this.filtroHasta).subscribe({
      next: r => { this.boletas.set(r.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getEstadoClass(estado: string): string {
    return estado?.toLowerCase() ?? '';
  }

  viewDetail(b: Boleta) { this.selectedBoleta.set(b); }

  editEstado(b: Boleta) {
    this.editingBoletaId.set(b.numBoleta);
    this.nuevoEstado = b.estadoBoleta;
    this.showEstadoForm.set(true);
  }

  guardarEstado() {
    if (!this.editingBoletaId()) return;
    this.boletaSvc.updateEstado(this.editingBoletaId()!, { estadoBoleta: this.nuevoEstado }).subscribe({
      next: () => { this.showAlert('Estado actualizado', 'success'); this.showEstadoForm.set(false); this.loadData(); },
      error: e => this.showAlert(e.message, 'error')
    });
  }

  openForm() {
    this.form.reset({ estadoBoleta: 'EMITIDO' });
    while (this.detallesArray.length) this.detallesArray.removeAt(0);
    this.addDetalle();
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  addDetalle() {
    this.detallesArray.push(this.fb.group({
      idProducto: ['', Validators.required],
      cantidad:   [1, [Validators.required, Validators.min(1)]],
      importe:    [0, [Validators.required, Validators.min(0.01)]]
    }));
  }

  removeDetalle(i: number) { this.detallesArray.removeAt(i); }

  onProductoChange(i: number) {
    const idProducto = this.detallesArray.at(i).get('idProducto')?.value;
    const producto = this.productos().find(p => p.idProducto === idProducto);
    if (producto) {
      const cantidad = this.detallesArray.at(i).get('cantidad')?.value ?? 1;
      this.detallesArray.at(i).patchValue({ importe: producto.precioVenta * cantidad });
    }
  }

  calcImporte(i: number) {
    const idProducto = this.detallesArray.at(i).get('idProducto')?.value;
    const producto = this.productos().find(p => p.idProducto === idProducto);
    if (producto) {
      const cantidad = this.detallesArray.at(i).get('cantidad')?.value ?? 1;
      this.detallesArray.at(i).patchValue({ importe: producto.precioVenta * cantidad });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue() as CreateBoleta;
    this.boletaSvc.create(val).subscribe({
      next: () => { this.showAlert('Boleta creada exitosamente', 'success'); this.closeForm(); this.loadData(); this.saving.set(false); },
      error: e => { this.showAlert(e.message, 'error'); this.saving.set(false); }
    });
  }

  deleteItem(id: string) {
    if (!confirm(`¿Eliminar boleta ${id}?`)) return;
    this.boletaSvc.delete(id).subscribe({
      next: () => { this.showAlert('Boleta eliminada', 'success'); this.loadData(); },
      error: e => this.showAlert(e.message, 'error')
    });
  }

  showAlert(msg: string, type: 'success'|'error') {
    this.alertMsg.set(msg); this.alertType.set(type);
    setTimeout(() => this.alertMsg.set(null), 4000);
  }
}
