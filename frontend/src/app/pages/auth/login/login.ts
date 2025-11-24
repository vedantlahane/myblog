import { Component, OnInit, inject, signal } from '@angular/core';

import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { LoginRequest } from '../../../../types/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-accent-gold/6 to-brand-cyan/6 py-12">
      <div class="max-w-md w-full mx-4">
        <!-- Login Card with Retro Styling -->
  <div class="bg-surface border-4 border-brand-accent-gold shadow-2xl">
          <!-- Header -->
          <div class="bg-brand-accent-gold text-brand-navy p-6 text-center border-b-2 border-brand-accent-gold">
            <h1 class="font-serif text-2xl font-bold mb-2">Welcome Back</h1>
            <p class="text-brand-accent-gold text-sm font-mono">Sign in to your Xandar account</p>
          </div>

          <!-- Form -->
          <div class="p-8">
            @if (error()) {
              <div class="mb-6 p-4 bg-red-50 border-2 border-red-300 text-red-700">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-mono text-sm">{{ error() }}</span>
                </div>
              </div>
            }

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <!-- Email Field -->
              <div class="mb-6">
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2" for="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="your.email@example.com"
                  class="w-full px-4 py-3 border-2 border-brand-accent-gold focus:border-brand-accent-gold focus:outline-none bg-white font-mono text-sm transition-colors"
                  [class.border-red-400]="isFieldInvalid('email')"
                />
                
                @if (isFieldInvalid('email')) {
                  <div class="mt-2 text-red-600 text-xs font-mono">
                    @if (loginForm.get('email')?.errors?.['required']) {
                      Email is required
                    }
                    @if (loginForm.get('email')?.errors?.['email']) {
                      Please enter a valid email address
                    }
                  </div>
                }
              </div>

              <!-- Password Field -->
              <div class="mb-6">
                <label class="block text-brand-navy font-mono text-sm font-bold mb-2" for="password">
                  Password
                </label>
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Enter your password"
                    class="w-full px-4 py-3 border-2 border-brand-accent-gold focus:border-brand-accent-gold focus:outline-none bg-white font-mono text-sm transition-colors pr-12"
                    [class.border-red-400]="isFieldInvalid('password')"
                  />
                  
                  <!-- Toggle Password Visibility -->
                  <button
                    type="button"
                    (click)="togglePasswordVisibility()"
                    class="absolute inset-y-0 right-0 flex items-center px-3 text-brand-accent-gold hover:text-brand-navy transition-colors"
                  >
                    @if (showPassword()) {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.5 8.5m1.378 1.378L12 12m0 0l4.242 4.242M12 12L8.5 8.5m3.5 3.5l4.242 4.242"></path>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    }
                  </button>
                </div>
                
                @if (isFieldInvalid('password')) {
                  <div class="mt-2 text-red-600 text-xs font-mono">
                    @if (loginForm.get('password')?.errors?.['required']) {
                      Password is required
                    }
                    @if (loginForm.get('password')?.errors?.['minlength']) {
                      Password must be at least 6 characters long
                    }
                  </div>
                }
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="flex items-center justify-between mb-8">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    formControlName="rememberMe"
                    class="mr-2 text-brand-accent-gold border-2 border-brand-accent-gold focus:ring-brand-accent-gold"
                  />
                  <span class="text-brand-accent-gold text-sm font-mono">Remember me</span>
                </label>
                
                <a 
                  routerLink="/auth/forgot-password" 
                  class="text-brand-accent-gold hover:text-brand-navy text-sm font-mono underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="loginForm.invalid || loading()"
                class="w-full bg-brand-accent-gold text-brand-navy py-3 px-6 font-mono text-sm uppercase tracking-wider hover:bg-brand-accent-gold/90 transition-colors border-2 border-brand-accent-gold hover:border-brand-accent-gold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (loading()) {
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-4 h-4 border-2 border-brand-accent-gold border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                } @else {
                  Sign In
                }
              </button>
            </form>

            <!-- Divider -->
            <div class="mt-8 mb-8">
              <div class="relative">
                  <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t-2 border-dotted border-brand-accent-gold"></div>
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-surface px-4 text-brand-accent-gold font-mono uppercase tracking-wider">
                    New to Xandar?
                  </span>
                </div>
              </div>
            </div>

            <!-- Register Link -->
            <div class="text-center">
              <p class="text-brand-accent-gold text-sm font-mono mb-4">
                Don't have an account yet?
              </p>
              <a 
                routerLink="/auth/register"
                class="inline-block bg-surface text-brand-navy py-3 px-8 font-mono text-sm uppercase tracking-wider hover:bg-brand-accent-gold/10 transition-colors border-2 border-brand-accent-gold hover:border-brand-accent-gold"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>

        <!-- Back to Home -->
        <div class="text-center mt-8">
          <a 
            routerLink="/"
            class="inline-flex items-center gap-2 text-brand-accent-gold hover:text-brand-navy font-mono text-sm transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Xandar
          </a>
        </div>

        <!-- Quote Section -->
        <div class="mt-8 text-center">
          <div class="bg-surface border-2 border-dotted border-brand-accent-gold p-4">
            <blockquote class="text-brand-accent-gold italic font-serif text-sm">
              "The best way to find out if you can trust somebody is to trust them."
            </blockquote>
            <cite class="text-brand-accent-gold font-mono text-xs mt-2 block">— Ernest Hemingway</cite>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
  /* Custom checkbox styling */
    input[type="checkbox"] {
      appearance: none;
      background-color: white;
      border: 2px solid #D4A761;
      width: 1rem;
      height: 1rem;
      position: relative;
      cursor: pointer;
    }

    input[type="checkbox"]:checked {
      background-color: #D4A761;
    }

    input[type="checkbox"]:checked::before {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
    }

    input[type="checkbox"]:focus {
      outline: 2px solid #D4A761;
      outline-offset: 2px;
    }

    /* Vintage form styling */
    input:focus {
      box-shadow: 0 0 0 3px rgba(212, 167, 97, 0.1);
    }

    /* Paper texture effect */
    .bg-surface {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(212, 167, 97, 0.03) 0%, transparent 50%);
    }
  `]
})
export class LoginComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Reactive Signals
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  // Form Configuration
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    rememberMe: new FormControl(false)
  });

  ngOnInit() {
    // Check if already authenticated
    if (this.apiService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    // Pre-fill with demo data (remove in production)
    if (this.isDevelopment()) {
      this.loginForm.patchValue({
        email: 'demo@Xandar.com',
        password: 'demo123'
      });
    }
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.loginForm.value;
    const loginData: LoginRequest = {
      email: formValue.email!,
      password: formValue.password!
    };

    try {
      this.loading.set(true);
      this.error.set('');

      const response = await this.apiService.login(loginData);
      
      // Login successful
      console.log('Login successful:', response.user);
      
      // Navigate to intended page or home
      const returnUrl = this.getReturnUrl();
      this.router.navigate([returnUrl]);

    } catch (error: any) {
      console.error('Login failed:', error);
      this.error.set(error.message || 'Login failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(current => !current);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private getReturnUrl(): string {
    // Check if there's a return URL in query params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl') || localStorage.getItem('returnUrl') || '/';
    
    // Clean up stored return URL
    localStorage.removeItem('returnUrl');
    
    return returnUrl;
  }

  private isDevelopment(): boolean {
    return !environment.production;
  }

  // Utility methods for template
  clearError() {
    this.error.set('');
  }

  // Quick fill for demo (remove in production)
  fillDemoCredentials() {
    if (this.isDevelopment()) {
      this.loginForm.patchValue({
        email: 'admin@Xandar.com',
        password: 'admin123'
      });
    }
  }
}
