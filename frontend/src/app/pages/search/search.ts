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
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      <!-- Search Header -->
      <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
        <div class="text-center border-2 border-dotted border-amber-700 p-6">
          <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
            Search Results
          </div>
          
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-4">
            @if (searchQuery()) {
              Results for "{{ searchQuery() }}"
            } @else {
              Search MyBlog
            }
          </h1>
          
          @if (searchQuery() && !loading()) {
            <p class="text-amber-700 text-lg font-mono mb-6">
              Found {{ totalResults() }} result{{ totalResults() === 1 ? '' : 's' }} 
              @if (searchTime()) {
                in {{ searchTime() }}ms
              }
            </p>
          }
          
          <!-- Search Bar -->
          <div class="max-w-2xl mx-auto">
            <div class="relative">
              <input
                [formControl]="searchControl"
                type="text"
                placeholder="Search articles, authors, or topics..."
                class="w-full px-6 py-4 pl-12 text-lg border-4 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-amber-900 placeholder-amber-400"
              />
              <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              
              @if (searchQuery()) {
                <button
                  (click)="clearSearch()"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800 transition-colors"
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
        <div class="flex justify-center items-center py-16">
          <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-lg">
            <div class="w-8 h-8 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
            Searching...
          </div>
        </div>
      } @else if (!searchQuery()) {
        <!-- Empty State - No Search -->
        <section class="mb-12">
          <div class="text-center py-16">
            <div class="inline-block border-4 border-amber-300 p-12 bg-amber-100">
              <div class="text-6xl mb-6">🔍</div>
              <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4">Discover MyBlog</h2>
              <p class="text-amber-700 mb-8 max-w-lg mx-auto">
                Search through our collection of articles, discover new authors, and explore topics that interest you.
              </p>
              
              <!-- Popular Searches -->
              @if (popularTags().length > 0) {
                <div class="mb-8">
                  <h3 class="font-mono text-sm font-bold text-amber-800 mb-4">Popular Topics</h3>
                  <div class="flex flex-wrap gap-3 justify-center">
                    @for (tag of popularTags().slice(0, 8); track tag._id) {
                      <button
                        (click)="searchForTag(tag.name)"
                        class="inline-block bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors border border-amber-400"
                      >
                        {{ tag.name }} ({{ tag.postCount }})
                      </button>
                    }
                  </div>
                </div>
              }
              
              <div class="flex justify-center gap-4">
                <a
                  routerLink="/archive"
                  class="inline-block bg-amber-800 text-amber-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700"
                >
                  Browse All Articles
                </a>
                <a
                  routerLink="/write"
                  class="inline-block bg-amber-200 text-amber-900 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400"
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
          <div class="text-center py-16">
            <div class="inline-block border-4 border-amber-300 p-12 bg-amber-100">
              <div class="text-6xl mb-6">🔍</div>
              <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4">No Results Found</h2>
              <p class="text-amber-700 mb-8 max-w-lg mx-auto">
                We couldn't find anything matching <strong>"{{ searchQuery() }}"</strong>. 
                Try different keywords or browse our popular topics below.
              </p>
              
              @if (popularTags().length > 0) {
                <div class="mb-8">
                  <h3 class="font-mono text-sm font-bold text-amber-800 mb-4">Try These Topics</h3>
                  <div class="flex flex-wrap gap-3 justify-center">
                    @for (tag of popularTags().slice(0, 6); track tag._id) {
                      <button
                        (click)="searchForTag(tag.name)"
                        class="inline-block bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors border border-amber-400"
                      >
                        {{ tag.name }}
                      </button>
                    }
                  </div>
                </div>
              }
              
              <button
                (click)="clearSearch()"
                class="bg-amber-600 text-amber-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors border-2 border-amber-500"
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
          <section class="bg-amber-50 border-4 border-amber-300 p-6">
            <div class="flex flex-wrap items-center gap-4 justify-center">
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
              <div class="flex items-center justify-between mb-6">
                <h2 class="font-serif text-2xl font-bold text-amber-900 border-b-2 border-dotted border-amber-400 pb-2">
                  Articles
                </h2>
                @if (activeTab() === 'all' && searchResults().posts.length > 3) {
                  <button
                    (click)="setActiveTab('posts')"
                    class="text-amber-600 hover:text-amber-800 font-mono text-sm underline"
                  >
                    View all {{ searchResults().posts.length }} articles →
                  </button>
                }
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (post of getDisplayedPosts(); track post._id) {
                  <article class="bg-amber-50 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 group">
                    @if (post.coverImage) {
                      <img 
                        [src]="post.coverImage" 
                        [alt]="post.title"
                        class="w-full h-48 object-cover border-b-2 border-amber-200 group-hover:sepia-[20%] transition-all"
                      >
                    }
                    
                    <div class="p-6">
                      <h3 class="font-serif text-xl font-bold text-amber-900 mb-3 leading-tight">
                        <a 
                          [routerLink]="['/post', post.slug]"
                          class="hover:text-amber-700 transition-colors"
                          [innerHTML]="highlightSearchTerm(post.title)"
                        ></a>
                      </h3>
                      
                      @if (post.excerpt) {
                        <p 
                          class="text-amber-700 text-sm mb-4 leading-relaxed line-clamp-3"
                          [innerHTML]="highlightSearchTerm(post.excerpt)"
                        ></p>
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
                      
                      <!-- Meta -->
                      <div class="flex items-center justify-between text-xs font-mono text-amber-600">
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
              <div class="flex items-center justify-between mb-6">
                <h2 class="font-serif text-2xl font-bold text-amber-900 border-b-2 border-dotted border-amber-400 pb-2">
                  Authors
                </h2>
                @if (activeTab() === 'all' && searchResults().users.length > 6) {
                  <button
                    (click)="setActiveTab('users')"
                    class="text-amber-600 hover:text-amber-800 font-mono text-sm underline"
                  >
                    View all {{ searchResults().users.length }} authors →
                  </button>
                }
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (user of getDisplayedUsers(); track user._id) {
                  <div class="bg-amber-50 border-2 border-amber-200 p-6 hover:border-amber-400 transition-colors group">
                    <div class="flex items-center gap-4 mb-4">
                      @if (user.avatarUrl) {
                        <img 
                          [src]="user.avatarUrl" 
                          [alt]="user.name"
                          class="w-16 h-16 rounded-full border-2 border-amber-300"
                        >
                      } @else {
                        <div class="w-16 h-16 bg-amber-200 border-2 border-amber-300 rounded-full flex items-center justify-center font-bold text-amber-800 text-xl">
                          {{ getUserInitials(user) }}
                        </div>
                      }
                      
                      <div class="flex-1">
                        <h3 class="font-serif text-lg font-bold text-amber-900 mb-1">
                          <a 
                            [routerLink]="['/user', user._id]"
                            class="hover:text-amber-700 transition-colors"
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
                        
                        <div class="flex items-center gap-4 text-xs font-mono text-amber-600">
                          <span>{{ user.followerCount || 0 }} followers</span>
                          <span>•</span>
                          <span>{{ formatDate(user.createdAt) }}</span>
                        </div>
                      </div>
                    </div>
                    
                    @if (user.bio) {
                      <p 
                        class="text-amber-700 text-sm leading-relaxed line-clamp-2 mb-4"
                        [innerHTML]="highlightSearchTerm(user.bio)"
                      ></p>
                    }
                    
                    <div class="flex justify-between items-center">
                      <a 
                        [routerLink]="['/user', user._id]"
                        class="text-amber-600 hover:text-amber-800 font-mono text-sm underline"
                      >
                        View Profile
                      </a>
                      
                      @if (isAuthenticated()) {
                        <button
                          (click)="toggleFollow(user._id)"
                          class="bg-amber-200 text-amber-800 px-3 py-1 font-mono text-xs uppercase hover:bg-amber-300 transition-colors border border-amber-400"
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
              <div class="flex items-center justify-between mb-6">
                <h2 class="font-serif text-2xl font-bold text-amber-900 border-b-2 border-dotted border-amber-400 pb-2">
                  Topics
                </h2>
                @if (activeTab() === 'all' && searchResults().tags.length > 12) {
                  <button
                    (click)="setActiveTab('tags')"
                    class="text-amber-600 hover:text-amber-800 font-mono text-sm underline"
                  >
                    View all {{ searchResults().tags.length }} topics →
                  </button>
                }
              </div>
              
              <div class="flex flex-wrap gap-3">
                @for (tag of getDisplayedTags(); track tag._id) {
                  <a 
                    [routerLink]="['/tag', tag.slug]"
                    class="inline-block bg-amber-200 text-amber-800 px-6 py-3 font-mono text-sm hover:bg-amber-300 transition-colors border-2 border-amber-400 hover:border-amber-500 group"
                    [style.background-color]="tag.color ? tag.color + '40' : undefined"
                  >
                    <div class="flex items-center gap-2">
                      <span [innerHTML]="highlightSearchTerm('#' + tag.name)"></span>
                      <span class="text-amber-600 text-xs">({{ tag.postCount }})</span>
                    </div>
                    @if (tag.description) {
                      <div 
                        class="text-xs text-amber-700 mt-1 line-clamp-1"
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
        <section class="mt-12 bg-amber-100 border-4 border-amber-800 p-6">
          <h3 class="font-serif text-xl font-bold text-amber-900 mb-4 text-center">Related Searches</h3>
          
          <div class="flex flex-wrap gap-3 justify-center">
            @for (relatedSearch of relatedSearches(); track relatedSearch) {
              <button
                (click)="performSearch(relatedSearch)"
                class="inline-block bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors border border-amber-400"
              >
                {{ relatedSearch }}
              </button>
            }
          </div>
        </section>
      }

      <!-- Footer CTA -->
      <section class="mt-12 bg-amber-50 border-4 border-amber-300 p-6 text-center">
        <div class="border-2 border-dotted border-amber-400 p-6">
          <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Can't find what you're looking for?</h3>
          <p class="text-amber-700 mb-6">
            Try browsing by topic or check out our latest articles.
          </p>
          <div class="flex justify-center gap-4">
            <a routerLink="/archive" class="text-amber-600 hover:text-amber-800 font-mono text-sm underline">
              Browse All Articles
            </a>
            <span class="text-amber-400">•</span>
            <a routerLink="/" class="text-amber-600 hover:text-amber-800 font-mono text-sm underline">
              Latest Posts
            </a>
            @if (isAuthenticated()) {
              <span class="text-amber-400">•</span>
              <a routerLink="/write" class="text-amber-600 hover:text-amber-800 font-mono text-sm underline">
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
      background-color: #fbbf24;
      color: #92400e;
      font-weight: bold;
      padding: 0 2px;
    }

    /* Vintage paper texture */
    article, .bg-amber-50 {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Search input focus */
    input:focus {
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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
    const baseClass = "px-4 py-2 font-mono text-sm border-2 transition-colors";
    return this.activeTab() === tab
      ? `${baseClass} bg-amber-800 text-amber-100 border-amber-700`
      : `${baseClass} bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:border-amber-400`;
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
