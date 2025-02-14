// interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';//Observable is a generic type, so we need to import it from 'rxjs' package, that means we can pass any type of data to it. throwError is a function that creates an error observable, that means we can throw an error from the observable.
import { catchError } from 'rxjs/operators';//catchError is an operator that intercepts an Observable that failed and returns a new Observable or throws an error.
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()//The @Injectable() decorator is used to define a class as a provider of services that other classes can use.
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the current user from AuthService
    const currentUser = this.authService.currentUser;

    // Add auth header if user is logged in and request is to the API URL
    if (currentUser?.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from api
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}