import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Post, User, PostQueryParams } from '../../../types/api';
import { catchError, debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface PostAction {
  label: string;
  icon: string;
  action: (post: Post) => void;
  class: string;
  condition?: (post: Post) => boolean;
}

interface FilterOption {
  label: string;
  value: 'all' | 'published' | 'draft' | 'archived';
  count?: number;
}

@Component({
  selector: 'app-my-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './my-posts.html'
})
export class MyPostsComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // State signals
  posts = signal<Post[]>([]);
  currentUser = signal<User | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedPosts = signal<Set<string>>(new Set());
  
  // Pagination signals
  currentPage = signal(1);
  totalPages = signal(0);
  totalItems = signal(0);
  itemsPerPage = signal(12);

  // Filter and search signals
  activeFilter = signal<'all' | 'published' | 'draft' | 'archived'>('all');
  searchControl = new FormControl('');
  sortBy = signal<'recent' | 'title' | 'likes' | 'views'>('recent');

  // Computed properties
  hasSelection = computed(() => this.selectedPosts().size > 0);
  filteredPosts = computed(() => {
    const posts = this.posts();
    const filter = this.activeFilter();
    
    if (filter === 'all') return posts;
    return posts.filter(post => post.status === filter);
  });
  
  isEmpty = computed(() => this.posts().length === 0 && !this.isLoading());
  
  // Filter options with counts
  filterOptions = computed<FilterOption[]>(() => {
    const posts = this.posts();
    return [
      { 
        label: 'All Posts', 
        value: 'all', 
        count: posts.length 
      },
      { 
        label: 'Published', 
        value: 'published', 
        count: posts.filter(p => p.status === 'published').length 
      },
      { 
        label: 'Drafts', 
        value: 'draft', 
        count: posts.filter(p => p.status === 'draft').length 
      },
      { 
        label: 'Archived', 
        value: 'archived', 
        count: posts.filter(p => p.status === 'archived').length 
      }
    ];
  });

  // Post actions
  postActions: PostAction[] = [
    {
      label: 'View',
      icon: 'eye',
      action: (post) => this.viewPost(post),
      class: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
      condition: (post) => post.status === 'published'
    },
    {
      label: 'Edit',
      icon: 'pencil',
      action: (post) => this.editPost(post),
      class: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
    },
    {
      label: 'Duplicate',
      icon: 'duplicate',
      action: (post) => this.duplicatePost(post),
      class: 'text-green-600 hover:text-green-700 hover:bg-green-50'
    },
    {
      label: 'Delete',
      icon: 'trash',
      action: (post) => this.deletePost(post),
      class: 'text-red-600 hover:text-red-700 hover:bg-red-50'
    }
  ];
Math: any;

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadPosts();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.apiService.getCurrentUser().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Failed to load user:', error);
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
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadPosts();
    });
  }

  public loadPosts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params: PostQueryParams = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      sort: this.getSortParam(),
      author: this.currentUser()?._id,
      search: this.searchControl.value || undefined
    };

    this.apiService.getPosts(params).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Failed to load posts:', error);
        this.error.set('Failed to load posts. Please try again.');
        return of({ data: [], currentPage: 1, totalPages: 0, totalItems: 0 });
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(response => {
      this.posts.set(response.data);
      this.currentPage.set(response.currentPage);
      this.totalPages.set(response.totalPages);
      this.totalItems.set(response.totalItems);
    });
  }

  private getSortParam(): string {
    const sortBy = this.sortBy();
    switch (sortBy) {
      case 'recent': return '-createdAt';
      case 'title': return 'title';
      case 'likes': return '-likeCount';
      case 'views': return '-viewCount';
      default: return '-createdAt';
    }
  }

  // Filter and sorting methods
  setFilter(filter: 'all' | 'published' | 'draft' | 'archived'): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
    this.loadPosts();
  }

  setSortBy(sortBy: 'recent' | 'title' | 'likes' | 'views'): void {
    this.sortBy.set(sortBy);
    this.currentPage.set(1);
    this.loadPosts();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPosts();
    }
  }

  // Selection methods
  togglePostSelection(postId: string): void {
    const selected = new Set(this.selectedPosts());
    if (selected.has(postId)) {
      selected.delete(postId);
    } else {
      selected.add(postId);
    }
    this.selectedPosts.set(selected);
  }

  selectAllPosts(): void {
    const allPostIds = new Set(this.filteredPosts().map(post => post._id));
    this.selectedPosts.set(allPostIds);
  }

  clearSelection(): void {
    this.selectedPosts.set(new Set());
  }

  // Post action methods
  viewPost(post: Post): void {
    if (post.slug) {
      this.router.navigate(['/post', post.slug]);
    } else {
      this.router.navigate(['/post', post._id]);
    }
  }

  editPost(post: Post): void {
    this.router.navigate(['/write'], { queryParams: { edit: post._id } });
  }

  duplicatePost(post: Post): void {
    this.isLoading.set(true);
    
    const duplicateData = {
      title: `${post.title} (Copy)`,
      content: post.content,
      excerpt: post.excerpt,
      tags: Array.isArray(post.tags) ? post.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : [],
      status: 'draft' as const
    };

    this.apiService.createPost(duplicateData).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Failed to duplicate post:', error);
        this.showToast('Failed to duplicate post', 'error');
        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(newPost => {
      if (newPost) {
        this.showToast('Post duplicated successfully', 'success');
        this.loadPosts();
      }
    });
  }

  deletePost(post: Post): void {
    if (confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      this.isLoading.set(true);
      
      this.apiService.deletePost(post._id).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Failed to delete post:', error);
          this.showToast('Failed to delete post', 'error');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      ).subscribe(result => {
        if (result) {
          this.showToast('Post deleted successfully', 'success');
          this.loadPosts();
          // Remove from selection if it was selected
          const selected = new Set(this.selectedPosts());
          selected.delete(post._id);
          this.selectedPosts.set(selected);
        }
      });
    }
  }

  // Bulk actions
  bulkDelete(): void {
    const selectedIds = Array.from(this.selectedPosts());
    if (selectedIds.length === 0) return;

    const confirmation = confirm(
      `Are you sure you want to delete ${selectedIds.length} post${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (confirmation) {
      this.isLoading.set(true);
      
      const deletePromises = selectedIds.map(id => 
        this.apiService.deletePost(id).pipe(
          catchError(error => {
            console.error(`Failed to delete post ${id}:`, error);
            return of(null);
          })
        )
      );

      // Execute all deletions
      Promise.all(deletePromises.map(obs => obs.toPromise())).then(results => {
        const successCount = results.filter(result => result !== null).length;
        const failedCount = selectedIds.length - successCount;
        
        if (successCount > 0) {
          this.showToast(`Successfully deleted ${successCount} post${successCount > 1 ? 's' : ''}`, 'success');
        }
        
        if (failedCount > 0) {
          this.showToast(`Failed to delete ${failedCount} post${failedCount > 1 ? 's' : ''}`, 'error');
        }

        this.clearSelection();
        this.loadPosts();
        this.isLoading.set(false);
      });
    }
  }

  createNewPost(): void {
    this.router.navigate(['/write']);
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

  // Utility methods
  getPostStatusClass(status: string): string {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
