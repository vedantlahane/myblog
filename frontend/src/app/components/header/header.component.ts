import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <nav class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="text-2xl font-bold text-amber-600 hover:text-amber-700 transition-colors">
              Modern Blog
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <a routerLink="/" routerLinkActive="text-amber-600" [routerLinkActiveOptions]="{exact: true}" class="text-gray-700 hover:text-amber-600 font-medium transition-colors">
              Home
            </a>
            <a routerLink="/categories" routerLinkActive="text-amber-600" class="text-gray-700 hover:text-amber-600 font-medium transition-colors">
              Categories
            </a>
            <a routerLink="/tags" routerLinkActive="text-amber-600" class="text-gray-700 hover:text-amber-600 font-medium transition-colors">
              Tags
            </a>
          </div>

          <!-- User Actions -->
          <div class="flex items-center space-x-4">
            @if (isAuthenticated()) {
              <div class="flex items-center space-x-3">
                <span class="text-gray-700">Welcome back!</span>
                <button 
                  (click)="logout()"
                  class="text-gray-700 hover:text-gray-900 font-medium">
                  Sign Out
                </button>
              </div>
            } @else {
              <div class="flex items-center space-x-3">
                <a 
                  routerLink="/login"
                  class="text-gray-700 hover:text-gray-900 font-medium">
                  Sign In
                </a>
                <a 
                  routerLink="/register"
                  class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Get Started
                </a>
              </div>
            }
          </div>
        </div>
      </nav>
    </header>
  `
})
export class HeaderComponent {
  private apiService = inject(ApiService);

  isAuthenticated = computed(() => this.apiService.isAuthenticated());

  logout(): void {
    this.apiService.logout().subscribe({
      next: () => {
        // Logout successful
      },
      error: (error) => {
        console.error('Logout failed:', error);
      }
    });
  }
}
