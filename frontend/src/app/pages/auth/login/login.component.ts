import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // State signals
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  // Form
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
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

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.apiService.login({ email, password }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response) => {
        // Login successful, redirect to home
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Login failed. Please try again.');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}
