import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DistritoService } from '../../core/services/api.services';
import { Distrito } from '../../core/models/models';


// Shared styles constant
const SHARED_STYLES = `
  .page { max-width: 900px; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
  .page-header h2 { margin: 0; font-size: 1.4rem; color: #1e293b; }
  .sub { color: #64748b; margin: .2rem 0 0; font-size: .85rem; }
  .alert { padding: .7rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
  .alert.s { background: #d1fae5; color: #065f46; }
  .alert.e { background: #fee2e2; color: #991b1b; }
  .table-wrap { overflow-x: auto; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
  .data-table { width: 100%; border-collapse: collapse; background: #fff; }
  .data-table th { background: #f8fafc; padding: .75rem 1rem; text-align: left; font-size: .8rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
  .data-table td { padding: .7rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: .9rem; }
  code { background: #f1f5f9; padding: .1rem .4rem; border-radius: 4px; font-size: .8rem; }
  .empty { text-align: center; color: #94a3b8; padding: 2rem; }
  .actions { display: flex; gap: .4rem; }
  .btn-primary { background: #3b82f6; color: #fff; border: none; padding: .5rem 1rem; border-radius: 8px; cursor: pointer; }
  .btn-primary:hover { background: #2563eb; }
  .btn-primary:disabled { opacity: .5; }
  .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: .5rem 1rem; border-radius: 8px; cursor: pointer; }
  .btn-edit, .btn-del { background: none; border: none; cursor: pointer; font-size: 1rem; padding: .2rem .4rem; border-radius: 4px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal { background: #fff; border-radius: 16px; width: 440px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
  .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
  .modal-header h3 { margin: 0; }
  .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; }
  .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
  .modal-footer { display: flex; justify-content: flex-end; gap: .5rem; }
  .field { display: flex; flex-direction: column; gap: .3rem; }
  .field label { font-size: .8rem; font-weight: 600; color: #374151; }
  .field input, .field select { padding: .5rem .75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: .9rem; }
`;


// ─────────────────────────────────────────────
// DISTRITOS COMPONENT
// ─────────────────────────────────────────────
@Component({
  selector: 'app-distritos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>🗺️ Distritos</h2><p class="sub">Gestión de distritos</p></div>
        <button class="btn-primary" (click)="openForm()">➕ Nuevo</button>
      </div>
      @if (alertMsg()) {
        <div class="alert" [class.s]="alertType()==='success'" [class.e]="alertType()==='error'">{{ alertMsg() }}</div>
      }
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (d of items(); track d.idDistrito) {
              <tr>
                <td><code>{{ d.idDistrito }}</code></td>
                <td>{{ d.nombreDistrito }}</td>
                <td class="actions">
                  <button class="btn-edit" (click)="editItem(d)">✏️</button>
                  <button class="btn-del" (click)="deleteItem(d.idDistrito)">🗑️</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="empty">Sin registros</td></tr>
            }
          </tbody>
        </table>
      </div>
      @if (showForm()) {
        <div class="modal-overlay" (click)="closeForm()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editingId() ? 'Editar' : 'Nuevo' }} Distrito</h3>
              <button class="close-btn" (click)="closeForm()">✕</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body">
              @if (!editingId()) {
                <div class="field">
                  <label>ID (4 chars) *</label>
                  <input formControlName="idDistrito" maxlength="4" placeholder="LIM1">
                </div>
              }
              <div class="field">
                <label>Nombre Distrito *</label>
                <input formControlName="nombreDistrito" placeholder="Ej: Miraflores">
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
  styles: [SHARED_STYLES]
})
export class DistritosComponent implements OnInit {
  items = signal<Distrito[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  alertMsg = signal<string | null>(null);
  alertType = signal<'success'|'error'>('success');
  form: FormGroup;

  constructor(private svc: DistritoService, private fb: FormBuilder) {
    this.form = this.fb.group({
      idDistrito:      ['', [Validators.required, Validators.maxLength(4)]],
      nombreDistrito:  ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() { this.loadData(); }
  loadData() { this.svc.getAll().subscribe(r => this.items.set(r.data ?? [])); }

  openForm() { this.form.reset(); this.editingId.set(null); this.form.get('idDistrito')?.enable(); this.showForm.set(true); }
  editItem(d: Distrito) {
    this.editingId.set(d.idDistrito); this.form.patchValue(d);
    this.form.get('idDistrito')?.disable(); this.showForm.set(true);
  }
  closeForm() { this.showForm.set(false); }

  onSubmit() {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const obs = this.editingId() ? this.svc.update(this.editingId()!, val) : this.svc.create(val);
    obs.subscribe({
      next: () => { this.alert(`Distrito ${this.editingId() ? 'actualizado' : 'creado'}`, 'success'); this.closeForm(); this.loadData(); },
      error: e => this.alert(e.message, 'error')
    });
  }

  deleteItem(id: string) {
    if (!confirm('¿Eliminar?')) return;
    this.svc.delete(id).subscribe({ next: () => { this.alert('Eliminado', 'success'); this.loadData(); }, error: e => this.alert(e.message, 'error') });
  }

  alert(msg: string, type: 'success'|'error') {
    this.alertMsg.set(msg); this.alertType.set(type); setTimeout(() => this.alertMsg.set(null), 3500);
  }
}
