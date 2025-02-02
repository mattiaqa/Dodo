import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS, HttpErrorResponse,
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {StorageService} from '../storage/storage.service';
import { Provider } from '@angular/core';
import {Router} from '@angular/router';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(private serviceStorage: StorageService, private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      withCredentials: true,
    });

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          const token = this.serviceStorage.getToken();
          
          if (token) {
            const clonedReq = req.clone({
              setHeaders: {'x-refresh': token}
            });

            return next.handle(clonedReq).pipe(
              catchError((e) => {
                if (e instanceof HttpErrorResponse && e.status === 401) {
                  this.serviceStorage.clean();
                }
                return throwError(() => e);
              })
            );
          }
        }
        return throwError(() => error);
      })
    );
  }
}

export const httpInterceptorProviders: Provider = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
