import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn } from '@angular/router';
import { ApiService } from '../services/api';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const apiService = inject(ApiService);
  const isBrowser = isPlatformBrowser(platformId);

  // Server-side rendering: allow access, client will handle auth
  if (!isBrowser) {
    return true;
  }

  const token = localStorage.getItem('authToken');
  
  // No token found
  if (!token) {
    redirectToLogin(router, state.url);
    return false;
  }

  // Verify token with API service
  return apiService.getCurrentUser().pipe(
    map(user => {
      if (user && user._id) {
        return true;
      }
      redirectToLogin(router, state.url);
      return false;
    }),
    catchError(error => {
      console.error('Auth guard - token verification failed:', error);
      // Clear invalid token
      localStorage.removeItem('authToken');
      apiService['tokenSubject']?.next(null);
      redirectToLogin(router, state.url);
      return of(false);
    })
  );
};

function redirectToLogin(router: Router, returnUrl: string): void {
  router.navigate(['/login'], { 
    queryParams: { returnUrl },
    replaceUrl: true 
  });
}
