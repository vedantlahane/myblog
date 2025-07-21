import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { User } from '../types/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive
  ],
  template: `
    <!-- Header -->
    <header class="border-b-4 border-amber-900 bg-amber-50 shadow-lg">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <!-- Retro Blog Header Style -->
        <div class="text-center border-b-2 border-dotted border-amber-800 pb-4 mb-4">
          <h1 class="font-serif text-4xl font-bold text-amber-900 tracking-wider">
            {{ blogTitle }}
          </h1>
          <p class="text-amber-700 text-sm font-mono mt-2 tracking-widest uppercase">
            {{ blogSubtitle }}
          </p>
          <div class="flex items-center justify-center gap-4 mt-3 text-xs text-amber-600 font-mono">
            <span>EST. 2025</span>
            <span>•</span>
            <span>{{ currentDate }}</span>
            <span>•</span>
            <span>{{ totalPosts }} ARTICLES</span>
          </div>
        </div>
        
        <!-- Minimal Navigation -->
        <nav class="flex justify-center">
          <ul class="flex gap-8 font-mono text-sm uppercase tracking-wide">
            <li>
              <a 
                routerLink="/" 
                routerLinkActive="text-amber-900 border-b-2 border-amber-900"
                [routerLinkActiveOptions]="{exact: true}"
                class="text-amber-700 hover:text-amber-900 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-300"
              >
                Latest
              </a>
            </li>
            <li>
              <a 
                routerLink="/archive" 
                routerLinkActive="text-amber-900 border-b-2 border-amber-900"
                class="text-amber-700 hover:text-amber-900 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-300"
              >
                Archive
              </a>
            </li>
            <li>
              <a 
                routerLink="/about" 
                routerLinkActive="text-amber-900 border-b-2 border-amber-900"
                class="text-amber-700 hover:text-amber-900 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-300"
              >
                About
              </a>
            </li>
            @if (!isAuthenticated()) {
              <li>
                <a 
                  routerLink="/auth" 
                  routerLinkActive="text-amber-900 border-b-2 border-amber-900"
                  class="text-amber-700 hover:text-amber-900 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-300"
                >
                  Join
                </a>
              </li>
            } @else {
              <li class="relative">
                <button 
                  (click)="toggleUserMenu()"
                  class="text-amber-700 hover:text-amber-900 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-300 flex items-center gap-1"
                >
                  {{ currentUser()?.name || 'Profile' }}
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </button>
                
                @if (showUserMenu()) {
                  <div class="absolute top-8 right-0 bg-amber-50 border-2 border-amber-200 shadow-lg rounded-none z-10 min-w-48">
                    <div class="py-1">
                      <a routerLink="/profile" class="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-100 font-mono">Profile</a>
                      <a routerLink="/write" class="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-100 font-mono">Write</a>
                      <a routerLink="/drafts" class="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-100 font-mono">Drafts</a>
                      <a routerLink="/bookmarks" class="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-100 font-mono">Bookmarks</a>
                      <hr class="border-amber-200 my-1">
                      <button 
                        (click)="logout()" 
                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-mono"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                }
              </li>
            }
          </ul>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="min-h-screen bg-cream-50 bg-gradient-to-b from-amber-25 to-orange-25">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Loading State -->
        @if (loading()) {
          <div class="flex justify-center items-center py-12">
            <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-sm">
              <div class="w-5 h-5 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
              Loading articles...
            </div>
          </div>
        }
        
        <!-- Router Outlet -->
        <router-outlet></router-outlet>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t-4 border-amber-900 bg-amber-900 text-amber-100">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="text-center">
          <!-- Retro Blog Footer -->
          <div class="border-2 border-amber-700 p-6 bg-amber-800">
            <h3 class="font-serif text-xl mb-3">{{ blogTitle }}</h3>
            <p class="text-amber-200 text-sm mb-4 max-w-2xl mx-auto">
              A personal blog sharing thoughts, experiences, and insights on technology, life, and everything in between.
            </p>
            
            @if (!isAuthenticated()) {
              <div class="flex justify-center">
                <a 
                  routerLink="/auth" 
                  class="inline-block bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors border-2 border-amber-500 hover:border-amber-400"
                >
                  Join the Community
                </a>
              </div>
            }
          </div>
          
          <div class="mt-6 pt-4 border-t border-amber-700">
            <div class="flex justify-center items-center gap-6 text-sm font-mono">
              <span>&copy; 2025 {{ blogTitle }}</span>
              <span>•</span>
              <a href="mailto:hello@myblog.com" class="hover:text-amber-300 transition-colors">
                Contact
              </a>
              <span>•</span>
              <a routerLink="/privacy" class="hover:text-amber-300 transition-colors">
                Privacy
              </a>
              <span>•</span>
              <a routerLink="/rss" class="hover:text-amber-300 transition-colors">
                RSS
              </a>
            </div>
            <p class="text-xs text-amber-400 mt-2">
              Built with ❤️ using Angular 20 & Tailwind CSS 4
            </p>
          </div>
        </div>
      </div>
    </footer>

    <!-- Click Outside Handler for User Menu -->
    @if (showUserMenu()) {
      <div 
        class="fixed inset-0 z-5" 
        (click)="closeUserMenu()"
      ></div>
    }
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #fefcbf 0%, #fed7aa 100%);
    }

    /* Custom scrollbar for webkit browsers */
    :host ::ng-deep * {
      scrollbar-width: thin;
      scrollbar-color: #d97706 #fef3cd;
    }

    :host ::ng-deep *::-webkit-scrollbar {
      width: 8px;
    }

    :host ::ng-deep *::-webkit-scrollbar-track {
      background: #fef3cd;
    }

    :host ::ng-deep *::-webkit-scrollbar-thumb {
      background: #d97706;
      border-radius: 4px;
    }

    :host ::ng-deep *::-webkit-scrollbar-thumb:hover {
      background: #b45309;
    }

    /* Vintage text shadow effect */
    h1 {
      text-shadow: 2px 2px 0px #d97706, 4px 4px 0px #b45309;
    }

    /* Retro box shadow */
    header {
      box-shadow: 0 8px 16px -4px rgba(146, 64, 14, 0.2);
    }

    /* Typewriter effect for loading */
    @keyframes typewriter {
      from { width: 0; }
      to { width: 100%; }
    }

    .typewriter {
      animation: typewriter 2s steps(20) infinite;
    }
  `]
})
export class AppComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Blog Configuration
  blogTitle = 'MyBlog';
  blogSubtitle = 'Personal thoughts & insights';
  totalPosts = 0;
  
  // Reactive Signals (Angular 20 style)
  loading = signal(false);
  currentUser = signal<User | null>(null);
  showUserMenu = signal(false);
  
  // Current date for retro header
  currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).toUpperCase();

  async ngOnInit() {
    await this.checkAuthStatus();
    await this.updatePostCount();
    this.setupAuthStateListener();
  }

  private async checkAuthStatus() {
    if (this.apiService.isAuthenticated()) {
      try {
        this.loading.set(true);
        const user = await this.apiService.getCurrentUser();
        this.currentUser.set(user);
      } catch (error) {
        console.error('Failed to get current user:', error);
        this.currentUser.set(null);
      } finally {
        this.loading.set(false);
      }
    }
  }

  private setupAuthStateListener() {
    // Listen to token changes
    this.apiService.token$.subscribe(token => {
      if (!token) {
        this.currentUser.set(null);
        this.showUserMenu.set(false);
      }
    });
  }

  // Method to update total posts count
  private async updatePostCount() {
    try {
      const response = await this.apiService.getPosts({
        limit: 1,
        status: 'published',
        dateTo: '',
        dateFrom: ''
      });
      this.totalPosts = response.totalPosts || 0;
    } catch (error) {
      console.error('Failed to get post count:', error);
      this.totalPosts = 0;
    }
  }

  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  toggleUserMenu() {
    this.showUserMenu.update(current => !current);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }

  async logout() {
    try {
      this.loading.set(true);
      await this.apiService.logout();
      this.currentUser.set(null);
      this.showUserMenu.set(false);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.loading.set(false);
    }
  }

  // Refresh post count when needed
  async refreshPostCount() {
    await this.updatePostCount();
  }
}
