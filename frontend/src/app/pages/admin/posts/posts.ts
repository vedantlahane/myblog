import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { Post, PostQueryParams, PostsResponse, User, Tag } from '../../../../types/api';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [ RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- Page Header -->
      <header class="bg-amber-100 border-4 border-amber-300 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl md:text-3xl font-bold text-amber-900 mb-2">
              Posts Management
            </h1>
            <p class="text-amber-700 font-mono text-sm">
              Manage all blog posts, drafts, and published content
            </p>
          </div>
          
          <a 
            routerLink="/write"
            class="bg-green-600 text-green-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-green-700 transition-colors border-2 border-green-700"
          >
            Create New Post
          </a>
        </div>
      </header>

      <!-- Filters & Search -->
      <section class="bg-amber-50 border-4 border-amber-300 p-6">
        <div class="grid md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Search Posts
            </label>
            <div class="relative">
              <input
                [formControl]="searchControl"
                type="text"
                placeholder="Search by title or content..."
                class="w-full px-4 py-3 pl-10 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Status
            </label>
            <select 
              [formControl]="statusControl"
              class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <!-- Author Filter -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Author
            </label>
            <select 
              [formControl]="authorControl"
              class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
            >
              <option value="">All Authors</option>
              @for (author of authors(); track author._id) {
                <option [value]="author._id">{{ author.name }}</option>
              }
            </select>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Sort By
            </label>
            <select 
              [formControl]="sortControl"
              class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-publishedAt">Recently Published</option>
              <option value="title">Title (A-Z)</option>
              <option value="-title">Title (Z-A)</option>
              <option value="-viewCount">Most Viewed</option>
              <option value="-likeCount">Most Liked</option>
            </select>
          </div>
        </div>

        <!-- Active Filters -->
        @if (hasActiveFilters()) {
          <div class="mt-6 pt-4 border-t-2 border-dotted border-amber-300">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-amber-700 font-mono text-sm font-bold">Active filters:</span>
              
              @if (searchQuery()) {
                <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                  Search: {{ searchQuery() }}
                  <button (click)="clearSearch()" class="hover:text-amber-900">×</button>
                </span>
              }
              
              @if (statusFilter()) {
                <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                  Status: {{ statusFilter() | titlecase }}
                  <button (click)="clearStatusFilter()" class="hover:text-amber-900">×</button>
                </span>
              }
              
              @if (authorFilter()) {
                <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                  Author: {{ getAuthorNameById(authorFilter()) }}
                  <button (click)="clearAuthorFilter()" class="hover:text-amber-900">×</button>
                </span>
              }
              
              <button
                (click)="clearAllFilters()"
                class="text-amber-600 hover:text-amber-800 text-xs font-mono underline ml-2"
              >
                Clear All
              </button>
            </div>
          </div>
        }
      </section>

      <!-- Bulk Actions -->
      @if (selectedPosts().length > 0) {
        <section class="bg-blue-50 border-4 border-blue-300 p-4">
          <div class="flex items-center justify-between">
            <div class="text-blue-900 font-mono text-sm">
              {{ selectedPosts().length }} post(s) selected
            </div>
            
            <div class="flex gap-3">
              <button
                (click)="bulkPublish()"
                [disabled]="bulkActionLoading()"
                class="bg-green-100 text-green-800 px-4 py-2 font-mono text-sm hover:bg-green-200 transition-colors border-2 border-green-300 disabled:opacity-50"
              >
                Publish Selected
              </button>
              
              <button
                (click)="bulkArchive()"
                [disabled]="bulkActionLoading()"
                class="bg-yellow-100 text-yellow-800 px-4 py-2 font-mono text-sm hover:bg-yellow-200 transition-colors border-2 border-yellow-300 disabled:opacity-50"
              >
                Set to Draft
              </button>
              
              <button
                (click)="bulkDelete()"
                [disabled]="bulkActionLoading()"
                class="bg-red-100 text-red-800 px-4 py-2 font-mono text-sm hover:bg-red-200 transition-colors border-2 border-red-300 disabled:opacity-50"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </section>
      }

      <!-- Posts Table -->
      <section class="bg-amber-50 border-4 border-amber-300">
        @if (loading()) {
          <!-- Loading State -->
          <div class="p-8 text-center">
            <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-lg">
              <div class="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
              Loading posts...
            </div>
          </div>
        } @else if (posts().length === 0) {
          <!-- Empty State -->
          <div class="p-8 text-center">
            <div class="inline-block border-4 border-amber-400 p-8 bg-amber-100">
              @if (hasActiveFilters()) {
                <div class="text-amber-600 font-mono text-lg mb-4">🔍 NO MATCHING POSTS</div>
                <p class="text-amber-700 mb-6">No posts match your current filters.</p>
                <button
                  (click)="clearAllFilters()"
                  class="bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors"
                >
                  Clear Filters
                </button>
              } @else {
                <div class="text-amber-600 font-mono text-lg mb-4">📝 NO POSTS YET</div>
                <p class="text-amber-700 mb-6">No posts have been created yet.</p>
                <a
                  routerLink="/write"
                  class="inline-block bg-green-600 text-green-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-green-700 transition-colors"
                >
                  Create First Post
                </a>
              }
            </div>
          </div>
        } @else {
          <!-- Posts List -->
          <div class="overflow-x-auto">
            <!-- Table Header -->
            <div class="bg-amber-200 border-b-2 border-amber-400 p-4">
              <div class="flex items-center gap-4">
                <!-- Select All Checkbox -->
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    [checked]="allSelected()"
                    [indeterminate]="someSelected()"
                    (change)="toggleSelectAll()"
                    class="text-amber-600 border-2 border-amber-400"
                  />
                </label>
                
                <div class="grid grid-cols-12 gap-4 flex-1 font-mono text-sm font-bold text-amber-900">
                  <div class="col-span-4">Title</div>
                  <div class="col-span-2">Author</div>
                  <div class="col-span-1">Status</div>
                  <div class="col-span-2">Published</div>
                  <div class="col-span-1">Views</div>
                  <div class="col-span-1">Likes</div>
                  <div class="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            <!-- Table Body -->
            <div class="divide-y-2 divide-amber-200">
              @for (post of posts(); track post._id) {
                <div class="p-4 hover:bg-amber-100 transition-colors">
                  <div class="flex items-center gap-4">
                    <!-- Selection Checkbox -->
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="selectedPosts().includes(post._id)"
                        (change)="togglePostSelection(post._id)"
                        class="text-amber-600 border-2 border-amber-400"
                      />
                    </label>
                    
                    <div class="grid grid-cols-12 gap-4 flex-1 items-center">
                      <!-- Title & Excerpt -->
                      <div class="col-span-4">
                        <h3 class="font-serif font-bold text-amber-900 leading-tight mb-1">
                          <a [routerLink]="['/post', post.slug]" class="hover:text-amber-700 transition-colors">
                            {{ post.title }}
                          </a>
                        </h3>
                        @if (post.excerpt) {
                          <p class="text-amber-700 text-sm line-clamp-2">{{ post.excerpt }}</p>
                        }
                        
                        <!-- Tags -->
                        @if (getPostTags(post).length > 0) {
                          <div class="flex flex-wrap gap-1 mt-2">
                            @for (tag of getPostTags(post).slice(0, 3); track getTagId(tag)) {
                              <span class="inline-block bg-amber-300 text-amber-800 px-2 py-1 text-xs font-mono">
                                {{ getTagName(tag) }}
                              </span>
                            }
                            @if (getPostTags(post).length > 3) {
                              <span class="text-amber-600 text-xs font-mono">+{{ getPostTags(post).length - 3 }}</span>
                            }
                          </div>
                        }
                      </div>
                      
                      <!-- Author -->
                      <div class="col-span-2">
                        <div class="flex items-center gap-2">
                          @if (getAuthorAvatar(post)) {
                            <img [src]="getAuthorAvatar(post)" [alt]="getAuthorName(post)" class="w-8 h-8 rounded-full border-2 border-amber-400">
                          } @else {
                            <div class="w-8 h-8 bg-amber-200 border-2 border-amber-400 rounded-full flex items-center justify-center font-bold text-amber-800 text-xs">
                              {{ getAuthorInitials(post) }}
                            </div>
                          }
                          <div>
                            <div class="font-bold text-amber-900 text-sm">{{ getAuthorName(post) }}</div>
                            <div class="text-amber-600 text-xs font-mono">{{ formatDate(post.createdAt) }}</div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Status -->
                      <div class="col-span-1">
                        <span [class]="getStatusClass(post.status)" class="px-2 py-1 text-xs font-mono uppercase">
                          {{ post.status }}
                        </span>
                      </div>
                      
                      <!-- Published Date -->
                      <div class="col-span-2">
                        <div class="text-amber-900 text-sm font-mono">
                          {{ post.publishedAt ? formatDate(post.publishedAt) : '-' }}
                        </div>
                        @if (post.publishedAt) {
                          <div class="text-amber-600 text-xs font-mono">
                            {{ getTimeAgo(post.publishedAt) }}
                          </div>
                        }
                      </div>
                      
                      <!-- Views -->
                      <div class="col-span-1">
                        <div class="text-amber-900 font-mono text-sm">{{ formatNumber(post.viewCount) }}</div>
                      </div>
                      
                      <!-- Likes -->
                      <div class="col-span-1">
                        <div class="text-amber-900 font-mono text-sm">{{ formatNumber(post.likeCount) }}</div>
                      </div>
                      
                      <!-- Actions -->
                      <div class="col-span-1">
                        <div class="flex gap-1">
                          <a 
                            [routerLink]="['/write/edit', post._id]"
                            class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            title="Edit"
                          >
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                            </svg>
                          </a>
                          
                          <button
                            (click)="togglePostStatus(post)"
                            [disabled]="statusChanging().includes(post._id)"
                            class="inline-flex items-center justify-center w-8 h-8 hover:bg-amber-200 transition-colors disabled:opacity-50"
                            [class]="post.status === 'published' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
                            [title]="post.status === 'published' ? 'Set to Draft' : 'Publish'"
                          >
                            @if (statusChanging().includes(post._id)) {
                              <div class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                            } @else if (post.status === 'published') {
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                              </svg>
                            } @else {
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path>
                              </svg>
                            }
                          </button>
                          
                          <button
                            (click)="deletePost(post._id)"
                            [disabled]="deleting().includes(post._id)"
                            class="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            @if (deleting().includes(post._id)) {
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
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="p-6 border-t-2 border-amber-300">
              <div class="flex items-center justify-between">
                <div class="text-amber-700 font-mono text-sm">
                  Showing {{ posts().length }} of {{ totalPosts() }} posts
                </div>
                
                <div class="flex items-center gap-2">
                  <button
                    (click)="goToPage(currentPage() - 1)"
                    [disabled]="currentPage() === 1"
                    class="px-4 py-2 bg-amber-100 text-amber-900 font-mono text-sm hover:bg-amber-200 transition-colors border-2 border-amber-300 disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  
                  @for (page of getPaginationPages(); track page) {
                    @if (page === '...') {
                      <span class="px-3 py-2 text-amber-600 font-mono text-sm">...</span>
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
                    class="px-4 py-2 bg-amber-100 text-amber-900 font-mono text-sm hover:bg-amber-200 transition-colors border-2 border-amber-300 disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </section>

      <!-- Posts Statistics -->
      <section class="grid md:grid-cols-4 gap-6">
        <div class="bg-blue-100 border-4 border-blue-300 p-6 text-center">
          <div class="text-3xl font-bold text-blue-900 mb-2">{{ getStatusCount('published') }}</div>
          <div class="text-blue-700 font-mono text-sm">Published</div>
        </div>
        
        <div class="bg-yellow-100 border-4 border-yellow-300 p-6 text-center">
          <div class="text-3xl font-bold text-yellow-900 mb-2">{{ getStatusCount('draft') }}</div>
          <div class="text-yellow-700 font-mono text-sm">Drafts</div>
        </div>
        
        <div class="bg-gray-100 border-4 border-gray-300 p-6 text-center">
          <div class="text-3xl font-bold text-gray-900 mb-2">{{ getStatusCount('archived') }}</div>
          <div class="text-gray-700 font-mono text-sm">Archived</div>
        </div>
        
        <div class="bg-green-100 border-4 border-green-300 p-6 text-center">
          <div class="text-3xl font-bold text-green-900 mb-2">{{ getTotalViews() }}</div>
          <div class="text-green-700 font-mono text-sm">Total Views</div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Custom checkbox styling */
    input[type="checkbox"] {
      appearance: none;
      background-color: white;
      border: 2px solid #d97706;
      width: 1rem;
      height: 1rem;
      position: relative;
      cursor: pointer;
    }

    input[type="checkbox"]:checked {
      background-color: #d97706;
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

    input[type="checkbox"]:indeterminate {
      background-color: #f59e0b;
    }

    input[type="checkbox"]:indeterminate::before {
      content: '−';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
    }

    /* Custom select styling */
    select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d97706' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.75rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
    }

    /* Vintage paper texture */
    .bg-amber-50 {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }
  `]
})
export class AdminPostsComponent implements OnInit {
  private apiService = inject(ApiService);

  // Reactive Signals
  loading = signal(false);
  bulkActionLoading = signal(false);
  posts = signal<Post[]>([]);
  authors = signal<User[]>([]);
  totalPosts = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  
  selectedPosts = signal<string[]>([]);
  statusChanging = signal<string[]>([]);
  deleting = signal<string[]>([]);

  // Form Controls
  searchControl = new FormControl('');
  statusControl = new FormControl('');
  authorControl = new FormControl('');
  sortControl = new FormControl('-createdAt');

  // Filter states
  searchQuery = signal('');
  statusFilter = signal('');
  authorFilter = signal('');

  // Computed values
  hasActiveFilters = computed(() => 
    !!(this.searchQuery() || this.statusFilter() || this.authorFilter())
  );

  allSelected = computed(() => 
    this.posts().length > 0 && 
    this.posts().every(post => this.selectedPosts().includes(post._id))
  );

  someSelected = computed(() => 
    this.selectedPosts().length > 0 && 
    !this.allSelected()
  );

  async ngOnInit() {
    await Promise.all([
      this.loadPosts(),
      this.loadAuthors()
    ]);
    this.setupFormSubscriptions();
  }

  private async loadPosts() {
    try {
      this.loading.set(true);
      
      const params: PostQueryParams = {
          page: this.currentPage(),
          limit: 20,
          sort: this.sortControl.value || '-createdAt',
          dateTo: '',
          dateFrom: ''
      };

      if (this.searchQuery()) params.search = this.searchQuery();
      if (this.statusFilter()) params.status = this.statusFilter() as any;
      if (this.authorFilter()) params.author = this.authorFilter();

      const response = await this.apiService.getPosts(params);
      
      this.posts.set(response.posts || response.data || []);
      this.totalPosts.set(response.totalPosts || response.totalItems || 0);
      this.totalPages.set(response.totalPages || 1);
      
    } catch (error) {
      console.error('Failed to load posts:', error);
      this.posts.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadAuthors() {
    try {
      const response = await this.apiService.getUsers({ limit: 100 });
      this.authors.set(response.data || []);
    } catch (error) {
      console.error('Failed to load authors:', error);
    }
  }

  private setupFormSubscriptions() {
    // Search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchQuery.set(value || '');
      this.currentPage.set(1);
      this.loadPosts();
    });

    // Status filter
    this.statusControl.valueChanges.subscribe(value => {
      this.statusFilter.set(value || '');
      this.currentPage.set(1);
      this.loadPosts();
    });

    // Author filter
    this.authorControl.valueChanges.subscribe(value => {
      this.authorFilter.set(value || '');
      this.currentPage.set(1);
      this.loadPosts();
    });

    // Sort changes
    this.sortControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.loadPosts();
    });
  }

  // Selection Management
  togglePostSelection(postId: string) {
    this.selectedPosts.update(selected => {
      if (selected.includes(postId)) {
        return selected.filter(id => id !== postId);
      } else {
        return [...selected, postId];
      }
    });
  }

  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedPosts.set([]);
    } else {
      const allIds = this.posts().map(post => post._id);
      this.selectedPosts.set(allIds);
    }
  }

  // Post Actions
  async togglePostStatus(post: Post) {
    try {
      this.statusChanging.update(changing => [...changing, post._id]);
      
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await this.apiService.updatePost(post._id, { status: newStatus });
      
      // Update local state
      this.posts.update(posts => 
        posts.map(p => p._id === post._id ? { ...p, status: newStatus } : p)
      );
      
    } catch (error) {
      console.error('Failed to update post status:', error);
    } finally {
      this.statusChanging.update(changing => changing.filter(id => id !== post._id));
    }
  }

  async deletePost(postId: string) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      this.deleting.update(deleting => [...deleting, postId]);
      
      await this.apiService.deletePost(postId);
      
      // Remove from posts list
      this.posts.update(posts => posts.filter(p => p._id !== postId));
      this.selectedPosts.update(selected => selected.filter(id => id !== postId));
      this.totalPosts.update(count => count - 1);
      
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      this.deleting.update(deleting => deleting.filter(id => id !== postId));
    }
  }

  // Bulk Actions
  async bulkPublish() {
    if (!confirm(`Publish ${this.selectedPosts().length} selected posts?`)) return;

    try {
      this.bulkActionLoading.set(true);
      
      const updatePromises = this.selectedPosts().map(id => 
        this.apiService.updatePost(id, { status: 'published' })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      this.posts.update(posts => 
        posts.map(p => 
          this.selectedPosts().includes(p._id) 
            ? { ...p, status: 'published' as const } 
            : p
        )
      );
      
      this.selectedPosts.set([]);
      
    } catch (error) {
      console.error('Failed to bulk publish:', error);
    } finally {
      this.bulkActionLoading.set(false);
    }
  }

  async bulkArchive() {
    if (!confirm(`Set ${this.selectedPosts().length} selected posts to draft?`)) return;

    try {
      this.bulkActionLoading.set(true);
      
      const updatePromises = this.selectedPosts().map(id => 
        this.apiService.updatePost(id, { status: 'draft' })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      this.posts.update(posts => 
        posts.map(p => 
          this.selectedPosts().includes(p._id) 
            ? { ...p, status: 'draft' as const } 
            : p
        )
      );
      
      this.selectedPosts.set([]);
      
    } catch (error) {
      console.error('Failed to bulk update to draft:', error);
    } finally {
      this.bulkActionLoading.set(false);
    }
  }

  async bulkDelete() {
    const count = this.selectedPosts().length;
    if (!confirm(`Delete ${count} selected posts? This action cannot be undone.`)) return;

    try {
      this.bulkActionLoading.set(true);
      
      const deletePromises = this.selectedPosts().map(id => 
        this.apiService.deletePost(id)
      );
      
      await Promise.all(deletePromises);
      
      // Remove from posts list
      const deletedIds = this.selectedPosts();
      this.posts.update(posts => posts.filter(p => !deletedIds.includes(p._id)));
      this.totalPosts.update(count => count - deletedIds.length);
      this.selectedPosts.set([]);
      
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    } finally {
      this.bulkActionLoading.set(false);
    }
  }

  // Filter Management
  clearSearch() {
    this.searchControl.setValue('');
  }

  clearStatusFilter() {
    this.statusControl.setValue('');
  }

  clearAuthorFilter() {
    this.authorControl.setValue('');
  }

  clearAllFilters() {
    this.searchControl.setValue('');
    this.statusControl.setValue('');
    this.authorControl.setValue('');
    this.sortControl.setValue('-createdAt');
  }

  // Pagination
  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    
    this.currentPage.set(page);
    await this.loadPosts();
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
      ? `${baseClass} bg-amber-800 text-amber-100 border-amber-700`
      : `${baseClass} bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:border-amber-400`;
  }

  // Helper Methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  }

  getAuthorName(post: Post): string {
    const author = post.author;
    return typeof author === 'object' ? author.name : 'Unknown Author';
  }

  getAuthorAvatar(post: Post): string | null {
    const author = post.author;
    return typeof author === 'object' ? author.avatarUrl || null : null;
  }

  getAuthorInitials(post: Post): string {
    const name = this.getAuthorName(post);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getPostTags(post: Post): any[] {
    return Array.isArray(post.tags) ? post.tags : [];
  }

  getTagId(tag: any): string {
    return typeof tag === 'object' ? tag._id : tag;
  }

  getTagName(tag: any): string {
    return typeof tag === 'object' ? tag.name : tag;
  }

  getAuthorNameById(authorId: string): string {
    const author = this.authors().find(a => a._id === authorId);
    return author ? author.name : 'Unknown';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Statistics
  getStatusCount(status: string): number {
    return this.posts().filter(post => post.status === status).length;
  }

  getTotalViews(): string {
    const total = this.posts().reduce((sum, post) => sum + (post.viewCount || 0), 0);
    return this.formatNumber(total);
  }
}
