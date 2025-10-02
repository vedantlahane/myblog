import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Post, User, Tag, SearchResult } from '../../../types/api';

interface SearchResults {
  posts: Post[];
  users: User[];
  tags: Tag[];
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen">
      <!-- Search Header -->
      <header class="mb-12 rounded-2xl border border-ui-border bg-ui-surface p-8 shadow-sm">
        <div class="text-center">
          <div class="mb-4 inline-flex items-center rounded-full bg-brand-blue/10 px-4 py-1 text-xs font-mono uppercase tracking-[0.35em] text-brand-blue">
            Search Results
          </div>
          
          <h1 class="mb-4 text-3xl font-semibold text-text-primary md:text-4xl">
            @if (searchQuery()) {
              Results for "{{ searchQuery() }}"
            } @else {
              Search MyBlog
            }
          </h1>
          
          @if (searchQuery() && !loading()) {
            <p class="mb-6 font-mono text-lg text-text-secondary">
              Found {{ totalResults() }} result{{ totalResults() === 1 ? '' : 's' }} 
              @if (searchTime()) {
                in {{ searchTime() }}ms
              }
            </p>
          }
          
          <!-- Search Bar -->
          <div class="mx-auto max-w-2xl">
            <div class="relative">
              <input
                [formControl]="searchControl"
                type="text"
                placeholder="Search articles, authors, or topics..."
                class="w-full rounded-xl border-2 border-ui-border bg-white px-6 py-4 pl-12 font-mono text-lg text-text-primary placeholder-text-secondary/50 transition-colors focus:border-brand-blue focus:outline-none"
              />
              <svg class="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              
              @if (searchQuery()) {
                <button
                  (click)="clearSearch()"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </button>
              }
            </div>
          </div>
        </div>
      </header>

      @if (loading()) {
        <!-- Loading State -->
        <div class="flex items-center justify-center py-16">
          <div class="inline-flex items-center gap-3 font-mono text-lg text-brand-blue">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-brand-blue border-t-transparent"></div>
            Searching...
          </div>
        </div>
      } @else if (!searchQuery()) {
        <!-- Empty State - No Search -->
        <section class="mb-12">
          <div class="py-16 text-center">
            <div class="inline-block rounded-2xl border border-ui-border bg-ui-surface p-12">
              <div class="mb-6 text-6xl">🔍</div>
              <h2 class="mb-4 text-2xl font-semibold text-text-primary">Discover MyBlog</h2>
              <p class="mx-auto mb-8 max-w-lg text-text-secondary">
                Search through our collection of articles, discover new authors, and explore topics that interest you.
              </p>
              
              <!-- Popular Searches -->
              @if (popularTags().length > 0) {
                <div class="mb-8">
                  <h3 class="mb-4 text-sm font-mono font-bold text-text-primary">Popular Topics</h3>
                  <div class="flex flex-wrap justify-center gap-3">
                    @for (tag of popularTags().slice(0, 8); track tag._id) {
                      <button
                        (click)="searchForTag(tag.name)"
                        class="btn-pill font-mono uppercase tracking-wide"
                      >
                        {{ tag.name }} ({{ tag.postCount }})
                      </button>
                    }
                  </div>
                </div>
              }
              
              <div class="flex flex-wrap justify-center gap-4">
                <a
                  routerLink="/archive"
                  class="btn-primary"
                >
                  Browse All Articles
                </a>
                <a
                  routerLink="/write"
                  class="btn-secondary"
                >
                  Write Article
                </a>
              </div>
            </div>
          </div>
        </section>
      } @else if (totalResults() === 0) {
        <!-- Empty State - No Results -->
        <section class="mb-12">
          <div class="py-16 text-center">
            <div class="inline-block rounded-2xl border border-ui-border bg-ui-surface p-12">
              <div class="mb-6 text-6xl">🔍</div>
              <h2 class="mb-4 text-2xl font-semibold text-text-primary">No Results Found</h2>
              <p class="mx-auto mb-8 max-w-lg text-text-secondary">
                We couldn't find anything matching <strong>"{{ searchQuery() }}"</strong>. 
                Try different keywords or browse our popular topics below.
              </p>
              
              @if (popularTags().length > 0) {
                <div class="mb-8">
                  <h3 class="mb-4 text-sm font-mono font-bold text-text-primary">Try These Topics</h3>
                  <div class="flex flex-wrap justify-center gap-3">
                    @for (tag of popularTags().slice(0, 6); track tag._id) {
                      <button
                        (click)="searchForTag(tag.name)"
                        class="btn-pill font-mono uppercase tracking-wide"
                      >
                        {{ tag.name }}
                      </button>
                    }
                  </div>
                </div>
              }
              
              <button
                (click)="clearSearch()"
                class="btn-primary"
              >
                New Search
              </button>
            </div>
          </div>
        </section>
      } @else {
        <!-- Search Results -->
        <div class="space-y-12">
          
          <!-- Results Filter Tabs -->
          <section class="rounded-xl border border-ui-border bg-ui-surface p-6 shadow-sm">
            <div class="flex flex-wrap items-center justify-center gap-4">
              <button
                (click)="setActiveTab('all')"
                [class]="getTabClass('all')"
              >
                All Results ({{ totalResults() }})
              </button>
              
              @if (searchResults().posts.length > 0) {
                <button
                  (click)="setActiveTab('posts')"
                  [class]="getTabClass('posts')"
                >
                  Articles ({{ searchResults().posts.length }})
                </button>
              }
              
              @if (searchResults().users.length > 0) {
                <button
                  (click)="setActiveTab('users')"
                  [class]="getTabClass('users')"
                >
                  Authors ({{ searchResults().users.length }})
                </button>
              }
              
              @if (searchResults().tags.length > 0) {
                <button
                  (click)="setActiveTab('tags')"
                  [class]="getTabClass('tags')"
                >
                  Topics ({{ searchResults().tags.length }})
                </button>
              }
            </div>
          </section>

          <!-- Articles Results -->
          @if ((activeTab() === 'all' || activeTab() === 'posts') && searchResults().posts.length > 0) {
            <section>
              <div class="mb-6 flex items-center justify-between">
                <h2 class="border-b-2 border-brand-blue pb-2 text-2xl font-semibold text-text-primary">
                  Articles
                </h2>
                @if (activeTab() === 'all' && searchResults().posts.length > 3) {
                  <button
                    (click)="setActiveTab('posts')"
                    class="font-mono text-sm text-brand-blue underline hover:text-brand-blue/80"
                  >
                    View all {{ searchResults().posts.length }} articles →
                  </button>
                }
              </div>
              
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                @for (post of getDisplayedPosts(); track post._id) {
                  <article class="blog-card group">
                    @if (post.coverImage) {
                      <img 
                        [src]="post.coverImage" 
                        [alt]="post.title"
                        class="h-48 w-full border-b border-ui-border object-cover transition-all group-hover:opacity-90"
                      >
                    }
                    
                    <div class="p-6">
                      <h3 class="mb-3 text-xl font-semibold leading-tight text-text-primary">
                        <a 
                          [routerLink]="['/post', post.slug]"
                          class="transition-colors hover:text-brand-blue"
                          [innerHTML]="highlightSearchTerm(post.title)"
                        ></a>
                      </h3>
                      
                      @if (post.excerpt) {
                        <p 
                          class="mb-4 line-clamp-3 text-sm leading-relaxed text-text-secondary"
                          [innerHTML]="highlightSearchTerm(post.excerpt)"
                        ></p>
                      }
                      
                      <!-- Tags -->
                      @if (getPostTags(post.tags).length > 0) {
                        <div class="mb-4 flex flex-wrap gap-2">
                          @for (tag of getPostTags(post.tags).slice(0, 3); track getTagId(tag)) {
                            <a 
                              [routerLink]="['/tag', getTagSlug(tag)]"
                              class="inline-block rounded-full bg-ui-background px-3 py-1 font-mono text-xs uppercase tracking-wide text-text-primary transition-colors hover:bg-brand-blue/10 hover:text-brand-blue"
                            >
                              {{ getTagName(tag) }}
                            </a>
                          }
                        </div>
                      }
                      
                      <!-- Meta -->
                      <div class="flex items-center justify-between font-mono text-xs text-text-secondary">
                        <div class="flex items-center gap-2">
                          <span>{{ getAuthorName(post.author) }}</span>
                          <span>•</span>
                          <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
                        </div>
                        <span>{{ post.readingTime || calculateReadingTime(post.content) }} min</span>
                      </div>
                    </div>
                  </article>
                }
              </div>
            </section>
          }

          <!-- Authors Results -->
          @if ((activeTab() === 'all' || activeTab() === 'users') && searchResults().users.length > 0) {
            <section>
              <div class="mb-6 flex items-center justify-between">
                <h2 class="border-b-2 border-brand-blue pb-2 text-2xl font-semibold text-text-primary">
                  Authors
                </h2>
                @if (activeTab() === 'all' && searchResults().users.length > 6) {
                  <button
                    (click)="setActiveTab('users')"
                    class="font-mono text-sm text-brand-blue underline hover:text-brand-blue/80"
                  >
                    View all {{ searchResults().users.length }} authors →
                  </button>
                }
              </div>
              
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                @for (user of getDisplayedUsers(); track user._id) {
                  <div class="group rounded-xl border border-ui-border bg-ui-surface p-6 transition-all hover:border-brand-blue hover:shadow-md">
                    <div class="mb-4 flex items-center gap-4">
                      @if (user.avatarUrl) {
                        <img 
                          [src]="user.avatarUrl" 
                          [alt]="user.name"
                          class="h-16 w-16 rounded-full border-2 border-ui-border"
                        >
                      } @else {
                        <div class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ui-border bg-brand-blue/10 text-xl font-bold text-brand-blue">
                          {{ getUserInitials(user) }}
                        </div>
                      }
                      
                      <div class="flex-1">
                        <h3 class="mb-1 text-lg font-semibold text-text-primary">
                          <a 
                            [routerLink]="['/user', user._id]"
                            class="transition-colors hover:text-brand-blue"
                            [innerHTML]="highlightSearchTerm(user.name)"
                          ></a>
                        </h3>
                        
                        @if (user.isVerified) {
                          <div class="inline-flex items-center gap-1 text-blue-600 text-xs mb-2">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            <span class="font-mono">Verified</span>
                          </div>
                        }
                        
                        <div class="flex items-center gap-4 font-mono text-xs text-text-secondary">
                          <span>{{ user.followerCount || 0 }} followers</span>
                          <span>•</span>
                          <span>{{ formatDate(user.createdAt) }}</span>
                        </div>
                      </div>
                    </div>
                    
                    @if (user.bio) {
                      <p 
                        class="mb-4 line-clamp-2 text-sm leading-relaxed text-text-secondary"
                        [innerHTML]="highlightSearchTerm(user.bio)"
                      ></p>
                    }
                    
                    <div class="flex items-center justify-between">
                      <a 
                        [routerLink]="['/user', user._id]"
                        class="font-mono text-sm text-brand-blue underline hover:text-brand-blue/80"
                      >
                        View Profile
                      </a>
                      
                      @if (isAuthenticated()) {
                        <button
                          (click)="toggleFollow(user._id)"
                          class="btn-pill font-mono text-xs uppercase tracking-wide"
                        >
                          Follow
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </section>
          }

          <!-- Topics Results -->
          @if ((activeTab() === 'all' || activeTab() === 'tags') && searchResults().tags.length > 0) {
            <section>
              <div class="mb-6 flex items-center justify-between">
                <h2 class="border-b-2 border-brand-blue pb-2 text-2xl font-semibold text-text-primary">
                  Topics
                </h2>
                @if (activeTab() === 'all' && searchResults().tags.length > 12) {
                  <button
                    (click)="setActiveTab('tags')"
                    class="font-mono text-sm text-brand-blue underline hover:text-brand-blue/80"
                  >
                    View all {{ searchResults().tags.length }} topics →
                  </button>
                }
              </div>
              
              <div class="flex flex-wrap gap-3">
                @for (tag of getDisplayedTags(); track tag._id) {
                  <a 
                    [routerLink]="['/tag', tag.slug]"
                    class="group inline-block rounded-full border-2 border-ui-border bg-ui-surface px-6 py-3 font-mono text-sm transition-all hover:border-brand-blue hover:bg-brand-blue/5"
                    [style.background-color]="tag.color ? tag.color + '08' : undefined"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-text-primary" [innerHTML]="highlightSearchTerm('#' + tag.name)"></span>
                      <span class="font-mono text-xs text-text-secondary">({{ tag.postCount }})</span>
                    </div>
                    @if (tag.description) {
                      <div 
                        class="mt-1 line-clamp-1 text-xs text-text-secondary"
                        [innerHTML]="highlightSearchTerm(tag.description)"
                      ></div>
                    }
                  </a>
                }
              </div>
            </section>
          }
        </div>
      }

      <!-- Related Searches -->
      @if (searchQuery() && totalResults() > 0 && relatedSearches().length > 0) {
        <section class="mt-12 rounded-2xl border border-ui-border bg-ui-surface p-6 shadow-sm">
          <h3 class="mb-4 text-center text-xl font-semibold text-text-primary">Related Searches</h3>
          
          <div class="flex flex-wrap justify-center gap-3">
            @for (relatedSearch of relatedSearches(); track relatedSearch) {
              <button
                (click)="performSearch(relatedSearch)"
                class="btn-pill font-mono uppercase tracking-wide"
              >
                {{ relatedSearch }}
              </button>
            }
          </div>
        </section>
      }

      <!-- Footer CTA -->
      <section class="mt-12 rounded-2xl border border-ui-border bg-ui-surface p-6 text-center shadow-sm">
        <div class="p-6">
          <h3 class="mb-3 text-xl font-semibold text-text-primary">Can't find what you're looking for?</h3>
          <p class="mb-6 text-text-secondary">
            Try browsing by topic or check out our latest articles.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <a routerLink="/archive" class="font-mono text-sm text-brand-blue underline hover:text-brand-blue/80">
              Browse All Articles
            </a>
            <span class="text-text-secondary">•</span>
            <a routerLink="/" class="font-mono text-sm text-brand-blue underline hover:text-brand-blue/80">
              Latest Posts
            </a>
            @if (isAuthenticated()) {
              <span class="text-text-secondary">•</span>
              <a routerLink="/write" class="font-mono text-sm text-brand-blue underline hover:text-brand-blue/80">
                Write Article
              </a>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Highlight styling */
    ::ng-deep .search-highlight {
      background-color: rgba(32, 64, 154, 0.15);
      color: #20409A;
      font-weight: 600;
      padding: 0 2px;
      border-radius: 2px;
    }

    /* Search input focus */
    input:focus {
      box-shadow: 0 0 0 3px rgba(32, 64, 154, 0.1);
    }
  `]
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Reactive Signals
  loading = signal(false);
  searchResults = signal<SearchResults>({
    posts: [],
    users: [],
    tags: []
  });
  popularTags = signal<Tag[]>([]);
  activeTab = signal<'all' | 'posts' | 'users' | 'tags'>('all');
  searchTime = signal<number>(0);

  // Form Control
  searchControl = new FormControl('');

  // Search state
  searchQuery = signal('');

  // Computed values
  totalResults = computed(() => {
    const results = this.searchResults();
    return results.posts.length + results.users.length + results.tags.length;
  });

  getDisplayedPosts = computed(() => {
    const posts = this.searchResults().posts;
    return this.activeTab() === 'all' ? posts.slice(0, 6) : posts;
  });

  getDisplayedUsers = computed(() => {
    const users = this.searchResults().users;
    return this.activeTab() === 'all' ? users.slice(0, 6) : users;
  });

  getDisplayedTags = computed(() => {
    const tags = this.searchResults().tags;
    return this.activeTab() === 'all' ? tags.slice(0, 12) : tags;
  });

  relatedSearches = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const tags = this.popularTags();
    
    // Generate related searches based on popular tags
    return tags
      .filter(tag => tag.name.toLowerCase().includes(query) || query.includes(tag.name.toLowerCase()))
      .slice(0, 5)
      .map(tag => tag.name);
  });

  async ngOnInit() {
    await this.loadPopularTags();
    
    // Check for search query in URL params
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchControl.setValue(params['q'], { emitEvent: false });
        this.searchQuery.set(params['q']);
        this.performSearch(params['q']);
      }
    });

    // Setup search input subscription
    this.setupSearchSubscription();
  }

  private async loadPopularTags() {
    try {
      const tags = await this.apiService.getPopularTags();
      this.popularTags.set(tags);
    } catch (error) {
      console.error('Failed to load popular tags:', error);
    }
  }

  private setupSearchSubscription() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value && value.trim()) {
        this.performSearch(value.trim());
      }
    });
  }

  async performSearch(query: string) {
    if (!query || !query.trim()) return;

    try {
      this.loading.set(true);
      this.searchQuery.set(query);
      
      // Update URL
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: query },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });

      const startTime = Date.now();

      // Perform all searches in parallel
      const [posts, users, tags] = await Promise.all([
        this.apiService.searchPosts(query),
        this.apiService.searchUsers(query),
        this.apiService.searchTags(query)
      ]);

      const endTime = Date.now();
      this.searchTime.set(endTime - startTime);

      this.searchResults.set({ posts, users, tags });
      this.activeTab.set('all');

    } catch (error) {
      console.error('Search failed:', error);
      this.searchResults.set({ posts: [], users: [], tags: [] });
    } finally {
      this.loading.set(false);
    }
  }

  searchForTag(tagName: string) {
    this.searchControl.setValue(tagName);
    this.performSearch(tagName);
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.searchQuery.set('');
    this.searchResults.set({ posts: [], users: [], tags: [] });
    
    // Clear URL params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  setActiveTab(tab: 'all' | 'posts' | 'users' | 'tags') {
    this.activeTab.set(tab);
  }

  getTabClass(tab: 'all' | 'posts' | 'users' | 'tags'): string {
    const baseClass = "px-4 py-2 font-mono text-sm rounded-lg transition-all";
    return this.activeTab() === tab
      ? `${baseClass} bg-brand-blue text-white`
      : `${baseClass} bg-ui-background text-text-primary hover:bg-brand-blue/10 hover:text-brand-blue`;
  }

  highlightSearchTerm(text: string): string {
    if (!this.searchQuery() || !text) return text;
    
    const query = this.searchQuery().toLowerCase();
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  // User interactions
  async toggleFollow(userId: string) {
    if (!this.isAuthenticated()) return;
    
    try {
      await this.apiService.followUser(userId);
      // Update UI or show success message
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  }

  // Helper methods
  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  formatDate(dateString: string): string {
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

  getUserInitials(user: User): string {
    if (!user?.name) return 'A';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
