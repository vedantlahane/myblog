import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Post, Tag, PostQueryParams } from '../../../types/api';

@Component({
  selector: 'app-tag-posts',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      @if (loading()) {
        <div class="flex justify-center items-center py-16">
          <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-sm">
            <div class="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
            Loading tag information...
          </div>
        </div>
      } @else if (error()) {
        <div class="text-center py-16">
          <div class="inline-block border-4 border-red-300 p-8 bg-red-50">
            <div class="text-red-600 font-mono text-sm mb-2">TAG NOT FOUND</div>
            <p class="text-red-700 mb-4">{{ error() }}</p>
            <a routerLink="/archive" class="inline-block bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors">
              Browse All Articles
            </a>
          </div>
        </div>
      } @else if (tag()) {
        <!-- Tag Header -->
        <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
          <div class="text-center border-2 border-dotted border-amber-700 p-8">
            <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
              Topic Collection
            </div>
            
            <!-- Tag Badge -->
            <div class="mb-6">
              <span 
                class="inline-block px-8 py-3 text-2xl font-mono font-bold border-4 border-amber-600 shadow-lg transform hover:scale-105 transition-transform"
                [style.background-color]="tag()?.color || '#fbbf24'"
                [style.color]="getContrastColor(tag()?.color || '#fbbf24')"
              >
                #{{ tag()?.name }}
              </span>
            </div>
            
            <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              Articles about {{ tag()?.name }}
            </h1>
            
            @if (tag()?.description) {
              <p class="text-amber-800 text-lg leading-relaxed max-w-3xl mx-auto mb-6 italic">
                "{{ tag()?.description }}"
              </p>
            }
            
            <!-- Tag Stats -->
            <div class="flex items-center justify-center gap-8 text-sm font-mono text-amber-600">
              <span>{{ tag()?.postCount || totalPosts() }} Articles</span>
              <span>•</span>
              <span>{{ Math.ceil((totalPosts() * 4.5)) }} min total reading</span>
              <span>•</span>
              <span>Created {{ formatDate(tag()?.createdAt || '') }}</span>
            </div>
          </div>
        </header>

        <!-- Controls & Filters -->
        <section class="mb-8">
          <div class="bg-amber-50 border-4 border-amber-300 p-6">
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Search within tag -->
              <div>
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                  Search in {{ tag()?.name }}
                </label>
                <div class="relative">
                  <input
                    [formControl]="searchControl"
                    type="text"
                    placeholder="Search articles in this topic..."
                    class="w-full px-4 py-3 pl-10 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
                  />
                  <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>

              <!-- Sort Options -->
              <div>
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                  Sort Articles
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
            </div>

            <!-- Active Search -->
            @if (searchQuery()) {
              <div class="mt-6 pt-4 border-t-2 border-dotted border-amber-300">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-amber-700 font-mono text-sm font-bold">Searching for:</span>
                  <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                    "{{ searchQuery() }}"
                    <button (click)="clearSearch()" class="hover:text-amber-900">×</button>
                  </span>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Posts List -->
        <section class="mb-12">
          @if (postsLoading()) {
            <!-- Loading Posts -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="bg-amber-50 border-2 border-amber-200 p-6 animate-pulse">
                  <div class="h-6 bg-amber-200 rounded mb-4"></div>
                  <div class="h-4 bg-amber-200 rounded mb-2"></div>
                  <div class="h-4 bg-amber-200 rounded mb-2"></div>
                  <div class="h-4 bg-amber-200 rounded w-2/3"></div>
                </div>
              }
            </div>
          } @else if (posts().length === 0) {
            <!-- Empty State -->
            <div class="text-center py-16">
              <div class="inline-block border-4 border-amber-300 p-12 bg-amber-100">
                @if (searchQuery()) {
                  <div class="text-amber-600 font-mono text-lg mb-4">🔍 NO MATCHING ARTICLES</div>
                  <p class="text-amber-700 mb-6">
                    No articles in <strong>{{ tag()?.name }}</strong> match your search for "{{ searchQuery() }}".
                  </p>
                  <button
                    (click)="clearSearch()"
                    class="bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors"
                  >
                    Clear Search
                  </button>
                } @else {
                  <div class="text-amber-600 font-mono text-lg mb-4">📝 NO ARTICLES YET</div>
                  <p class="text-amber-700 mb-6">
                    No articles have been tagged with <strong>{{ tag()?.name }}</strong> yet.
                  </p>
                  <div class="flex justify-center gap-4">
                    <a
                      routerLink="/write"
                      class="inline-block bg-amber-800 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors"
                    >
                      Write First Article
                    </a>
                    <a
                      routerLink="/archive"
                      class="inline-block bg-amber-200 text-amber-900 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors"
                    >
                      Browse All Topics
                    </a>
                  </div>
                }
              </div>
            </div>
          } @else {
            <!-- Results Header -->
            <div class="flex items-center justify-between mb-8">
              <div class="text-amber-700 font-mono text-sm">
                {{ posts().length }} article{{ posts().length === 1 ? '' : 's' }} 
                @if (searchQuery()) {
                  matching "{{ searchQuery() }}"
                }
                in {{ tag()?.name }}
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
                    <!-- Post Status -->
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
                    
                    <!-- Other Tags (excluding current tag) -->
                    @if (getOtherTags(post.tags).length > 0) {
                      <div class="flex flex-wrap gap-2 mb-4">
                        @for (otherTag of getOtherTags(post.tags).slice(0, 2); track getTagId(otherTag)) {
                          <a 
                            [routerLink]="['/tag', getTagSlug(otherTag)]"
                            class="inline-block bg-amber-200 text-amber-800 px-2 py-1 text-xs font-mono uppercase tracking-wide hover:bg-amber-300 transition-colors"
                          >
                            {{ getTagName(otherTag) }}
                          </a>
                        }
                        @if (getOtherTags(post.tags).length > 2) {
                          <span class="text-amber-600 text-xs font-mono">
                            +{{ getOtherTags(post.tags).length - 2 }}
                          </span>
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
            }
          }
        </section>

        <!-- Related Tags -->
        @if (relatedTags().length > 0) {
          <section class="mb-12">
            <div class="bg-amber-100 border-4 border-amber-800 p-6">
              <h3 class="font-serif text-xl font-bold text-amber-900 mb-4 text-center">Related Topics</h3>
              
              <div class="flex flex-wrap gap-3 justify-center">
                @for (relatedTag of relatedTags(); track relatedTag._id) {
                  <a 
                    [routerLink]="['/tag', relatedTag.slug]"
                    class="inline-block px-4 py-2 bg-amber-200 text-amber-800 font-mono text-sm hover:bg-amber-300 transition-colors border border-amber-400 hover:border-amber-500"
                    [style.background-color]="relatedTag.color ? relatedTag.color + '40' : undefined"
                  >
                    #{{ relatedTag.name }} ({{ relatedTag.postCount }})
                  </a>
                }
              </div>
            </div>
          </section>
        }

        <!-- Navigation Footer -->
        <section class="bg-amber-50 border-4 border-amber-300 p-6 text-center">
          <div class="border-2 border-dotted border-amber-400 p-4">
            <h3 class="font-serif text-lg font-bold text-amber-900 mb-3">Explore More</h3>
            <div class="flex justify-center gap-6 text-sm">
              <a routerLink="/archive" class="text-amber-600 hover:text-amber-800 font-mono underline">
                All Articles
              </a>
              <span class="text-amber-400">•</span>
              <a routerLink="/" class="text-amber-600 hover:text-amber-800 font-mono underline">
                Latest Posts
              </a>
              <span class="text-amber-400">•</span>
              @if (isAuthenticated()) {
                <a routerLink="/write" class="text-amber-600 hover:text-amber-800 font-mono underline">
                  Write Article
                </a>
              } @else {
                <a routerLink="/auth" class="text-amber-600 hover:text-amber-800 font-mono underline">
                  Join Community
                </a>
              }
            </div>
          </div>
        </section>
      }
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

    /* Tag badge hover effect */
    .transform.hover\\:scale-105:hover {
      transform: scale(1.05) rotate(-1deg);
      transition: transform 0.3s ease-in-out;
    }
  `]
})
export class TagPostsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Reactive Signals
  loading = signal(false);
  postsLoading = signal(false);
  error = signal('');
  tag = signal<Tag | null>(null);
  posts = signal<Post[]>([]);
  relatedTags = signal<Tag[]>([]);
  totalPosts = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);

  // Form Controls
  searchControl = new FormControl('');
  sortControl = new FormControl('-publishedAt');

  // Search state
  searchQuery = signal('');
  
  // Math utility
  Math = Math;

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      await this.loadTagAndPosts(slug);
      this.setupFormSubscriptions();
    }
  }

  private async loadTagAndPosts(slug: string) {
    try {
      this.loading.set(true);
      this.error.set('');

      // Load tag information
      const tag = await this.apiService.getTagBySlug(slug);
      this.tag.set(tag);

      // Load posts for this tag
      await this.loadPosts();

      // Load related tags
      await this.loadRelatedTags();

    } catch (error) {
      console.error('Failed to load tag:', error);
      this.error.set('Tag not found or failed to load');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPosts() {
    if (!this.tag()) return;

    try {
      this.postsLoading.set(true);

      const params: PostQueryParams = {
        status: 'published',
        tags: [this.tag()!.slug],
        limit: 12,
        page: this.currentPage(),
        sort: this.sortControl.value || '-publishedAt',
        dateTo: '',
        dateFrom: ''
      };

      if (this.searchQuery()) {
        params.search = this.searchQuery();
      }

      const response = await this.apiService.getPosts(params);
      
      this.posts.set(response.posts || response.data || []);
      this.totalPosts.set(response.totalPosts || response.totalItems || 0);
      this.totalPages.set(response.totalPages || 1);

    } catch (error) {
      console.error('Failed to load posts:', error);
      this.posts.set([]);
    } finally {
      this.postsLoading.set(false);
    }
  }

  private async loadRelatedTags() {
    try {
      // Get all tags and filter out current tag
      const allTags = await this.apiService.getPopularTags();
      const related = allTags
        .filter(t => t._id !== this.tag()?._id)
        .slice(0, 10);
      
      this.relatedTags.set(related);
    } catch (error) {
      console.error('Failed to load related tags:', error);
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

    // Sort changes
    this.sortControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.loadPosts();
    });
  }

  // Navigation
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

  // Search Management
  clearSearch() {
    this.searchControl.setValue('');
  }

  // Helper Methods
  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getAuthorName(author: string | any): string {
    return typeof author === 'object' ? author?.name || 'Anonymous' : 'Anonymous';
  }

  calculateReadingTime(content: string): number {
    if (!content) return 1;
    const words = content.split(' ').length;
    return Math.ceil(words / 200);
  }

  // Tag Management
  getOtherTags(tags: string[] | any[]): any[] {
    if (!Array.isArray(tags)) return [];
    
    const currentTagName = this.tag()?.name?.toLowerCase();
    return tags.filter(tag => {
      const tagName = typeof tag === 'string' ? tag : tag.name;
      return tagName.toLowerCase() !== currentTagName;
    });
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

  // Color Utilities
  getContrastColor(hexColor: string): string {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
}
