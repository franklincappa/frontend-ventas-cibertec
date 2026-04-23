import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse, Distrito, CreateUpdateDistrito,
  Cargo, CreateUpdateCargo,
  Empleado, CreateEmpleado,
  Cliente, CreateCliente,
  Categoria, CreateUpdateCategoria,
  Producto, CreateProducto,
  Boleta, CreateBoleta, UpdateBoleta
} from '../models/models';

//const BASE_URL = 'https://localhost:59951/api/v1';
const BASE_URL = 'https://api-ventas-cibertec.azurewebsites.net/api/v1'

// ─── BASE SERVICE ────────────────────────────────────────
export abstract class BaseService<T, TCreate> {
  protected http = inject(HttpClient);
  protected abstract endpoint: string;

  getAll(): Observable<ApiResponse<T[]>> {
    return this.http.get<ApiResponse<T[]>>(`${BASE_URL}/${this.endpoint}`);
  }

  getById(id: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${BASE_URL}/${this.endpoint}/${id}`);
  }

  create(dto: TCreate): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${BASE_URL}/${this.endpoint}`, dto);
  }

  update(id: string, dto: Partial<TCreate>): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${BASE_URL}/${this.endpoint}/${id}`, dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${BASE_URL}/${this.endpoint}/${id}`);
  }
}

// ─── DISTRITO SERVICE ────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class DistritoService extends BaseService<Distrito, CreateUpdateDistrito> {
  protected override endpoint = 'Distritos';
}

// ─── CARGO SERVICE ───────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CargoService extends BaseService<Cargo, CreateUpdateCargo> {
  protected override endpoint = 'Cargos';
}

// ─── EMPLEADO SERVICE ────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class EmpleadoService extends BaseService<Empleado, CreateEmpleado> {
  protected override endpoint = 'Empleados';

  getByCargo(codCargo: string): Observable<ApiResponse<Empleado[]>> {
    return this.http.get<ApiResponse<Empleado[]>>(
      `${BASE_URL}/${this.endpoint}/por-cargo/${codCargo}`);
  }

  getByDistrito(idDistrito: string): Observable<ApiResponse<Empleado[]>> {
    return this.http.get<ApiResponse<Empleado[]>>(
      `${BASE_URL}/${this.endpoint}/por-distrito/${idDistrito}`);
  }
}

// ─── CLIENTE SERVICE ─────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ClienteService extends BaseService<Cliente, CreateCliente> {
  protected override endpoint = 'Clientes';
}

// ─── CATEGORIA SERVICE ───────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CategoriaService extends BaseService<Categoria, CreateUpdateCategoria> {
  protected override endpoint = 'Categorias';
}

// ─── PRODUCTO SERVICE ────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ProductoService extends BaseService<Producto, CreateProducto> {
  protected override endpoint = 'Productos';

  getByCategoria(codCate: string): Observable<ApiResponse<Producto[]>> {
    return this.http.get<ApiResponse<Producto[]>>(
      `${BASE_URL}/${this.endpoint}/por-categoria/${codCate}`);
  }

  getStockBajo(): Observable<ApiResponse<Producto[]>> {
    return this.http.get<ApiResponse<Producto[]>>(
      `${BASE_URL}/${this.endpoint}/stock-bajo`);
  }
}

// ─── BOLETA SERVICE ──────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class BoletaService extends BaseService<Boleta, CreateBoleta> {
  protected override endpoint = 'Boletas';

  getByCliente(idCliente: string): Observable<ApiResponse<Boleta[]>> {
    return this.http.get<ApiResponse<Boleta[]>>(
      `${BASE_URL}/${this.endpoint}/por-cliente/${idCliente}`);
  }

  getByEmpleado(codEmple: string): Observable<ApiResponse<Boleta[]>> {
    return this.http.get<ApiResponse<Boleta[]>>(
      `${BASE_URL}/${this.endpoint}/por-empleado/${codEmple}`);
  }

  getByFecha(desde: string, hasta: string): Observable<ApiResponse<Boleta[]>> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<ApiResponse<Boleta[]>>(
      `${BASE_URL}/${this.endpoint}/por-fecha`, { params });
  }

  updateEstado(id: string, dto: UpdateBoleta): Observable<ApiResponse<Boleta>> {
    return this.http.patch<ApiResponse<Boleta>>(
      `${BASE_URL}/${this.endpoint}/${id}/estado`, dto);
  }
}

// ─── HEALTH SERVICE ──────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class HealthService {
  private http = inject(HttpClient);

  check(): Observable<any> {
    return this.http.get(`${BASE_URL}/Health`);
  }
}
