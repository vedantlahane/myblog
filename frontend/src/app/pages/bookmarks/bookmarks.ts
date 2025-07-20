import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { catchError, debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface Bookmark {
  _id: string;
  post: {
    _id: string;
    title: string;
    excerpt?: string;
    coverImage?: string;
    slug?: string;
  };
  notes?: string;
  progress?: number;
  bookmarkedAt: string;
  collections?: string[];
}

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './bookmarks.html'
})
export class BookmarksComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // State signals
  bookmarks = signal<Bookmark[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedBookmarks = signal<Set<string>>(new Set());
  
  // Filter and view signals
  activeView = signal<'grid' | 'list'>('grid');
  activeFilter = signal<'all' | 'recent' | 'progress' | 'notes'>('all');
  selectedCollection = signal<string | null>(null);
  searchControl = new FormControl('');
  sortBy = signal<'recent' | 'title' | 'progress' | 'bookmarked'>('recent');

  // Pagination signals
  currentPage = signal(1);
  totalPages = signal(0);
  totalItems = signal(0);
  itemsPerPage = signal(12);

  // Collections
  collections = signal<any[]>([]);
  
  // Add Math reference for template
  Math = Math;

  // Filter options
  filters = [
    { value: 'all' as const, label: 'All Bookmarks' },
    { value: 'recent' as const, label: 'Recently Added' },
    { value: 'progress' as const, label: 'In Progress' },
    { value: 'notes' as const, label: 'With Notes' }
  ];

  // Bookmark actions
  bookmarkActions = [
    {
      label: 'Read',
      icon: 'book',
      action: (bookmark: Bookmark) => this.readPost(bookmark),
      class: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
    },
    {
      label: 'Edit Notes',
      icon: 'pencil',
      action: (bookmark: Bookmark) => this.editBookmarkNotes(bookmark),
      class: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
    },
    {
      label: 'Remove',
      icon: 'trash',
      action: (bookmark: Bookmark) => this.removeBookmark(bookmark),
      class: 'text-red-600 hover:text-red-700 hover:bg-red-50'
    }
  ];
  
  // Computed properties
  hasSelection = computed(() => this.selectedBookmarks().size > 0);
  filteredBookmarks = computed(() => {
    let bookmarks = this.bookmarks();
    const filter = this.activeFilter();
    const collection = this.selectedCollection();
    
    // Filter by collection
    if (collection && collection !== 'all') {
      bookmarks = bookmarks.filter(bookmark => 
        bookmark.collections?.includes(collection)
      );
    }
    
    // Filter by type
    switch (filter) {
      case 'recent':
        break;
      case 'progress':
        bookmarks = bookmarks.filter(bookmark => 
          bookmark.progress !== undefined && bookmark.progress > 0
        );
        break;
      case 'notes':
        bookmarks = bookmarks.filter(bookmark => 
          bookmark.notes && bookmark.notes.trim().length > 0
        );
        break;
    }
    
    return bookmarks;
  });
  
  isEmpty = computed(() => this.bookmarks().length === 0 && !this.isLoading());

  ngOnInit(): void {
    this.loadBookmarks();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadBookmarks();
    });
  }

  loadBookmarks(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      search: this.searchControl.value || undefined
    };

    // Mock data for now since backend bookmarks endpoint may not exist yet
    setTimeout(() => {
      const mockBookmarks: Bookmark[] = [
        {
          _id: '1',
          post: {
            _id: 'post1',
            title: 'Getting Started with Angular 20',
            excerpt: 'Learn about the latest features in Angular 20 including improved signals, better performance, and new control flow syntax.',
            coverImage: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Angular+20',
            slug: 'getting-started-angular-20'
          },
          notes: 'Great article for beginners. Need to practice the new control flow syntax.',
          progress: 75,
          bookmarkedAt: new Date().toISOString(),
          collections: ['Frontend', 'Learning']
        },
        {
          _id: '2',
          post: {
            _id: 'post2',
            title: 'Tailwind CSS 4.0 New Features',
            excerpt: 'Discover what\'s new in Tailwind CSS 4.0 with improved performance, new utilities, and better developer experience.',
            coverImage: 'https://via.placeholder.com/400x300/06b6d4/ffffff?text=Tailwind+4.0',
            slug: 'tailwind-css-4-features'
          },
          progress: 25,
          bookmarkedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          collections: ['CSS', 'Tools']
        },
        {
          _id: '3',
          post: {
            _id: 'post3',
            title: 'Building Modern APIs with Node.js',
            excerpt: 'Learn how to build scalable and maintainable APIs using Node.js, Express, and modern best practices.',
            slug: 'building-modern-apis-nodejs'
          },
          notes: 'Important patterns for the current project',
          bookmarkedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          collections: ['Backend', 'Node.js']
        }
      ];
      
      this.bookmarks.set(mockBookmarks);
      this.totalItems.set(mockBookmarks.length);
      this.totalPages.set(Math.ceil(mockBookmarks.length / this.itemsPerPage()));
      this.isLoading.set(false);
    }, 1000);
  }

  // View controls
  setView(view: 'grid' | 'list'): void {
    this.activeView.set(view);
  }

  setFilter(filter: 'all' | 'recent' | 'progress' | 'notes'): void {
    this.activeFilter.set(filter);
  }

  setCollection(collection: string | null): void {
    this.selectedCollection.set(collection);
  }

  setSortBy(sort: 'recent' | 'title' | 'progress' | 'bookmarked'): void {
    this.sortBy.set(sort);
  }

  // Selection methods
  toggleBookmarkSelection(bookmarkId: string): void {
    const selected = new Set(this.selectedBookmarks());
    if (selected.has(bookmarkId)) {
      selected.delete(bookmarkId);
    } else {
      selected.add(bookmarkId);
    }
    this.selectedBookmarks.set(selected);
  }

  clearSelection(): void {
    this.selectedBookmarks.set(new Set());
  }

  bulkRemove(): void {
    if (confirm(`Are you sure you want to remove ${this.selectedBookmarks().size} bookmarks?`)) {
      const selected = this.selectedBookmarks();
      const remaining = this.bookmarks().filter(bookmark => !selected.has(bookmark._id));
      this.bookmarks.set(remaining);
      this.clearSelection();
    }
  }

  // Navigation methods
  goToHome(): void {
    this.router.navigate(['/']);
  }

  readPost(bookmark: Bookmark): void {
    if (bookmark.post.slug) {
      this.router.navigate(['/posts', bookmark.post.slug]);
    } else {
      this.router.navigate(['/posts', bookmark.post._id]);
    }
  }

  // Bookmark actions
  editBookmarkNotes(bookmark: Bookmark): void {
    const newNotes = prompt('Edit notes for this bookmark:', bookmark.notes || '');
    if (newNotes !== null) {
      // Update the bookmark in the array
      const bookmarks = this.bookmarks();
      const index = bookmarks.findIndex(b => b._id === bookmark._id);
      if (index !== -1) {
        bookmarks[index] = { ...bookmarks[index], notes: newNotes };
        this.bookmarks.set([...bookmarks]);
      }
    }
  }

  removeBookmark(bookmark: Bookmark): void {
    if (confirm('Are you sure you want to remove this bookmark?')) {
      const remaining = this.bookmarks().filter(b => b._id !== bookmark._id);
      this.bookmarks.set(remaining);
    }
  }

  updateProgress(bookmark: Bookmark, progress: number): void {
    const bookmarks = this.bookmarks();
    const index = bookmarks.findIndex(b => b._id === bookmark._id);
    if (index !== -1) {
      bookmarks[index] = { ...bookmarks[index], progress };
      this.bookmarks.set([...bookmarks]);
    }
  }

  // Pagination methods
  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadBookmarks();
  }

  // Utility methods
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getProgressColor(progress?: number): string {
    if (!progress) return 'bg-gray-200';
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-yellow-500';
    if (progress < 75) return 'bg-blue-500';
    return 'bg-green-500';
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push(-1, total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }

    return rangeWithDots;
  }
}
