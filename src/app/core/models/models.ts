// ─── API Response Wrapper ────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  statusCode: number;
}

// ─── Distrito ────────────────────────────────────────────
export interface Distrito {
  idDistrito: string;
  nombreDistrito: string;
}

export interface CreateUpdateDistrito {
  idDistrito: string;
  nombreDistrito: string;
}

// ─── Cargo ───────────────────────────────────────────────
export interface Cargo {
  codCargo: string;
  nombreCargo: string;
}

export interface CreateUpdateCargo {
  codCargo: string;
  nombreCargo: string;
}

// ─── Empleado ────────────────────────────────────────────
export interface Empleado {
  codEmple: string;
  nombres: string;
  apellidos: string;
  dniEmple: string;
  direccion: string;
  estadoCivil: string;
  nivelEduca: string;
  telefono: string;
  email: string;
  sueldoBasico: number;
  fechaIngreso: string;
  idDistrito: string;
  nombreDistrito: string;
  codCargo: string;
  nombreCargo: string;
}

export interface CreateEmpleado {
  codEmple: string;
  nombres: string;
  apellidos: string;
  dniEmple: string;
  direccion: string;
  estadoCivil: string;
  nivelEduca: string;
  telefono: string;
  email: string;
  sueldoBasico: number;
  fechaIngreso: string;
  idDistrito: string;
  codCargo: string;
}

// ─── Cliente ─────────────────────────────────────────────
export interface Cliente {
  idCliente: string;
  nombres: string;
  apellidos: string;
  direccion?: string;
  fono?: string;
  idDistrito: string;
  nombreDistrito: string;
  email?: string;
}

export interface CreateCliente {
  idCliente: string;
  nombres: string;
  apellidos: string;
  direccion?: string;
  fono?: string;
  idDistrito: string;
  email?: string;
}

// ─── Categoria ───────────────────────────────────────────
export interface Categoria {
  codCate: string;
  nombre: string;
}

export interface CreateUpdateCategoria {
  codCate: string;
  nombre: string;
}

// ─── Producto ────────────────────────────────────────────
export interface Producto {
  idProducto: string;
  descripcion: string;
  precioVenta: number;
  stockMinimo?: number;
  stockActual?: number;
  fechaVenc?: string;
  codCate: string;
  nombreCategoria: string;
}

export interface CreateProducto {
  idProducto: string;
  descripcion: string;
  precioVenta: number;
  stockMinimo?: number;
  stockActual?: number;
  fechaVenc?: string;
  codCate: string;
}

// ─── Boleta ──────────────────────────────────────────────
export interface DetalleBoleta {
  numBoleta: string;
  idProducto: string;
  descripcionProducto: string;
  cantidad: number;
  importe: number;
}

export interface CreateDetalle {
  idProducto: string;
  cantidad: number;
  importe: number;
}

export interface Boleta {
  numBoleta: string;
  fechaEmi: string;
  idCliente: string;
  nombreCliente: string;
  codEmple: string;
  nombreEmpleado: string;
  estadoBoleta: string;
  detalles: DetalleBoleta[];
  total: number;
}

export interface CreateBoleta {
  numBoleta: string;
  fechaEmi: string;
  idCliente: string;
  codEmple: string;
  estadoBoleta: string;
  detalles: CreateDetalle[];
}

export interface UpdateBoleta {
  estadoBoleta: string;
}
