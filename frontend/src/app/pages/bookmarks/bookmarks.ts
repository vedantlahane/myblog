import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Bookmark, Post, UserCollection, UpdateBookmarkRequest, BookmarkQueryParams } from '../../../types/api';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
  <div class="min-h-screen bg-gradient-to-b from-brand-accent-gold/6 to-brand-cyan/6">
      <!-- Header -->
  <header class="bg-surface border-4 border-brand-accent-gold p-8 mb-12">
  <div class="text-center border-2 border-dotted border-brand-accent-gold p-6">
          <div class="inline-block bg-brand-accent-gold text-brand-navy px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
            My Reading List
          </div>
          
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-brand-navy mb-3">
            My Bookmarks
          </h1>
          <p class="text-brand-accent-gold text-lg font-mono">
            {{ totalBookmarks() }} articles saved for later reading
          </p>
        </div>
      </header>

      <div class="max-w-6xl mx-auto px-4">
        <!-- Filters & Search -->
        <section class="mb-8">
          <div class="bg-surface border-4 border-brand-accent-gold/20 p-6">
            <div class="grid md:grid-cols-3 gap-6">
              <!-- Search -->
              <div>
                <label class="block text-brand-navy font-mono text-sm font-bold mb-2">
                  Search Bookmarks
                </label>
                <div class="relative">
                  <input
                    [formControl]="searchControl"
                    type="text"
                    placeholder="Search by title, author, or notes..."
                    class="w-full px-4 py-3 pl-10 border-2 border-brand-accent-gold focus:border-brand-accent-gold focus:outline-none bg-white font-mono text-sm"
                  />
                  <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>

              <!-- Collection Filter -->
              <div>
                <label class="block text-brand-navy font-mono text-sm font-bold mb-2">
                  Filter by Collection
                </label>
                <select 
                  [formControl]="collectionControl"
                  class="w-full px-4 py-3 border-2 border-brand-accent-gold focus:border-brand-accent-gold focus:outline-none bg-white font-mono text-sm"
                >
                  <option value="">All Bookmarks</option>
                  @for (collection of bookmarkCollections(); track collection._id) {
                    <option [value]="collection._id">{{ collection._id }} ({{ collection.count }})</option>
                  }
                </select>
              </div>

              <!-- Sort -->
              <div>
                <label class="block text-brand-navy font-mono text-sm font-bold mb-2">
                  Sort By
                </label>
                <select 
                  [formControl]="sortControl"
                  class="w-full px-4 py-3 border-2 border-brand-accent-gold focus:border-brand-accent-gold focus:outline-none bg-white font-mono text-sm"
                >
                  <option value="-createdAt">Recently Bookmarked</option>
                  <option value="createdAt">Oldest Bookmarks</option>
                  <option value="post.title">Title (A-Z)</option>
                  <option value="-post.title">Title (Z-A)</option>
                </select>
              </div>
            </div>

            <!-- Active Filters -->
            @if (hasActiveFilters()) {
                  <div class="mt-6 pt-4 border-t-2 border-dotted border-brand-accent-gold">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-brand-accent-gold font-mono text-sm font-bold">Active filters:</span>
                  
                  @if (searchQuery()) {
                    <span class="inline-flex items-center gap-1 bg-brand-accent-gold/10 text-brand-accent-gold px-3 py-1 text-xs font-mono">
                      Search: {{ searchQuery() }}
                      <button (click)="clearSearch()" class="hover:text-brand-navy">×</button>
                    </span>
                  }
                  
                  @if (collectionFilter()) {
                    <span class="inline-flex items-center gap-1 bg-brand-accent-gold/10 text-brand-accent-gold px-3 py-1 text-xs font-mono">
                      Collection: {{ getCollectionName(collectionFilter()) }}
                      <button (click)="clearCollectionFilter()" class="hover:text-brand-navy">×</button>
                    </span>
                  }
                  
                  <button
                    (click)="clearAllFilters()"
                    class="text-brand-accent-gold hover:text-brand-navy text-xs font-mono underline ml-2"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Bookmarks List -->
        <section class="mb-12">
          @if (loading()) {
            <!-- Loading Skeleton -->
            <div class="space-y-6">
              @for (i of [1,2,3]; track i) {
                <div class="bg-surface border-2 border-brand-accent-gold/20 p-6 animate-pulse">
                  <div class="flex gap-6">
                    <div class="w-32 h-24 bg-brand-accent-gold/10"></div>
                    <div class="flex-1 space-y-3">
                      <div class="h-6 bg-brand-accent-gold/10 rounded"></div>
                      <div class="h-4 bg-brand-accent-gold/10 rounded w-5/6"></div>
                      <div class="h-4 bg-brand-accent-gold/10 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else if (filteredBookmarks().length === 0) {
            <!-- Empty State -->
            <div class="text-center py-16">
              <div class="inline-block border-4 border-brand-accent-gold p-12 bg-surface">
                <div class="text-brand-accent-gold font-mono text-lg mb-4">📚 EMPTY BOOKSHELF</div>
                <p class="text-brand-accent-gold mb-6">
                  @if (hasActiveFilters()) {
                    No bookmarks match your current filters.
                  } @else {
                    You haven't bookmarked any articles yet.
                  }
                </p>
                @if (hasActiveFilters()) {
                    <button
                    (click)="clearAllFilters()"
                    class="bg-brand-accent-gold text-brand-navy px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-brand-accent-gold/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                } @else {
                  <a
                    routerLink="/"
                    class="inline-block bg-brand-accent-gold text-brand-navy px-8 py-3 font-mono text-sm uppercase tracking-wider hover:bg-brand-accent-gold/90 transition-colors border-2 border-brand-accent-gold"
                  >
                    Discover Articles
                  </a>
                }
              </div>
            </div>
          } @else {
            <!-- Bookmarks List -->
            <div class="space-y-6">
              @for (bookmark of filteredBookmarks(); track bookmark._id) {
                @if (getPost(bookmark)) {
                  <article class="bg-surface border-2 border-brand-accent-gold/20 hover:border-brand-accent-gold transition-all duration-300 group">
                    <div class="p-6">
                      <div class="flex items-start gap-6">
                        <!-- Post Cover Image -->
                        <div class="w-48 h-32 flex-shrink-0">
                            <img 
                            [src]="getPost(bookmark)?.coverImage || '/assets/placeholder-image.png'" 
                            [alt]="getPost(bookmark)?.title"
                            class="w-full h-full object-cover border-2 border-brand-accent-gold group-hover:sepia-[20%] transition-all"
                          >
                        </div>
                        
                        <!-- Bookmark Content -->
                        <div class="flex-1">
                          <div class="flex items-start justify-between mb-2">
                            <h3 class="font-serif text-xl font-bold text-brand-navy leading-tight">
                              <a 
                                [routerLink]="['/post', getPost(bookmark)?.slug]"
                                class="hover:text-brand-accent-gold transition-colors"
                              >
                                {{ getPost(bookmark)?.title }}
                              </a>
                            </h3>
                            
                            <!-- Actions -->
                            <div class="flex items-center gap-2">
                              <button
                                (click)="editBookmark(bookmark)"
                                class="inline-flex items-center justify-center w-8 h-8 bg-brand-accent-gold/10 text-brand-accent-gold hover:bg-brand-accent-gold/20 transition-colors"
                                title="Edit Notes/Collections"
                              >
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                                </svg>
                              </button>
                              
                              <button
                                (click)="removeBookmark(bookmark._id)"
                                [disabled]="deleting().includes(bookmark._id)"
                                class="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50"
                                title="Remove Bookmark"
                              >
                                @if (deleting().includes(bookmark._id)) {
                                  <div class="w-3 h-3 border border-red-800 border-t-transparent rounded-full animate-spin"></div>
                                } @else {
                                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                                  </svg>
                                }
                              </button>
                            </div>
                          </div>

                          <!-- Post Meta -->
                          <div class="flex items-center gap-4 text-xs font-mono text-brand-accent-gold mb-4">
                            <span>By {{ getPostAuthor(bookmark) }}</span>
                            <span>•</span>
                            <span>{{ getPost(bookmark)?.readingTime || 1 }} min read</span>
                            <span>•</span>
                            <span>Bookmarked {{ formatDate(bookmark.createdAt) }}</span>
                          </div>
                          
                          @if (bookmark.notes) {
                            <div class="p-3 bg-brand-accent-gold/10 border-2 border-dotted border-brand-accent-gold/20 mb-4">
                              <h4 class="font-bold text-brand-navy text-sm mb-1">My Notes:</h4>
                              <p class="text-brand-accent-gold text-sm italic">"{{ bookmark.notes }}"</p>
                            </div>
                          }

                          <!-- Collections -->
                          @if (bookmark.collections && bookmark.collections.length > 0) {
                            <div class="flex flex-wrap items-center gap-2">
                              <span class="text-brand-accent-gold font-mono text-xs">In collections:</span>
                              @for (collectionId of bookmark.collections; track collectionId) {
                                <span class="inline-block bg-brand-accent-gold/10 text-brand-accent-gold px-2 py-1 text-xs font-mono">
                                  {{ getCollectionName(collectionId) }}
                                </span>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </article>
                }
              }
            </div>
            
            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="mt-12 flex justify-center">
                <div class="flex items-center gap-2">
                  <button
                    (click)="goToPage(currentPage() - 1)"
                    [disabled]="currentPage() === 1"
                    class="px-4 py-2 bg-surface text-brand-navy font-mono text-sm hover:bg-brand-accent-gold/10 transition-colors border-2 border-brand-accent-gold disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  
                  @for (page of getPaginationPages(); track page) {
                    @if (page === '...') {
                      <span class="px-3 py-2 text-brand-accent-gold font-mono text-sm">...</span>
                    } @else {
                      <button
                        (click)="goToPage(+page)"
                        [class]="getPageButtonClass(+page)"
                      >
                        {{ page }}
                      </button>
                    }
                  }
                  
                  <button
                    (click)="goToPage(currentPage() + 1)"
                    [disabled]="currentPage() === totalPages()"
                    class="px-4 py-2 bg-surface text-brand-navy font-mono text-sm hover:bg-brand-accent-gold/10 transition-colors border-2 border-brand-accent-gold disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            }
          }
        </section>
      </div>
    </div>

    <!-- Edit Bookmark Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModal()">
    <div class="bg-surface border-4 border-brand-accent-gold p-6 max-w-lg w-full mx-4" (click)="$event.stopPropagation()">
          <h3 class="font-serif text-xl font-bold text-brand-navy mb-4">
            Edit Bookmark
          </h3>
          
          <form [formGroup]="bookmarkForm" (ngSubmit)="saveBookmark()">
            <div class="space-y-4">
              <!-- Notes -->
              <div>
                <label class="block text-brand-navy font-mono text-sm font-bold mb-2">My Notes</label>
                <textarea
                  formControlName="notes"
                  rows="3"
                  placeholder="Add your thoughts about this article..."
                  class="w-full px-4 py-3 border-2 border-brand-accent-gold focus:border-brand-accent-gold focus:outline-none bg-white resize-none"
                ></textarea>
              </div>
              
              <!-- Collections -->
              <div>
                <label class="block text-brand-navy font-mono text-sm font-bold mb-2">Add to Collections</label>
                <div class="max-h-40 overflow-y-auto space-y-2 p-2 border-2 border-brand-accent-gold bg-white">
                  @if (userCollections().length === 0) {
                    <p class="text-brand-accent-gold text-sm italic">No collections available.</p>
                  } @else {
                    @for (collection of userCollections(); track collection._id) {
                      <label class="flex items-center p-2 hover:bg-surface transition-colors">
                        <input
                          type="checkbox"
                          (change)="onCollectionChange(collection._id, $event)"
                          [checked]="bookmarkForm.get('collections')?.value?.includes(collection._id) || false"
                          class="mr-3 text-brand-accent-gold"
                        />
                        <span class="text-brand-navy">{{ collection.title }}</span>
                      </label>
                    }
                  }
                </div>
              </div>
            </div>
            
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                (click)="closeModal()"
                class="bg-brand-accent-gold/10 text-brand-accent-gold px-4 py-2 font-mono text-sm hover:bg-brand-accent-gold/20 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                [disabled]="bookmarkForm.invalid || saving()"
                class="bg-brand-accent-gold text-brand-navy px-4 py-2 font-mono text-sm hover:bg-brand-accent-gold/90 transition-colors disabled:opacity-50"
              >
                {{ saving() ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    /* Custom checkbox styling */
    input[type="checkbox"] {
      appearance: none;
      background-color: white;
      border: 2px solid #D4A761; /* brand-accent-gold */
      width: 1rem;
      height: 1rem;
      position: relative;
      cursor: pointer;
    }

    input[type="checkbox"]:checked {
      background-color: #D4A761; /* brand-accent-gold */
    }

    input[type="checkbox"]:checked::before {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
    }
  `]
})
export class BookmarksComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Reactive Signals
  loading = signal(false);
  saving = signal(false);
  bookmarks = signal<Bookmark[]>([]);
  bookmarkCollections = signal<UserCollection[]>([]);
  userCollections = signal<any[]>([]);
  totalBookmarks = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  
  deleting = signal<string[]>([]);
  showModal = signal(false);
  editingBookmark = signal<Bookmark | null>(null);

  // Form Controls
  searchControl = new FormControl('');
  collectionControl = new FormControl('');
  sortControl = new FormControl('-createdAt');

  // Filter states
  searchQuery = signal('');
  collectionFilter = signal('');

  // Bookmark Form
  bookmarkForm = new FormGroup({
    notes: new FormControl(''),
    collections: new FormControl<string[]>([])
  });

  // Computed values
  filteredBookmarks = computed(() => {
    // In a real implementation with a proper backend,
    // these filters would be passed to the API.
    // For now, we filter client-side.
    let filtered = [...this.bookmarks()];
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(bookmark => 
        (bookmark.notes?.toLowerCase().includes(query)) ||
        (this.getPost(bookmark)?.title.toLowerCase().includes(query)) ||
        (this.getPostAuthor(bookmark).toLowerCase().includes(query))
      );
    }
    
    if (this.collectionFilter()) {
      const collectionId = this.collectionFilter();
      filtered = filtered.filter(bookmark => bookmark.collections?.includes(collectionId));
    }
    
    return this.sortBookmarks(filtered);
  });

  hasActiveFilters = computed(() => 
    !!(this.searchQuery() || this.collectionFilter())
  );

  async ngOnInit() {
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    await this.loadBookmarks();
    await this.loadBookmarkCollections();
    await this.loadUserCollections();
  }

  private async loadBookmarks() {
    try {
      this.loading.set(true);
      
      const params: BookmarkQueryParams = {
        page: this.currentPage(),
        limit: 10
      };

      const response = await this.apiService.getBookmarks(params);
      
      this.bookmarks.set(response.bookmarks || response.data || []);
      this.totalBookmarks.set(response.totalBookmarks || response.totalItems || 0);
      this.totalPages.set(response.totalPages || 1);
      
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      this.bookmarks.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadBookmarkCollections() {
    try {
      const collections = await this.apiService.getBookmarkCollections();
      this.bookmarkCollections.set(collections);
    } catch (error) {
      console.error('Failed to load bookmark collections:', error);
    }
  }

  private async loadUserCollections() {
    try {
      const collections = await this.apiService.getUserCollections();
      this.userCollections.set(collections);
    } catch (error) {
      console.error('Failed to load user collections:', error);
    }
  }

  private sortBookmarks(bookmarks: Bookmark[]): Bookmark[] {
    const sortBy = this.sortControl.value || '-createdAt';
    const [direction, field] = sortBy.startsWith('-') 
      ? ['desc', sortBy.slice(1)] 
      : ['asc', sortBy];

    return [...bookmarks].sort((a, b) => {
      let aVal, bVal;
      
      switch (field) {
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'post.title':
          const aPost = this.getPost(a);
          const bPost = this.getPost(b);
          aVal = aPost ? aPost.title.toLowerCase() : '';
          bVal = bPost ? bPost.title.toLowerCase() : '';
          break;
        default:
          return 0;
      }
      
      if (direction === 'desc') {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });
  }

  // Modal Management
  editBookmark(bookmark: Bookmark) {
    this.editingBookmark.set(bookmark);
    this.bookmarkForm.patchValue({
      notes: bookmark.notes || '',
      collections: bookmark.collections || []
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingBookmark.set(null);
    this.bookmarkForm.reset();
  }

  onCollectionChange(collectionId: string, event: any) {
    const collections = this.bookmarkForm.get('collections')?.value as string[];
    if (event.target.checked) {
      collections.push(collectionId);
    } else {
      const index = collections.indexOf(collectionId);
      if (index > -1) {
        collections.splice(index, 1);
      }
    }
    this.bookmarkForm.get('collections')?.setValue(collections);
  }

  async saveBookmark() {
    const editing = this.editingBookmark();
    if (!editing || this.bookmarkForm.invalid) return;

    try {
      this.saving.set(true);

      const formValue = this.bookmarkForm.value;
      const updateData: UpdateBookmarkRequest = {
        notes: formValue.notes || undefined,
        collections: formValue.collections || []
      };

      const updatedBookmark = await this.apiService.updateBookmark(editing._id, updateData);
      
      // Update in list
      this.bookmarks.update(bookmarks => 
        bookmarks.map(b => b._id === updatedBookmark._id ? updatedBookmark : b)
      );

      this.closeModal();

    } catch (error) {
      console.error('Failed to save bookmark:', error);
    } finally {
      this.saving.set(false);
    }
  }

  // Bookmark Actions
  async removeBookmark(bookmarkId: string) {
    if (!confirm('Are you sure you want to remove this bookmark?')) return;

    try {
      this.deleting.update(deleting => [...deleting, bookmarkId]);
      
      await this.apiService.deleteBookmark(bookmarkId);
      
      this.bookmarks.update(bookmarks => bookmarks.filter(b => b._id !== bookmarkId));
      this.totalBookmarks.update(count => count - 1);
      
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    } finally {
      this.deleting.update(deleting => deleting.filter(id => id !== bookmarkId));
    }
  }

  // Filter Management
  clearSearch() {
    this.searchControl.setValue('');
  }

  clearCollectionFilter() {
    this.collectionControl.setValue('');
  }

  clearAllFilters() {
    this.searchControl.setValue('');
    this.collectionControl.setValue('');
    this.sortControl.setValue('-createdAt');
  }

  // Pagination
  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    
    this.currentPage.set(page);
    await this.loadBookmarks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPaginationPages(): (number | string)[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: (number | string)[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 4) pages.push('...');
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 3) pages.push('...');
      pages.push(total);
    }
    
    return pages;
  }

  getPageButtonClass(page: number): string {
    const baseClass = "px-3 py-2 font-mono text-sm border-2 transition-colors";
    return page === this.currentPage()
      ? `${baseClass} bg-brand-accent-gold text-brand-navy border-brand-accent-gold`
      : `${baseClass} bg-surface text-brand-navy border-brand-accent-gold hover:bg-brand-accent-gold/10 hover:border-brand-accent-gold`;
  }

  // Helper Methods
  getPost(bookmark: Bookmark): Post | null {
    if (typeof bookmark.post === 'object') {
      return bookmark.post;
    }
    return null;
  }

  getPostAuthor(bookmark: Bookmark): string {
    const post = this.getPost(bookmark);
    if (post && typeof post.author === 'object') {
      return post.author.name;
    }
    return 'Unknown';
  }

  getCollectionName(collectionId: string): string {
    const collection = this.userCollections().find(c => c._id === collectionId);
    return collection ? collection.title : 'Unknown Collection';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
