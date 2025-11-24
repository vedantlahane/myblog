import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-25 to-orange-25 py-12">
      <div class="max-w-md w-full mx-4">
        <!-- Forgot Password Card with Retro Styling -->
          <div class="bg-surface border-4 border-brand-accent-gold shadow-2xl">
          <!-- Header -->
          <div class="bg-amber-800 text-amber-100 p-6 text-center border-b-2 border-amber-700">
            <h1 class="font-serif text-2xl font-bold mb-2">Reset Password</h1>
            <p class="text-amber-200 text-sm font-mono">Recover access to your Xandar account</p>
          </div>

          <!-- Form -->
          <div class="p-8">
            @if (!emailSent()) {
              <!-- Email Request Form -->
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

              <div class="mb-6">
                <h3 class="font-serif text-lg font-bold text-amber-900 mb-3">Forgot Your Password?</h3>
                  <p class="text-brand-accent-gold text-sm leading-relaxed mb-6">
                  No worries! Enter your email address below and we'll send you a link to reset your password.
                </p>
              </div>

              <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
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
                    class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm transition-colors"
                    [class.border-red-400]="isFieldInvalid('email')"
                  />
                  
                  @if (isFieldInvalid('email')) {
                    <div class="mt-2 text-red-600 text-xs font-mono">
                      @if (forgotPasswordForm.get('email')?.errors?.['required']) {
                        Email is required
                      }
                      @if (forgotPasswordForm.get('email')?.errors?.['email']) {
                        Please enter a valid email address
                      }
                    </div>
                  }
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  [disabled]="forgotPasswordForm.invalid || loading()"
                   class="w-full bg-brand-accent-gold text-brand-navy py-3 px-6 font-mono text-sm uppercase tracking-wider hover:bg-brand-accent-gold/90 transition-colors border-2 border-brand-accent-gold hover:border-brand-accent-gold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  @if (loading()) {
                    <div class="flex items-center justify-center gap-2">
                      <div class="w-4 h-4 border-2 border-amber-100 border-t-transparent rounded-full animate-spin"></div>
                      Sending Reset Link...
                    </div>
                  } @else {
                    Send Reset Link
                  }
                </button>
              </form>
            } @else {
              <!-- Success Message -->
              <div class="text-center">
                <div class="mb-6">
                  <div class="w-16 h-16 bg-green-100 border-4 border-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  
                  <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Check Your Email</h3>
                  <p class="text-amber-700 text-sm leading-relaxed mb-6">
                    We've sent a password reset link to <strong>{{ submittedEmail() }}</strong>.
                    Please check your email and follow the instructions to reset your password.
                  </p>
                </div>

                <!-- Additional Info -->
                <div class="bg-amber-100 border-2 border-dotted border-amber-400 p-4 mb-6">
                  <h4 class="font-bold text-amber-900 text-sm mb-2">Didn't receive the email?</h4>
                  <ul class="text-amber-700 text-xs space-y-1">
                    <li>• Check your spam/junk folder</li>
                    <li>• Make sure the email address is correct</li>
                    <li>• The link expires in 1 hour</li>
                  </ul>
                </div>

                <!-- Resend Button -->
                <button
                  (click)="resendEmail()"
                  [disabled]="resendLoading() || resendCooldown() > 0"
                   class="w-full bg-brand-accent-gold/10 text-brand-accent-gold py-3 px-6 font-mono text-sm uppercase tracking-wider hover:bg-brand-accent-gold/20 transition-colors border-2 border-brand-accent-gold hover:border-brand-accent-gold disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  @if (resendLoading()) {
                    <div class="flex items-center justify-center gap-2">
                      <div class="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
                      Resending...
                    </div>
                  } @else if (resendCooldown() > 0) {
                    Resend in {{ resendCooldown() }}s
                  } @else {
                    Resend Email
                  }
                </button>
              </div>
            }

            <!-- Divider -->
            <div class="mt-8 mb-8">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t-2 border-dotted border-amber-300"></div>
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-amber-50 px-4 text-amber-600 font-mono uppercase tracking-wider">
                    Remember your password?
                  </span>
                </div>
              </div>
            </div>

            <!-- Back to Login -->
            <div class="text-center">
              <a 
                routerLink="/auth/login"
                 class="inline-block bg-surface text-brand-navy py-3 px-8 font-mono text-sm uppercase tracking-wider hover:bg-brand-accent-gold/10 transition-colors border-2 border-brand-accent-gold hover:border-brand-accent-gold"
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>

        <!-- Back to Home -->
        <div class="text-center mt-8">
          <a 
            routerLink="/"
            class="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-mono text-sm transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Xandar
          </a>
        </div>

        <!-- Security Notice -->
        <div class="mt-8 text-center">
          <div class="bg-amber-100 border-2 border-dotted border-amber-400 p-4">
              <h4 class="font-bold text-brand-navy text-sm mb-2">🔒 Security Notice</h4>
              <p class="text-brand-accent-gold text-xs">
              For your security, password reset links expire after 1 hour. 
              If you didn't request this reset, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Vintage paper texture effect */
    .bg-amber-50 {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Focus styles */
    input:focus {
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }

    /* Success animation */
    .success-check {
      animation: checkmark 0.5s ease-in-out;
    }

    @keyframes checkmark {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Pulse animation for loading */
    .pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  private router = inject(Router);

  // Reactive Signals
  loading = signal(false);
  resendLoading = signal(false);
  error = signal('');
  emailSent = signal(false);
  submittedEmail = signal('');
  resendCooldown = signal(0);

  // Form
  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  // Cooldown interval
  private cooldownInterval?: number;

  ngOnInit() {
    // Pre-fill email if coming from login page with email in query params
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
      this.forgotPasswordForm.patchValue({ email });
    }
  }

  ngOnDestroy() {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  async onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const email = this.forgotPasswordForm.value.email!;

    try {
      this.loading.set(true);
      this.error.set('');

      // Simulate API call for forgot password
      // await this.apiService.forgotPassword({ email });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll always show success
      // In real implementation, handle actual API response
      this.submittedEmail.set(email);
      this.emailSent.set(true);
      this.startResendCooldown();

    } catch (error: any) {
      console.error('Forgot password failed:', error);
      this.error.set(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async resendEmail() {
    if (this.resendCooldown() > 0 || this.resendLoading()) return;

    try {
      this.resendLoading.set(true);
      
      // Simulate API call for resend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset cooldown
      this.startResendCooldown();

    } catch (error: any) {
      console.error('Resend failed:', error);
      this.error.set('Failed to resend email. Please try again.');
    } finally {
      this.resendLoading.set(false);
    }
  }

  private startResendCooldown() {
    this.resendCooldown.set(60); // 60 seconds cooldown
    
    this.cooldownInterval = window.setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        this.resendCooldown.set(0);
        if (this.cooldownInterval) {
          clearInterval(this.cooldownInterval);
          this.cooldownInterval = undefined;
        }
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched() {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Go back to previous step
  goBack() {
    this.emailSent.set(false);
    this.error.set('');
    this.submittedEmail.set('');
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
      this.cooldownInterval = undefined;
    }
    this.resendCooldown.set(0);
  }

  // Navigate to login with email pre-filled
  goToLogin() {
    const email = this.submittedEmail() || this.forgotPasswordForm.value.email;
    if (email) {
      this.router.navigate(['/auth/login'], { 
        queryParams: { email } 
      });
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
