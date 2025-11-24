import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { RegisterRequest } from '../../../../types/api';

// Custom Validators
function passwordMatchValidator(form: FormGroup) {
  const password = form.get('password');
  const confirmPassword = form.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
}

function strongPasswordValidator(control: any) {
  const value = control.value;
  if (!value) return null;
  
  const hasNumber = /[0-9]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasSpecial = /[#?!@$%^&*-]/.test(value);
  
  const valid = hasNumber && hasUpper && hasLower && hasSpecial;
  if (!valid) {
    return { strongPassword: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-accent-gold/6 to-brand-cyan/6 py-12">
      <div class="max-w-md w-full mx-4">
        <!-- Register Card with Retro Styling -->
  <div class="bg-surface border-4 border-brand-accent-gold shadow-2xl">
          <!-- Header -->
          <div class="bg-brand-accent-gold text-brand-navy p-6 text-center border-b-2 border-brand-accent-gold">
            <h1 class="font-serif text-2xl font-bold mb-2">Join Xandar</h1>
            <p class="text-brand-accent-gold text-sm font-mono">Create your account and start sharing</p>
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

            @if (success()) {
              <div class="mb-6 p-4 bg-green-50 border-2 border-green-300 text-green-700">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="font-mono text-sm">{{ success() }}</span>
                </div>
              </div>
            }

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <!-- Name Field -->
              <div class="mb-6">
                <label class="block text-brand-navy font-mono text-sm font-bold mb-2" for="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  placeholder="Your full name"
                  class="w-full px-4 py-3 border-2 border-brand-accent-gold focus:border-brand-accent-gold focus:outline-none bg-white font-mono text-sm transition-colors"
                  [class.border-red-400]="isFieldInvalid('name')"
                />
                
                @if (isFieldInvalid('name')) {
                  <div class="mt-2 text-red-600 text-xs font-mono">
                    @if (registerForm.get('name')?.errors?.['required']) {
                      Full name is required
                    }
                    @if (registerForm.get('name')?.errors?.['minlength']) {
                      Name must be at least 2 characters long
                    }
                  </div>
                }
              </div>

              <!-- Email Field -->
              <div class="mb-6">
                <label class="block text-brand-navy font-mono text-sm font-bold mb-2" for="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="your.email@example.com"
                  class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm transition-colors"
                  [class.border-red-400]="isFieldInvalid('email')"
                />
                
                @if (isFieldInvalid('email')) {
                  <div class="mt-2 text-red-600 text-xs font-mono">
                    @if (registerForm.get('email')?.errors?.['required']) {
                      Email is required
                    }
                    @if (registerForm.get('email')?.errors?.['email']) {
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
                    placeholder="Create a strong password"
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
                    @if (registerForm.get('password')?.errors?.['required']) {
                      Password is required
                    }
                    @if (registerForm.get('password')?.errors?.['minlength']) {
                      Password must be at least 8 characters long
                    }
                    @if (registerForm.get('password')?.errors?.['strongPassword']) {
                      Password must contain uppercase, lowercase, number & special character
                    }
                  </div>
                }
                
                <!-- Password Strength Indicator -->
                <div class="mt-2">
                  <div class="flex gap-1">
                    @for (strength of passwordStrength(); track $index) {
                      <div 
                        class="h-1 flex-1 rounded transition-colors"
                        [class]="strength ? 'bg-green-500' : 'bg-amber-200'"
                      ></div>
                    }
                  </div>
                  <p class="text-xs font-mono mt-1" [class]="getPasswordStrengthColor()">
                    {{ getPasswordStrengthText() }}
                  </p>
                </div>
              </div>

              <!-- Confirm Password Field -->
              <div class="mb-6">
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2" for="confirmPassword">
                  Confirm Password
                </label>
                <div class="relative">
                  <input
                    id="confirmPassword"
                    [type]="showConfirmPassword() ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    placeholder="Confirm your password"
                    class="w-full px-4 py-3 border-2 border-brand-accent-gold focus:border-brand-accent-gold focus:outline-none bg-white font-mono text-sm transition-colors pr-12"
                    [class.border-red-400]="isFieldInvalid('confirmPassword')"
                  />
                  
                  <!-- Toggle Confirm Password Visibility -->
                  <button
                    type="button"
                    (click)="toggleConfirmPasswordVisibility()"
                    class="absolute inset-y-0 right-0 flex items-center px-3 text-brand-accent-gold hover:text-brand-navy transition-colors"
                  >
                    @if (showConfirmPassword()) {
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
                
                @if (isFieldInvalid('confirmPassword')) {
                  <div class="mt-2 text-red-600 text-xs font-mono">
                    @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                      Please confirm your password
                    }
                    @if (registerForm.get('confirmPassword')?.errors?.['passwordMismatch']) {
                      Passwords do not match
                    }
                  </div>
                }
              </div>

              <!-- Terms & Privacy -->
              <div class="mb-8">
                <label class="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    formControlName="acceptTerms"
                    class="mt-1 text-brand-accent-gold border-2 border-brand-accent-gold focus:ring-brand-accent-gold"
                  />
                    <span class="text-brand-accent-gold text-sm font-mono leading-relaxed">
                    I agree to the 
                    <a routerLink="/terms" class="underline hover:text-brand-navy transition-colors">Terms of Service</a> 
                    and 
                    <a routerLink="/privacy" class="underline hover:text-amber-900 transition-colors">Privacy Policy</a>
                  </span>
                </label>
                
                @if (isFieldInvalid('acceptTerms')) {
                  <div class="mt-2 text-red-600 text-xs font-mono">
                    You must accept the terms and privacy policy
                  </div>
                }
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="registerForm.invalid || loading()"
                class="w-full bg-brand-accent-gold text-brand-navy py-3 px-6 font-mono text-sm uppercase tracking-wider hover:bg-brand-accent-gold/90 transition-colors border-2 border-brand-accent-gold hover:border-brand-accent-gold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (loading()) {
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-4 h-4 border-2 border-brand-accent-gold border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                } @else {
                  Create Account
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
                    Already have an account?
                  </span>
                </div>
              </div>
            </div>

            <!-- Login Link -->
            <div class="text-center">
              <p class="text-brand-accent-gold text-sm font-mono mb-4">
                Welcome back! Sign in to continue.
              </p>
              <a 
                routerLink="/auth/login"
                class="inline-block bg-surface text-brand-navy py-3 px-8 font-mono text-sm uppercase tracking-wider hover:bg-brand-accent-gold/10 transition-colors border-2 border-brand-accent-gold hover:border-brand-accent-gold"
              >
                Sign In
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

        <!-- Welcome Quote -->
        <div class="mt-8 text-center">
          <div class="bg-surface border-2 border-dotted border-brand-accent-gold p-4">
            <blockquote class="text-brand-accent-gold italic font-serif text-sm">
              "The best time to plant a tree was 20 years ago. The second best time is now."
            </blockquote>
            <cite class="text-brand-accent-gold font-mono text-xs mt-2 block">— Chinese Proverb</cite>
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

    /* Password strength animation */
    .password-strength-bar {
      transition: all 0.3s ease-in-out;
    }
  `]
})
export class RegisterComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Reactive Signals
  loading = signal(false);
  error = signal('');
  success = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // Form Configuration
  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      strongPasswordValidator
    ]),
    confirmPassword: new FormControl('', [
      Validators.required
    ]),
    acceptTerms: new FormControl(false, [
      Validators.requiredTrue
    ])
  }, { validators: passwordMatchValidator as import('@angular/forms').ValidatorFn });

  // Password strength computed property
  passwordStrength = signal<boolean[]>([false, false, false, false]);

  ngOnInit() {
    // Check if already authenticated
    if (this.apiService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    // Watch password changes for strength indicator
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordStrength(value || '');
    });
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.registerForm.value;
    const registerData: RegisterRequest = {
      name: formValue.name!,
      email: formValue.email!,
      password: formValue.password!
    };

    try {
      this.loading.set(true);
      this.error.set('');
      this.success.set('');

      const response = await this.apiService.register(registerData);
      
      // Registration successful
      this.success.set('Account created successfully! Redirecting...');
      console.log('Registration successful:', response.user);
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);

    } catch (error: any) {
      console.error('Registration failed:', error);
      this.error.set(error.message || 'Registration failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(current => !current);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(current => !current);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private updatePasswordStrength(password: string) {
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password) && /[0-9]/.test(password),
      /[#?!@$%^&*-]/.test(password)
    ];
    
    this.passwordStrength.set(checks);
  }

  getPasswordStrengthText(): string {
    const strength = this.passwordStrength().filter(Boolean).length;
    switch (strength) {
      case 0: return '';
      case 1: return 'Weak password';
      case 2: return 'Fair password';
      case 3: return 'Good password';
      case 4: return 'Strong password';
      default: return '';
    }
  }

  getPasswordStrengthColor(): string {
    const strength = this.passwordStrength().filter(Boolean).length;
    switch (strength) {
      case 0: return 'text-amber-600';
      case 1: return 'text-red-600';
      case 2: return 'text-orange-600';
      case 3: return 'text-blue-600';
      case 4: return 'text-green-600';
      default: return 'text-amber-600';
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Utility methods for template
  clearError() {
    this.error.set('');
  }

  clearSuccess() {
    this.success.set('');
  }
}
