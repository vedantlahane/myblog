import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { User, Post } from '../../../types/api';
import { catchError, debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface NavigationItem {
  label: string;
  route: string;
  icon?: string;
  requiresAuth?: boolean;
}

interface SearchResult extends Post {
  type: 'post';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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
            @for (item of navigationItems; track item.label) {
              <a 
                [routerLink]="item.route"
                routerLinkActive="text-amber-600"
                class="text-gray-700 hover:text-amber-600 font-medium transition-colors">
                {{ item.label }}
              </a>
            }
          </div>

          <!-- Search and User Actions -->
          <div class="flex items-center space-x-4">
            <!-- Search -->
            <div class="relative">
              <button 
                (click)="toggleSearch()"
                class="text-gray-500 hover:text-gray-700 p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
              
              @if (isSearchOpen()) {
                <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                  <input 
                    [formControl]="searchControl"
                    type="text" 
                    placeholder="Search stories..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                  
                  @if (isLoading()) {
                    <div class="mt-2 text-center py-4">
                      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto"></div>
                    </div>
                  }

                  @if (searchResults().length > 0) {
                    <div class="mt-3 space-y-2 max-h-64 overflow-y-auto">
                      @for (result of searchResults(); track result._id) {
                        <a 
                          [routerLink]="['/post', result.slug]"
                          (click)="toggleSearch()"
                          class="block p-2 hover:bg-gray-50 rounded-lg">
                          <p class="font-medium text-gray-900 text-sm">{{ result.title }}</p>
                          <p class="text-xs text-gray-500">{{ getAuthorName(result.author) }}</p>
                        </a>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <!-- User Menu -->
            @if (isAuthenticated()) {
              <div class="relative">
                <button 
                  (click)="toggleUserMenu()"
                  class="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                  <img 
                    [src]="currentUser()?.avatarUrl || '/assets/images/default-avatar.png'"
                    [alt]="currentUser()?.name || 'User'"
                    class="w-8 h-8 rounded-full">
                </button>
                
                @if (isUserMenuOpen()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    @for (item of userMenuItems; track item.label) {
                      <a 
                        [routerLink]="item.route"
                        (click)="toggleUserMenu()"
                        class="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        {{ item.label }}
                      </a>
                    }
                    <hr class="my-2">
                    <button 
                      (click)="logout()"
                      class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">
                      Sign Out
                    </button>
                  </div>
                }
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

            <!-- Mobile Menu Button -->
            <button 
              (click)="toggleMenu()"
              class="md:hidden text-gray-500 hover:text-gray-700 p-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        @if (isMenuOpen()) {
          <div class="md:hidden py-4 border-t border-gray-200">
            <div class="space-y-2">
              @for (item of navigationItems; track item.label) {
                <a 
                  [routerLink]="item.route"
                  (click)="toggleMenu()"
                  class="block px-2 py-2 text-gray-700 hover:text-amber-600 font-medium">
                  {{ item.label }}
                </a>
              }
            </div>
          </div>
        }
      </nav>
    </header>
  `,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private destroy$ = new Subject<void>();

  // State management with signals
  isMenuOpen = signal(false);
  isSearchOpen = signal(false);
  isUserMenuOpen = signal(false);
  currentUser = signal<User | null>(null);
  isLoading = signal(false);
  searchResults = signal<SearchResult[]>([]);
  searchError = signal<string | null>(null);
  
  // Form controls
  searchControl = new FormControl('');
  
  // Computed properties
  isAuthenticated = computed(() => this.currentUser() !== null);
  
  // Navigation items
  navigationItems: NavigationItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Categories', route: '/categories' },
    { label: 'Tags', route: '/tags' },
    { label: 'About', route: '/about' }
  ];

  userMenuItems: NavigationItem[] = [
    { label: 'Profile', route: '/profile', icon: 'user' },
    { label: 'My Posts', route: '/my-posts', icon: 'document' },
    { label: 'Bookmarks', route: '/bookmarks', icon: 'bookmark' },
    { label: 'Settings', route: '/settings', icon: 'cog' },
    { label: 'Write', route: '/write', icon: 'pencil' }
  ];

  ngOnInit(): void {
    this.loadCurrentUser();
    this.setupSearch();
    this.setupClickOutside();
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    // Check if authenticated first
    if (!this.apiService.isAuthenticated()) {
      this.currentUser.set(null);
      return;
    }

    this.apiService.getCurrentUser().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Failed to load current user:', error);
        // Clear user on auth error
        this.currentUser.set(null);
        return of(null);
      })
    ).subscribe(user => {
      this.currentUser.set(user);
    });
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchError.set(null);
      
      if (query && query.trim().length > 2) {
        this.performSearch(query.trim());
      } else {
        this.searchResults.set([]);
      }
    });
  }

  private setupClickOutside(): void {
    document.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const searchContainer = document.querySelector('.search-container');
      const userMenuContainer = document.querySelector('.user-menu-container');
      
      if (searchContainer && !searchContainer.contains(target)) {
        this.isSearchOpen.set(false);
      }
      
      if (userMenuContainer && !userMenuContainer.contains(target)) {
        this.isUserMenuOpen.set(false);
      }
    });
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        this.toggleSearch();
      }
      
      // Escape to close all menus
      if (event.key === 'Escape') {
        this.closeAllMenus();
      }
    });
  }

  private performSearch(query: string): void {
    this.isLoading.set(true);
    
    this.apiService.searchPosts(query).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Search failed:', error);
        this.searchError.set('Search failed. Please try again.');
        return of({ data: [], currentPage: 1, totalPages: 0, totalItems: 0 });
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(response => {
      const searchResults = response.data.map(post => ({ ...post, type: 'post' as const }));
      this.searchResults.set(searchResults);
    });
  }

  toggleMenu(): void {
    this.isMenuOpen.update(current => !current);
    // Close other menus
    if (this.isMenuOpen()) {
      this.isSearchOpen.set(false);
      this.isUserMenuOpen.set(false);
    }
  }

  toggleSearch(): void {
    this.isSearchOpen.update(current => !current);
    
    if (this.isSearchOpen()) {
      // Close other menus
      this.isMenuOpen.set(false);
      this.isUserMenuOpen.set(false);
      
      // Focus search input after DOM update
      setTimeout(() => {
        const searchInput = document.querySelector('#search-input') as HTMLInputElement;
        searchInput?.focus();
      }, 100);
    } else {
      // Clear search when closing
      this.searchControl.setValue('');
      this.searchResults.set([]);
      this.searchError.set(null);
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(current => !current);
    // Close other menus
    if (this.isUserMenuOpen()) {
      this.isMenuOpen.set(false);
      this.isSearchOpen.set(false);
    }
  }

  closeAllMenus(): void {
    this.isMenuOpen.set(false);
    this.isSearchOpen.set(false);
    this.isUserMenuOpen.set(false);
  }

  navigateToSearch(): void {
    const query = this.searchControl.value;
    if (query && query.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: query.trim() } });
      this.closeAllMenus();
    }
  }

  logout(): void {
    if (this.isLoading()) return;
    
    this.isLoading.set(true);
    
    this.apiService.logout().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Logout failed:', error);
        this.showToast('Logout failed. Please try again.', 'error');
        return of({ message: 'Logout completed locally' });
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(() => {
      this.currentUser.set(null);
      this.closeAllMenus();
      this.showToast('Successfully logged out', 'success');
      this.router.navigate(['/']);
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
    this.closeAllMenus();
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
    this.closeAllMenus();
  }

  onSearchResultClick(result: SearchResult): void {
    if (result.slug) {
      this.router.navigate(['/post', result.slug]);
    } else {
      this.router.navigate(['/post', result._id]);
    }
    this.closeAllMenus();
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `
      flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg transform transition-all duration-300 translate-x-full
      ${type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
        type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 
        'bg-blue-50 text-blue-800 border border-blue-200'}
    `;

    toast.innerHTML = `
      <div class="flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          ${type === 'success' ? 
            '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>' :
            type === 'error' ?
            '<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>' :
            '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>'
          }
        </svg>
        <span>${message}</span>
      </div>
      <button class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-gray-100 focus:outline-none" onclick="this.parentElement.remove()">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    `;

    // Add to container
    const container = document.getElementById('toast-container');
    if (container) {
      container.appendChild(toast);

      // Animate in
      setTimeout(() => {
        toast.classList.remove('translate-x-full');
      }, 100);

      // Auto remove after 5 seconds
      setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }, 5000);
    }
  }

  // Utility method for keyboard navigation
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeAllMenus();
    }
  }

  getAuthorName(author: string | User): string {
    return typeof author === 'string' ? 'Unknown Author' : author.name;
  }
}
