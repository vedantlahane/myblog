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
  <header class="mb-12 rounded-2xl border border-border-default bg-surface p-8 shadow-card dark:border-border-dark dark:bg-surface-dark">
        <div class="text-center">
          <div class="mb-4 inline-flex items-center rounded-full bg-brand-blue/10 px-4 py-1 text-xs font-mono uppercase tracking-[0.35em] text-brand-blue">
            Search Results
          </div>
          
          <h1 class="mb-4 text-3xl font-semibold text-text-primary md:text-4xl">
            @if (searchQuery()) {
              Results for "{{ searchQuery() }}"
            } @else {
              Search Motherworld
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
                class="w-full rounded-xl border-2 border-border-default bg-white px-6 py-4 pl-12 font-mono text-lg text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-brand-blue focus:outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/10 dark:border-border-dark dark:bg-surface-dark dark:text-white"
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
            <div class="inline-block rounded-2xl border border-border-default bg-surface p-12 shadow-card dark:border-border-dark dark:bg-surface-dark">
              <div class="mb-6 text-6xl">🔍</div>
              <h2 class="mb-4 text-2xl font-semibold text-text-primary">Discover Motherworld</h2>
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
                        class="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-muted px-3 py-1 font-mono text-xs uppercase tracking-[0.3em] text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-brand-accent"
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
                  class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:bg-brand-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                >
                  Browse All Articles
                </a>
                <a
                  routerLink="/write"
                  class="inline-flex items-center justify-center gap-2 rounded-xl border border-border-default px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-white"
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
            <div class="inline-block rounded-2xl border border-border-default bg-surface p-12 shadow-card dark:border-border-dark dark:bg-surface-dark">
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
                        class="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-muted px-3 py-1 font-mono text-xs uppercase tracking-[0.3em] text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-brand-accent"
                      >
                        {{ tag.name }}
                      </button>
                    }
                  </div>
                </div>
              }
              
              <button
                (click)="clearSearch()"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:bg-brand-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
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
          <section class="rounded-xl border border-border-default bg-surface p-6 shadow-card dark:border-border-dark dark:bg-surface-dark">
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
                  <article class="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-default bg-surface shadow-card transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover focus-within:-translate-y-0.5 focus-within:shadow-card-hover dark:border-border-dark dark:bg-surface-dark">
                    @if (post.coverImage) {
                      <img 
                        [src]="post.coverImage" 
                        [alt]="post.title"
                        class="h-48 w-full border-b border-border-default object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      >
                    }
                    
                    <div class="flex flex-1 flex-col gap-4 p-6">
                      <h3 class="text-xl font-semibold leading-tight text-text-primary transition-colors duration-200 group-hover:text-brand-blue dark:text-white">
                        <a 
                          [routerLink]="['/post', post.slug]"
                          class="transition-colors hover:text-brand-blue"
                          [innerHTML]="highlightSearchTerm(post.title)"
                        ></a>
                      </h3>
                      
                      @if (post.excerpt) {
                        <p 
                          class="line-clamp-3 text-sm leading-relaxed text-text-secondary dark:text-slate-300"
                          [innerHTML]="highlightSearchTerm(post.excerpt)"
                        ></p>
                      }
                      
                      <!-- Tags -->
                      @if (getPostTags(post.tags).length > 0) {
                        <div class="flex flex-wrap gap-2">
                          @for (tag of getPostTags(post.tags).slice(0, 3); track getTagId(tag)) {
                            <a 
                              [routerLink]="['/tag', getTagSlug(tag)]"
                              class="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-muted px-3 py-1 font-mono text-xs uppercase tracking-[0.25em] text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-brand-accent"
                            >
                              {{ getTagName(tag) }}
                            </a>
                          }
                        </div>
                      }
                      
                      <!-- Meta -->
                      <div class="mt-auto flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em] text-text-secondary dark:text-slate-400">
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
                  <div class="group rounded-2xl border border-border-default bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-card-hover dark:border-border-dark dark:bg-surface-dark">
                    <div class="mb-4 flex items-center gap-4">
                      @if (user.avatarUrl) {
                        <img 
                          [src]="user.avatarUrl" 
                          [alt]="user.name"
                          class="h-16 w-16 rounded-full border-2 border-border-default dark:border-white/10"
                        >
                      } @else {
                        <div class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border-default bg-brand-blue/10 text-xl font-bold text-brand-blue dark:border-white/10">
                          {{ getUserInitials(user) }}
                        </div>
                      }
                      
                      <div class="flex-1">
                        <h3 class="mb-1 text-lg font-semibold text-text-primary transition-colors duration-200 group-hover:text-brand-blue dark:text-white">
                          <a 
                            [routerLink]="['/user', user._id]"
                            class="transition-colors hover:text-brand-blue"
                            [innerHTML]="highlightSearchTerm(user.name)"
                          ></a>
                        </h3>
                        
                        @if (user.isVerified) {
                          <div class="mb-2 inline-flex items-center gap-1 text-xs text-brand-blue">
                            <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            <span class="font-mono uppercase tracking-[0.3em]">Verified</span>
                          </div>
                        }
                        
                        <div class="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.25em] text-text-secondary dark:text-slate-400">
                          <span>{{ user.followerCount || 0 }} followers</span>
                          <span>•</span>
                          <span>{{ formatDate(user.createdAt) }}</span>
                        </div>
                      </div>
                    </div>
                    
                    @if (user.bio) {
                      <p 
                        class="mb-4 line-clamp-2 text-sm leading-relaxed text-text-secondary dark:text-slate-300"
                        [innerHTML]="highlightSearchTerm(user.bio)"
                      ></p>
                    }
                    
                    <div class="flex items-center justify-between">
                      <a 
                        [routerLink]="['/user', user._id]"
                        class="font-mono text-sm text-brand-blue underline decoration-2 underline-offset-4 transition-colors hover:text-brand-blue/80"
                      >
                        View Profile
                      </a>
                      
                      @if (isAuthenticated()) {
                        <button
                          (click)="toggleFollow(user._id)"
                          class="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-muted px-3 py-1 font-mono text-xs uppercase tracking-[0.3em] text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-brand-accent"
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
                    class="group inline-block rounded-full border-2 border-border-default bg-surface px-6 py-3 font-mono text-sm transition-all duration-200 hover:border-brand-blue hover:bg-brand-blue/5 dark:border-border-dark dark:bg-surface-dark"
                    [style.background-color]="tag.color ? tag.color + '08' : undefined"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-text-primary" [innerHTML]="highlightSearchTerm('#' + tag.name)"></span>
                      <span class="font-mono text-xs text-text-secondary">({{ tag.postCount }})</span>
                    </div>
                    @if (tag.description) {
                      <div 
                        class="mt-1 line-clamp-1 text-xs text-text-secondary dark:text-slate-300"
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
  <section class="mt-12 rounded-2xl border border-border-default bg-surface p-6 shadow-card dark:border-border-dark dark:bg-surface-dark">
          <h3 class="mb-4 text-center text-xl font-semibold text-text-primary">Related Searches</h3>
          
          <div class="flex flex-wrap justify-center gap-3">
            @for (relatedSearch of relatedSearches(); track relatedSearch) {
              <button
                (click)="performSearch(relatedSearch)"
                class="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-muted px-3 py-1 font-mono text-xs uppercase tracking-[0.3em] text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-brand-accent"
              >
                {{ relatedSearch }}
              </button>
            }
          </div>
        </section>
      }

      <!-- Footer CTA -->
  <section class="mt-12 rounded-2xl border border-border-default bg-surface p-6 text-center shadow-card dark:border-border-dark dark:bg-surface-dark">
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
  `
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
    const baseClass = 'inline-flex items-center gap-2 rounded-lg border border-border-default px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10';
    return this.activeTab() === tab
      ? `${baseClass} bg-brand-blue text-white shadow-card`
      : `${baseClass} bg-surface-muted text-text-secondary hover:-translate-y-0.5 hover:border-brand-blue hover:text-brand-blue dark:bg-white/5`;
  }

  highlightSearchTerm(text: string): string {
    if (!this.searchQuery() || !text) return text;
    
    const query = this.searchQuery().toLowerCase();
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="rounded-sm bg-brand-blue/15 px-1 font-semibold text-brand-blue">$1</mark>');
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
