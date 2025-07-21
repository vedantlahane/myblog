import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Post, Tag, PostQueryParams, PostsResponse } from '../../../types/api';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      <!-- Archive Header -->
      <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
        <div class="text-center border-2 border-dotted border-amber-700 p-6">
          <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
            Archive
          </div>
          
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-3">
            Article Collection
          </h1>
          <p class="text-amber-700 text-lg font-mono">
            Browse {{ totalPosts() }} articles from the vault
          </p>
          
          <!-- Stats Bar -->
          <div class="flex items-center justify-center gap-8 mt-6 text-sm font-mono text-amber-600">
            <span>{{ totalPosts() }} Articles</span>
            <span>•</span>
            <span>{{ availableTags().length }} Topics</span>
            <span>•</span>
            <span>Est. {{ Math.ceil(totalPosts() * 4.5) }} min reading</span>
          </div>
        </div>
      </header>

      <!-- Search & Filters -->
      <section class="mb-12">
        <div class="bg-amber-50 border-4 border-amber-300 p-6">
          <!-- Search Bar -->
          <div class="mb-6">
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Search Articles
            </label>
            <div class="relative">
              <input
                [formControl]="searchControl"
                type="text"
                placeholder="Search by title, content, or author..."
                class="w-full px-4 py-3 pl-12 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              />
              <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              
              @if (searchQuery()) {
                <button
                  (click)="clearSearch()"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </button>
              }
            </div>
            
            @if (searchQuery()) {
              <p class="text-amber-600 text-xs font-mono mt-2">
                Showing results for "{{ searchQuery() }}"
              </p>
            }
          </div>

          <!-- Filter Controls -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Sort Options -->
            <div>
              <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                Sort By
              </label>
              <select
                [formControl]="sortControl"
                class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              >
                <option value="-publishedAt">Latest First</option>
                <option value="publishedAt">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="-title">Title (Z-A)</option>
                <option value="-likeCount">Most Liked</option>
                <option value="-viewCount">Most Viewed</option>
                <option value="-commentCount">Most Discussed</option>
              </select>
            </div>

            <!-- Tag Filter -->
            <div>
              <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                Filter by Topic
              </label>
              <select
                [formControl]="tagControl"
                class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              >
                <option value="">All Topics</option>
                @for (tag of availableTags(); track tag._id) {
                  <option [value]="tag.slug">{{ tag.name }} ({{ tag.postCount }})</option>
                }
              </select>
            </div>

            <!-- Year Filter -->
            <div>
              <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                Filter by Year
              </label>
              <select
                [formControl]="yearControl"
                class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              >
                <option value="">All Years</option>
                @for (year of availableYears(); track year) {
                  <option [value]="year">{{ year }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Active Filters Display -->
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
                
                @if (selectedTag()) {
                  <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                    Topic: {{ getTagName(selectedTag()!) }}
                    <button (click)="clearTagFilter()" class="hover:text-amber-900">×</button>
                  </span>
                }
                
                @if (selectedYear()) {
                  <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                    Year: {{ selectedYear() }}
                    <button (click)="clearYearFilter()" class="hover:text-amber-900">×</button>
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
        </div>
      </section>

      <!-- Posts Grid -->
      <section class="mb-12">
        @if (loading()) {
          <!-- Loading Skeleton -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (i of [1,2,3,4,5,6,7,8,9]; track i) {
              <div class="bg-amber-50 border-2 border-amber-200 p-6 animate-pulse">
                <div class="h-6 bg-amber-200 rounded mb-4"></div>
                <div class="h-4 bg-amber-200 rounded mb-2"></div>
                <div class="h-4 bg-amber-200 rounded mb-2"></div>
                <div class="h-4 bg-amber-200 rounded w-2/3"></div>
                <div class="flex gap-2 mt-4">
                  <div class="h-6 w-12 bg-amber-200 rounded"></div>
                  <div class="h-6 w-16 bg-amber-200 rounded"></div>
                </div>
              </div>
            }
          </div>
        } @else if (posts().length === 0) {
          <!-- Empty State -->
          <div class="text-center py-16">
            <div class="inline-block border-4 border-amber-300 p-12 bg-amber-100">
              <div class="text-amber-600 font-mono text-lg mb-4">📚 NO ARTICLES FOUND</div>
              @if (hasActiveFilters()) {
                <p class="text-amber-700 mb-6">
                  No articles match your current filters.
                </p>
                <button
                  (click)="clearAllFilters()"
                  class="bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors"
                >
                  Clear Filters
                </button>
              } @else {
                <p class="text-amber-700">
                  The archive is empty. Check back soon for new content!
                </p>
              }
            </div>
          </div>
        } @else {
          <!-- Results Header -->
          <div class="flex items-center justify-between mb-8">
            <div class="text-amber-700 font-mono text-sm">
              Showing {{ posts().length }} of {{ totalPosts() }} articles
              @if (hasActiveFilters()) {
                <span class="text-amber-600">(filtered)</span>
              }
            </div>
            
            <div class="text-amber-600 font-mono text-xs">
              Page {{ currentPage() }} of {{ totalPages() }}
            </div>
          </div>

          <!-- Articles Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (post of posts(); track post._id) {
              <article class="bg-amber-50 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 group">
                @if (post.coverImage) {
                  <img 
                    [src]="post.coverImage" 
                    [alt]="post.title"
                    class="w-full h-48 object-cover border-b-2 border-amber-200 group-hover:sepia-[20%] transition-all"
                  >
                }
                
                <div class="p-6">
                  <!-- Post Status Badge -->
                  @if (post.status === 'draft') {
                    <div class="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 text-xs font-mono uppercase mb-3">
                      Draft
                    </div>
                  }
                  
                  <h3 class="font-serif text-xl font-bold text-amber-900 mb-3 leading-tight">
                    <a 
                      [routerLink]="['/post', post.slug]"
                      class="hover:text-amber-700 transition-colors"
                    >
                      {{ post.title }}
                    </a>
                  </h3>
                  
                  @if (post.excerpt) {
                    <p class="text-amber-700 text-sm mb-4 leading-relaxed line-clamp-3">
                      {{ post.excerpt }}
                    </p>
                  }
                  
                  <!-- Tags -->
                  @if (getPostTags(post.tags).length > 0) {
                    <div class="flex flex-wrap gap-2 mb-4">
                      @for (tag of getPostTags(post.tags).slice(0, 3); track getTagId(tag)) {
                        <a 
                          [routerLink]="['/tag', getTagSlug(tag)]"
                          class="inline-block bg-amber-200 text-amber-800 px-2 py-1 text-xs font-mono uppercase tracking-wide hover:bg-amber-300 transition-colors"
                        >
                          {{ getTagName(tag) }}
                        </a>
                      }
                    </div>
                  }
                  
                  <!-- Meta Info -->
                  <div class="flex items-center justify-between text-xs font-mono text-amber-600 mb-4">
                    <div class="flex items-center gap-2">
                      <span>{{ getAuthorName(post.author) }}</span>
                      <span>•</span>
                      <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
                    </div>
                    
                    <span>{{ post.readingTime || calculateReadingTime(post.content) }} min</span>
                  </div>
                  
                  <!-- Engagement Stats -->
                  <div class="flex items-center justify-between text-xs font-mono text-amber-600">
                    <div class="flex items-center gap-3">
                      <div class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                        </svg>
                        <span>{{ post.likeCount || 0 }}</span>
                      </div>
                      
                      <div class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                        </svg>
                        <span>{{ post.commentCount || 0 }}</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                      </svg>
                      <span>{{ post.viewCount || 0 }}</span>
                    </div>
                  </div>
                </div>
              </article>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="mt-12 flex justify-center">
              <div class="flex items-center gap-2">
                <!-- Previous Button -->
                <button
                  (click)="goToPage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="px-4 py-2 bg-amber-100 text-amber-900 font-mono text-sm hover:bg-amber-200 transition-colors border-2 border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                
                <!-- Page Numbers -->
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
                
                <!-- Next Button -->
                <button
                  (click)="goToPage(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="px-4 py-2 bg-amber-100 text-amber-900 font-mono text-sm hover:bg-amber-200 transition-colors border-2 border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          }
        }
      </section>

      <!-- Archive Footer -->
      <section class="bg-amber-100 border-4 border-amber-800 p-6 text-center">
        <div class="border-2 border-dotted border-amber-700 p-4">
          <h3 class="font-serif text-xl font-bold text-amber-900 mb-2">Explore More</h3>
          <p class="text-amber-700 text-sm mb-4">
            Can't find what you're looking for? Try browsing by topics or use the search function.
          </p>
          <div class="flex justify-center gap-4">
            <a routerLink="/" class="text-amber-600 hover:text-amber-800 font-mono text-sm underline">
              Back to Latest
            </a>
            <span class="text-amber-400">•</span>
            <a routerLink="/about" class="text-amber-600 hover:text-amber-800 font-mono text-sm underline">
              About MyBlog
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Vintage paper texture */
    article {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Custom select styling */
    select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d97706' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.75rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
    }

    /* Search input focus animation */
    input:focus + svg {
      color: #d97706;
    }
  `]
})
export class ArchiveComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Reactive Signals
  loading = signal(false);
  posts = signal<Post[]>([]);
  availableTags = signal<Tag[]>([]);
  totalPosts = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  
  // Form Controls
  searchControl = new FormControl('');
  sortControl = new FormControl('-publishedAt');
  tagControl = new FormControl('');
  yearControl = new FormControl('');

  // Computed values
  searchQuery = signal('');
  selectedTag = signal<Tag | null>(null);
  selectedYear = signal<string>('');

  availableYears = computed(() => {
    const years = new Set<number>();
    this.posts().forEach(post => {
      const date = new Date(post.publishedAt || post.createdAt);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  });

  hasActiveFilters = computed(() => 
    !!(this.searchQuery() || this.selectedTag() || this.selectedYear())
  );
Math: any;

  async ngOnInit() {
    await this.loadInitialData();
    this.setupFormSubscriptions();
    this.handleRouteParams();
  }

  private async loadInitialData() {
    try {
      this.loading.set(true);
      const [postsResponse, tagsResponse] = await Promise.all([
        this.apiService.getPosts({
            status: 'published',
            limit: 12,
            page: 1,
            sort: '-publishedAt',
            dateFrom: '',
            dateTo: ''
        }),
        this.apiService.getTags()
      ]);

      this.posts.set(postsResponse.posts || postsResponse.data || []);
      this.totalPosts.set(postsResponse.totalPosts || postsResponse.totalItems || 0);
      this.totalPages.set(postsResponse.totalPages || 1);
      this.availableTags.set(tagsResponse);

    } catch (error) {
      console.error('Failed to load archive data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private setupFormSubscriptions() {
    // Search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchQuery.set(value || '');
      this.searchPosts();
    });

    // Sort changes
    this.sortControl.valueChanges.subscribe(() => {
      this.searchPosts();
    });

    // Tag filter changes
    this.tagControl.valueChanges.subscribe(tagSlug => {
      const tag = this.availableTags().find(t => t.slug === tagSlug) || null;
      this.selectedTag.set(tag);
      this.searchPosts();
    });

    // Year filter changes
    this.yearControl.valueChanges.subscribe(year => {
      this.selectedYear.set(year || '');
      this.searchPosts();
    });
  }

  private handleRouteParams() {
    // Handle query parameters from URL
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchControl.setValue(params['search'], { emitEvent: false });
        this.searchQuery.set(params['search']);
      }
      if (params['tag']) {
        this.tagControl.setValue(params['tag'], { emitEvent: false });
        const tag = this.availableTags().find(t => t.slug === params['tag']);
        this.selectedTag.set(tag || null);
      }
      if (params['year']) {
        this.yearControl.setValue(params['year'], { emitEvent: false });
        this.selectedYear.set(params['year']);
      }
      if (params['sort']) {
        this.sortControl.setValue(params['sort'], { emitEvent: false });
      }
    });
  }

  private async searchPosts() {
    try {
      this.loading.set(true);
      
      const params: PostQueryParams = {
          status: 'published',
          limit: 12,
          page: 1,
          sort: this.sortControl.value || '-publishedAt',
          dateFrom: '',
          dateTo: ''
      };

      if (this.searchQuery()) {
        params.search = this.searchQuery();
      }

      if (this.selectedTag()) {
        params.tags = [this.selectedTag()!.slug];
      }

      if (this.selectedYear()) {
        // Add date range for the selected year
        const year = parseInt(this.selectedYear());
        params.dateFrom = `${year}-01-01`;
        params.dateTo = `${year}-12-31`;
      }

      const response = await this.apiService.getPosts(params);
      
      this.posts.set(response.posts || response.data || []);
      this.totalPosts.set(response.totalPosts || response.totalItems || 0);
      this.totalPages.set(response.totalPages || 1);
      this.currentPage.set(1);

      // Update URL without navigation
      this.updateUrlParams();

    } catch (error) {
      console.error('Failed to search posts:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private updateUrlParams() {
    const queryParams: any = {};
    
    if (this.searchQuery()) queryParams.search = this.searchQuery();
    if (this.selectedTag()) queryParams.tag = this.selectedTag()!.slug;
    if (this.selectedYear()) queryParams.year = this.selectedYear();
    if (this.sortControl.value !== '-publishedAt') queryParams.sort = this.sortControl.value;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;

    try {
      this.loading.set(true);
      
      const params: PostQueryParams = {
          status: 'published',
          limit: 12,
          page,
          sort: this.sortControl.value || '-publishedAt',
          dateFrom: '',
          dateTo: ''
      };

      if (this.searchQuery()) params.search = this.searchQuery();
      if (this.selectedTag()) params.tags = [this.selectedTag()!.slug];
      if (this.selectedYear()) {
        const year = parseInt(this.selectedYear());
        params.dateFrom = `${year}-01-01`;
        params.dateTo = `${year}-12-31`;
      }

      const response = await this.apiService.getPosts(params);
      
      this.posts.set(response.posts || response.data || []);
      this.currentPage.set(page);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      this.loading.set(false);
    }
  }

  // Filter Management
  clearSearch() {
    this.searchControl.setValue('');
  }

  clearTagFilter() {
    this.tagControl.setValue('');
  }

  clearYearFilter() {
    this.yearControl.setValue('');
  }

  clearAllFilters() {
    this.searchControl.setValue('');
    this.tagControl.setValue('');
    this.yearControl.setValue('');
    this.sortControl.setValue('-publishedAt');
  }

  // Pagination Helpers
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

  // Helper methods
  getAuthorName(author: string | any): string {
    return typeof author === 'object' ? author?.name || 'Anonymous' : 'Anonymous';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getPostTags(tags: string[] | any[]): any[] {
    return Array.isArray(tags) ? tags : [];
  }

  getTagId(tag: any): string {
    return typeof tag === 'object' ? tag._id : tag;
  }

  getTagName(tag: any): string {
    return typeof tag === 'object' ? tag.name : tag;
  }

  getTagSlug(tag: any): string {
    if (typeof tag === 'object') return tag.slug;
    return tag.toLowerCase().replace(/\s+/g, '-');
  }

  calculateReadingTime(content: string): number {
    if (!content) return 1;
    const words = content.split(' ').length;
    return Math.ceil(words / 200);
  }
}
