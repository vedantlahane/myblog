import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { User } from '../../../../types/api';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      @if (loading()) {
        <div class="flex justify-center items-center py-16">
          <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-lg">
            <div class="w-8 h-8 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
            Loading admin panel...
          </div>
        </div>
      } @else if (accessDenied()) {
        <div class="text-center py-16">
          <div class="inline-block border-4 border-red-300 p-8 bg-red-50">
            <div class="text-red-600 font-mono text-lg mb-4">🚫 ACCESS DENIED</div>
            <p class="text-red-700 mb-4">You don't have permission to access the admin panel.</p>
            <a routerLink="/" class="inline-block bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors">
              Back to Home
            </a>
          </div>
        </div>
      } @else {
        <!-- Admin Header -->
        <header class="bg-amber-800 border-b-4 border-amber-900 p-4 mb-8 shadow-lg">
          <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between">
              <!-- Logo & Title -->
              <div class="flex items-center gap-4">
                <a routerLink="/" class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-amber-100 border-2 border-amber-600 flex items-center justify-center font-bold text-amber-800">
                    MB
                  </div>
                  <span class="font-serif text-xl font-bold text-amber-100">MyBlog</span>
                </a>
                
                <div class="hidden md:block h-8 w-px bg-amber-600"></div>
                
                <div class="hidden md:block">
                  <h1 class="font-serif text-xl font-bold text-amber-100">Admin Panel</h1>
                  <p class="text-amber-200 text-sm font-mono">Content Management System</p>
                </div>
              </div>

              <!-- Admin User Info -->
              <div class="flex items-center gap-4">
                <!-- Notifications -->
                <button class="relative p-2 text-amber-200 hover:text-amber-100 transition-colors">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                  </svg>
                  <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </button>

                <!-- User Menu -->
                <div class="flex items-center gap-3">
                  @if (currentUser()?.avatarUrl) {
                    <img 
                      [src]="currentUser()?.avatarUrl" 
                      [alt]="currentUser()?.name"
                      class="w-8 h-8 rounded-full border-2 border-amber-600"
                    >
                  } @else {
                    <div class="w-8 h-8 bg-amber-200 border-2 border-amber-600 rounded-full flex items-center justify-center font-bold text-amber-800 text-sm">
                      {{ getUserInitials() }}
                    </div>
                  }
                  
                  <div class="hidden md:block">
                    <div class="text-amber-100 font-bold text-sm">{{ currentUser()?.name }}</div>
                    <div class="text-amber-200 text-xs font-mono">Administrator</div>
                  </div>
                </div>

                <!-- Logout -->
                <button
                  (click)="logout()"
                  class="ml-2 p-2 text-amber-200 hover:text-amber-100 transition-colors"
                  title="Logout"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div class="max-w-7xl mx-auto px-4">
          <div class="flex gap-8">
            <!-- Admin Sidebar -->
            <aside class="w-64 flex-shrink-0">
              <nav class="bg-amber-100 border-4 border-amber-300 p-4 sticky top-4">
                <h2 class="font-serif text-lg font-bold text-amber-900 mb-4 text-center border-b-2 border-dotted border-amber-400 pb-2">
                  Admin Menu
                </h2>
                
                <ul class="space-y-2">
                  <!-- Dashboard -->
                  <li>
                    <a 
                      routerLink="/admin"
                      routerLinkActive="active"
                      [routerLinkActiveOptions]="{exact: true}"
                      class="flex items-center gap-3 p-3 text-amber-900 hover:bg-amber-200 transition-colors border-2 border-transparent hover:border-amber-400 font-mono text-sm"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                      </svg>
                      Dashboard
                    </a>
                  </li>

                  <!-- Posts Management -->
                  <li>
                    <a 
                      routerLink="/admin/posts"
                      routerLinkActive="active"
                      class="flex items-center gap-3 p-3 text-amber-900 hover:bg-amber-200 transition-colors border-2 border-transparent hover:border-amber-400 font-mono text-sm"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                      </svg>
                      Posts
                    </a>
                  </li>

                  <!-- Users Management -->
                  <li>
                    <a 
                      routerLink="/admin/users"
                      routerLinkActive="active"
                      class="flex items-center gap-3 p-3 text-amber-900 hover:bg-amber-200 transition-colors border-2 border-transparent hover:border-amber-400 font-mono text-sm"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                      </svg>
                      Users
                    </a>
                  </li>

                  <!-- Tags Management -->
                  <li>
                    <a 
                      routerLink="/admin/tags"
                      routerLinkActive="active"
                      class="flex items-center gap-3 p-3 text-amber-900 hover:bg-amber-200 transition-colors border-2 border-transparent hover:border-amber-400 font-mono text-sm"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                      </svg>
                      Tags
                    </a>
                  </li>

                  <!-- Media Management -->
                  <li>
                    <a 
                      routerLink="/admin/media"
                      routerLinkActive="active"
                      class="flex items-center gap-3 p-3 text-amber-900 hover:bg-amber-200 transition-colors border-2 border-transparent hover:border-amber-400 font-mono text-sm"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                      </svg>
                      Media
                    </a>
                  </li>

                  <!-- Comments (if needed) -->
                  <li>
                    <a 
                      routerLink="/admin/comments"
                      routerLinkActive="active"
                      class="flex items-center gap-3 p-3 text-amber-900 hover:bg-amber-200 transition-colors border-2 border-transparent hover:border-amber-400 font-mono text-sm"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                      </svg>
                      Comments
                    </a>
                  </li>
                </ul>

                <!-- Divider -->
                <div class="my-6 border-t-2 border-dotted border-amber-400"></div>

                <!-- Quick Actions -->
                <div class="space-y-2">
                  <h3 class="font-serif font-bold text-amber-900 text-sm mb-3">Quick Actions</h3>
                  
                  <a 
                    routerLink="/write"
                    class="flex items-center gap-2 p-2 text-green-700 hover:bg-green-100 transition-colors border-2 border-transparent hover:border-green-300 font-mono text-xs"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                    </svg>
                    New Post
                  </a>
                  
                  <a 
                    routerLink="/"
                    class="flex items-center gap-2 p-2 text-blue-700 hover:bg-blue-100 transition-colors border-2 border-transparent hover:border-blue-300 font-mono text-xs"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    View Site
                  </a>
                </div>

                <!-- System Status -->
                <div class="mt-6 p-3 bg-green-50 border-2 border-green-300">
                  <h4 class="font-bold text-green-900 text-xs mb-2">System Status</h4>
                  <div class="flex items-center gap-2 text-green-700 text-xs">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span class="font-mono">All Systems Operational</span>
                  </div>
                </div>
              </nav>
            </aside>

            <!-- Main Content Area -->
            <main class="flex-1 min-w-0">
              <router-outlet></router-outlet>
            </main>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .active {
      background-color: #fbbf24;
      border-color: #d97706;
      font-weight: bold;
    }

    /* Vintage paper texture */
    nav {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Smooth transitions */
    a {
      transition: all 0.2s ease-in-out;
    }

    /* Admin header shadow */
    header {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    /* Sticky sidebar */
    aside nav {
      max-height: calc(100vh - 6rem);
      overflow-y: auto;
    }

    /* Custom scrollbar */
    aside nav::-webkit-scrollbar {
      width: 4px;
    }

    aside nav::-webkit-scrollbar-track {
      background: #fef3cd;
    }

    aside nav::-webkit-scrollbar-thumb {
      background: #d97706;
      border-radius: 2px;
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Reactive Signals
  loading = signal(true);
  accessDenied = signal(false);
  currentUser = signal<User | null>(null);

  async ngOnInit() {
    await this.checkAdminAccess();
  }

  private async checkAdminAccess() {
    try {
      // Check if user is authenticated
      if (!this.apiService.isAuthenticated()) {
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: '/admin' }
        });
        return;
      }

      // Get current user and check admin status
      const user = await this.apiService.getCurrentUser();
      this.currentUser.set(user);

      if (!user.isAdmin) {
        this.accessDenied.set(true);
        return;
      }

      // User has admin access
      this.loading.set(false);

    } catch (error) {
      console.error('Failed to verify admin access:', error);
      this.accessDenied.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  async logout() {
    try {
      await this.apiService.logout();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      this.router.navigate(['/']);
    }
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user?.name) return 'A';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
