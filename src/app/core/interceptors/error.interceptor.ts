import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const authReq = req.clone({
    headers: req.headers
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      switch (error.status) {
        case 400: errorMessage = error.error?.message || 'Datos inválidos'; break;
        case 404: errorMessage = error.error?.message || 'Recurso no encontrado'; break;
        case 500: errorMessage = 'Error interno del servidor'; break;
        case 503: errorMessage = 'Servicio no disponible'; break;
        case 0:   errorMessage = 'No se puede conectar con el servidor'; break;
      }

      console.error(`[HTTP ${error.status}] ${errorMessage}`, error);
      return throwError(() => ({ status: error.status, message: errorMessage, original: error }));
    })
  );
};
