import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p class="text-gray-600">Join our community of writers and readers</p>
        </div>

        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <!-- Name -->
          <div class="mb-6">
            <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              formControlName="name"
              placeholder="Enter your full name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              [class.border-red-500]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
            @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
              <p class="mt-1 text-sm text-red-600">
                @if (registerForm.get('name')?.errors?.['required']) {
                  Name is required
                } @else if (registerForm.get('name')?.errors?.['minlength']) {
                  Name must be at least 2 characters long
                }
              </p>
            }
          </div>

          <!-- Email -->
          <div class="mb-6">
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="Enter your email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <p class="mt-1 text-sm text-red-600">
                @if (registerForm.get('email')?.errors?.['required']) {
                  Email is required
                } @else if (registerForm.get('email')?.errors?.['email']) {
                  Please enter a valid email address
                }
              </p>
            }
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                formControlName="password"
                placeholder="Create a password"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                @if (showPassword()) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m6.121-6.121L21 3m-6.879 6.878A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.024 10.024 0 01-1.563 3.029"/>
                  </svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
              </button>
            </div>
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <p class="mt-1 text-sm text-red-600">
                @if (registerForm.get('password')?.errors?.['required']) {
                  Password is required
                } @else if (registerForm.get('password')?.errors?.['minlength']) {
                  Password must be at least 6 characters long
                }
              </p>
            }
          </div>

          <!-- Confirm Password -->
          <div class="mb-6">
            <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <div class="relative">
              <input
                [type]="showConfirmPassword() ? 'text' : 'password'"
                id="confirmPassword"
                formControlName="confirmPassword"
                placeholder="Confirm your password"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                [class.border-red-500]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              <button
                type="button"
                (click)="toggleConfirmPasswordVisibility()"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                @if (showConfirmPassword()) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m6.121-6.121L21 3m-6.879 6.878A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.024 10.024 0 01-1.563 3.029"/>
                  </svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
              </button>
            </div>
            @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
              <p class="mt-1 text-sm text-red-600">
                @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                  Please confirm your password
                } @else if (registerForm.get('confirmPassword')?.errors?.['passwordMismatch']) {
                  Passwords do not match
                }
              </p>
            }
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-800 text-sm">{{ errorMessage() }}</p>
            </div>
          }

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="registerForm.invalid || isLoading()"
            class="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
            @if (isLoading()) {
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating Account...
            } @else {
              Create Account
            }
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-8 text-center">
          <p class="text-gray-600">
            Already have an account? 
            <a routerLink="/login" class="text-amber-600 hover:text-amber-700 font-semibold">
              Sign in
            </a>
          </p>
        </div>

        <!-- Back to Home -->
        <div class="mt-4 text-center">
          <a routerLink="/" class="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // State signals
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // Form
  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.apiService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(current => !current);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(current => !current);
  }

  private passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
      return null;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isLoading()) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { name, email, password } = this.registerForm.value;

    this.apiService.register({ name, email, password }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        // Registration successful, redirect to home
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Registration failed. Please try again.');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }
}
