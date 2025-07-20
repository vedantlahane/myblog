import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { ApiService } from './services/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <app-header></app-header>
      
      <!-- Loading overlay for global operations -->
      @if (isGlobalLoading) {
        <div class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div class="bg-white rounded-lg p-6 shadow-xl">
            <div class="flex items-center space-x-3">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
              <span class="text-gray-700">Loading...</span>
            </div>
          </div>
        </div>
      }

      <main class="relative">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Toast notifications container -->
      <div id="toast-container" class="fixed bottom-4 right-4 z-50 space-y-2"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  private apiService = inject(ApiService);
  
  title = 'Modern Blog';
  isGlobalLoading = false;

  ngOnInit(): void {
    // Initialize app-wide settings
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    // Check if user is authenticated on app start
    if (this.apiService.isAuthenticated()) {
      this.apiService.getCurrentUser().subscribe({
        error: (error) => {
          console.error('Auth check failed:', error);
          // Handle authentication error silently
        }
      });
    }
  }
}
