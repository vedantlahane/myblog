import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { authGuard } from './auth-guard';
import { ApiService } from '../services/api';
import { User } from '../../types/api';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let apiService: jasmine.SpyObj<ApiService>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  const executeGuard: CanActivateFn = (...guardParameters) => 
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getCurrentUser']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    
    mockRoute = new ActivatedRouteSnapshot();
    mockState = { url: '/protected' } as RouterStateSnapshot;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Browser Environment', () => {
    it('should allow access when user is authenticated', (done) => {
      const mockUser: User = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
        isVerified: true,
        followers: [],
        following: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };

      localStorage.setItem('authToken', 'valid-token');
      apiService.getCurrentUser.and.returnValue(of(mockUser));

      const result = executeGuard(mockRoute, mockState);
      
      if (result instanceof Promise) {
        result.then(allowed => {
          expect(allowed).toBe(true);
          expect(apiService.getCurrentUser).toHaveBeenCalled();
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        });
      } else if (typeof result === 'object' && 'subscribe' in result) {
        result.subscribe(allowed => {
          expect(allowed).toBe(true);
          expect(apiService.getCurrentUser).toHaveBeenCalled();
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        });
      } else {
        fail('Expected Observable or Promise, got: ' + typeof result);
      }
    });

    it('should redirect to login when no token exists', () => {
      // No token in localStorage
      const result = executeGuard(mockRoute, mockState);
      
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/protected' },
        replaceUrl: true
      });
      expect(apiService.getCurrentUser).not.toHaveBeenCalled();
    });

    it('should redirect to login when token is invalid', (done) => {
      localStorage.setItem('authToken', 'invalid-token');
      apiService.getCurrentUser.and.returnValue(throwError(() => new Error('Invalid token')));

      const result = executeGuard(mockRoute, mockState);
      
      if (typeof result === 'object' && 'subscribe' in result) {
        result.subscribe(allowed => {
          expect(allowed).toBe(false);
          expect(localStorage.getItem('authToken')).toBeNull();
          expect(router.navigate).toHaveBeenCalledWith(['/login'], {
            queryParams: { returnUrl: '/protected' },
            replaceUrl: true
          });
          done();
        });
      } else {
        fail('Expected Observable, got: ' + typeof result);
      }
    });

    it('should redirect to login when API returns null user', (done) => {
      localStorage.setItem('authToken', 'some-token');
      apiService.getCurrentUser.and.returnValue(of(null as any));

      const result = executeGuard(mockRoute, mockState);
      
      if (typeof result === 'object' && 'subscribe' in result) {
        result.subscribe(allowed => {
          expect(allowed).toBe(false);
          expect(router.navigate).toHaveBeenCalledWith(['/login'], {
            queryParams: { returnUrl: '/protected' },
            replaceUrl: true
          });
          done();
        });
      } else {
        fail('Expected Observable, got: ' + typeof result);
      }
    });

    it('should handle different return URLs correctly', () => {
      const differentState = { url: '/admin/dashboard' } as RouterStateSnapshot;
      
      const result = executeGuard(mockRoute, differentState);
      
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/admin/dashboard' },
        replaceUrl: true
      });
    });
  });

  describe('Server Environment', () => {
    beforeEach(() => {
      TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    });

    it('should allow access during server-side rendering', () => {
      const result = executeGuard(mockRoute, mockState);
      
      expect(result).toBe(true);
      expect(apiService.getCurrentUser).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
