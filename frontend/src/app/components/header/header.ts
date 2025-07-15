import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { User } from '../../../types/api';
import { catchError, debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface NavigationItem {
  label: string;
  route: string;
  icon?: string;
  requiresAuth?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './header.html',
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
  searchResults = signal<any[]>([]);
  
  // Form controls
  searchControl = new FormControl('');
  
  // Computed properties
  isAuthenticated = computed(() => this.currentUser() !== null);
  
  navigationItems: NavigationItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Music', route: '/category/music' },
    { label: 'Fashion', route: '/category/fashion' },
    { label: 'Careers', route: '/category/careers' },
    { label: 'Relationships', route: '/category/relationships' },
    { label: 'Movies', route: '/category/movies' },
    { label: 'Events', route: '/category/events' }
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.apiService.getCurrentUser().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Failed to load current user:', error);
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
      if (query && query.length > 2) {
        this.performSearch(query);
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

  private performSearch(query: string): void {
    this.isLoading.set(true);
    
    this.apiService.searchPosts(query).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Search failed:', error);
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(results => {
      this.searchResults.set(results);
    });
  }

  toggleMenu(): void {
    this.isMenuOpen.update(current => !current);
  }

  toggleSearch(): void {
    this.isSearchOpen.update(current => !current);
    if (this.isSearchOpen()) {
      // Focus search input after a brief delay
      setTimeout(() => {
        const searchInput = document.querySelector('#search-input') as HTMLInputElement;
        searchInput?.focus();
      }, 100);
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(current => !current);
  }

  closeAllMenus(): void {
    this.isMenuOpen.set(false);
    this.isSearchOpen.set(false);
    this.isUserMenuOpen.set(false);
  }

  navigateToSearch(): void {
    const query = this.searchControl.value;
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
      this.closeAllMenus();
    }
  }

  logout(): void {
    this.isLoading.set(true);
    
    this.apiService.logout().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Logout failed:', error);
        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(() => {
      this.currentUser.set(null);
      this.closeAllMenus();
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

  onSearchResultClick(result: any): void {
    this.router.navigate(['/post', result.slug]);
    this.closeAllMenus();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeAllMenus();
    }
  }
}
