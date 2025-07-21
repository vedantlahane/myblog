import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post, User, PaginatedResponse, Tag, Category } from '../../../types/api';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { WriteModalComponent } from '../../components/write-modal/write-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, PostCardComponent, WriteModalComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <section class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-4 py-16">
          <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Modern <span class="text-amber-500">Blog</span>
            </h1>
            <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover amazing stories, insights, and ideas from writers around the world.
              Share your thoughts and connect with a community of passionate readers.
            </p>
            
            @if (isAuthenticated()) {
              <button 
                (click)="openWriteModal()"
                class="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Write Story
              </button>
            } @else {
              <div class="space-x-4">
                <a 
                  routerLink="/register" 
                  class="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block">
                  Get Started
                </a>
                <a 
                  routerLink="/login" 
                  class="text-gray-700 hover:text-gray-900 px-8 py-3 font-semibold transition-colors inline-block">
                  Sign In
                </a>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <div class="max-w-6xl mx-auto px-4 py-12">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Main Content Area -->
          <main class="lg:col-span-2">
            <!-- Featured Post -->
            @if (featuredPost(); as featured) {
              <section class="mb-12">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Featured Story</h2>
                <article class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  @if (featured.coverImage) {
                    <div class="aspect-[16/9] overflow-hidden">
                      <img 
                        [src]="featured.coverImage" 
                        [alt]="featured.title"
                        class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
                    </div>
                  }
                  <div class="p-6">
                    <div class="flex items-center gap-2 mb-4">
                      @for (tag of featured.tags; track tag; let last = $last) {
                        <span class="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                          {{ typeof tag === 'string' ? tag : tag.name }}
                        </span>
                        @if (!last) {
                          <span class="text-gray-300">•</span>
                        }
                      }
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2 hover:text-amber-600 transition-colors">
                      <a [routerLink]="['/post', featured.slug]">{{ featured.title }}</a>
                    </h3>
                    @if (featured.excerpt) {
                      <p class="text-gray-600 mb-4">{{ featured.excerpt }}</p>
                    }
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <img 
                          [src]="getAuthorAvatar(featured.author)" 
                          [alt]="getAuthorName(featured.author)"
                          class="w-8 h-8 rounded-full">
                        <div>
                          <p class="font-medium text-gray-900">{{ getAuthorName(featured.author) }}</p>
                          <p class="text-sm text-gray-500">{{ formatDate(featured.publishedAt || featured.createdAt) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-4 text-gray-500">
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {{ featured.likeCount || 0 }}
                        </span>
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                          {{ featured.commentCount || 0 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </section>
            }

            <!-- Latest Posts -->
            <section>
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Latest Stories</h2>
                <div class="flex gap-2">
                  <button 
                    (click)="loadPosts('latest')"
                    [class.bg-amber-500]="currentFilter() === 'latest'"
                    [class.text-white]="currentFilter() === 'latest'"
                    [class.bg-gray-200]="currentFilter() !== 'latest'"
                    [class.text-gray-700]="currentFilter() !== 'latest'"
                    class="px-4 py-2 rounded-lg font-medium transition-colors">
                    Latest
                  </button>
                  <button 
                    (click)="loadPosts('popular')"
                    [class.bg-amber-500]="currentFilter() === 'popular'"
                    [class.text-white]="currentFilter() === 'popular'"
                    [class.bg-gray-200]="currentFilter() !== 'popular'"
                    [class.text-gray-700]="currentFilter() !== 'popular'"
                    class="px-4 py-2 rounded-lg font-medium transition-colors">
                    Popular
                  </button>
                </div>
              </div>

              @if (isLoading()) {
                <div class="space-y-4">
                  @for (item of [1,2,3,4]; track item) {
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                      <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div class="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="space-y-6">
                  @for (post of posts(); track post._id) {
                    <app-post-card [post]="post"></app-post-card>
                  } @empty {
                    <div class="text-center py-12">
                      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <p class="text-gray-500">No stories available yet.</p>
                    </div>
                  }
                </div>

                @if (hasMorePosts()) {
                  <div class="text-center mt-8">
                    <button 
                      (click)="loadMorePosts()"
                      [disabled]="isLoadingMore()"
                      class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
                      @if (isLoadingMore()) {
                        <span class="inline-flex items-center gap-2">
                          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                          Loading...
                        </span>
                      } @else {
                        Load More Stories
                      }
                    </button>
                  </div>
                }
              }
            </section>
          </main>

          <!-- Sidebar -->
          <aside class="space-y-8">
            <!-- Popular Tags -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Popular Tags</h3>
              @if (tags(); as tagList) {
                <div class="flex flex-wrap gap-2">
                  @for (tag of tagList.slice(0, 15); track tag._id || tag) {
                    <a 
                      [routerLink]="['/tag', typeof tag === 'string' ? tag : tag.slug]"
                      class="bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-800 px-3 py-1 rounded-full text-sm transition-colors">
                      {{ typeof tag === 'string' ? tag : tag.name }}
                    </a>
                  }
                </div>
              } @else {
                <div class="animate-pulse">
                  <div class="flex flex-wrap gap-2">
                    @for (item of [1,2,3,4,5,6]; track item) {
                      <div class="h-6 bg-gray-200 rounded-full w-16"></div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Categories -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Categories</h3>
              @if (categories(); as categoryList) {
                <div class="space-y-2">
                  @for (category of categoryList.slice(0, 8); track category._id || category) {
                    <a 
                      [routerLink]="['/category', typeof category === 'string' ? category : category.slug]"
                      class="block hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div class="flex items-center justify-between">
                        <span class="text-gray-700">{{ typeof category === 'string' ? category : category.name }}</span>
                      </div>
                    </a>
                  }
                </div>
              } @else {
                <div class="animate-pulse space-y-2">
                  @for (item of [1,2,3,4,5]; track item) {
                    <div class="h-8 bg-gray-200 rounded-lg"></div>
                  }
                </div>
              }
            </div>

            <!-- Newsletter Signup -->
            @if (!isAuthenticated()) {
              <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-2">Stay Updated</h3>
                <p class="text-gray-600 text-sm mb-4">Join our newsletter to get the latest stories delivered to your inbox.</p>
                <div class="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                  <button class="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            }
          </aside>
        </div>
      </div>

      <!-- Write Modal -->
      @if (showWriteModal()) {
        <app-write-modal (close)="closeWriteModal()" (postCreated)="onPostCreated($event)"></app-write-modal>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private destroy$ = new Subject<void>();

  // State signals
  posts = signal<Post[]>([]);
  featuredPost = signal<Post | null>(null);
  tags = signal<Tag[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(false);
  isLoadingMore = signal(false);
  hasMorePosts = signal(true);
  currentFilter = signal<'latest' | 'popular'>('latest');
  showWriteModal = signal(false);
  
  // Pagination
  currentPage = 1;
  postsPerPage = 10;

  // Computed properties
  isAuthenticated = computed(() => this.apiService.isAuthenticated());

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading.set(true);

    // Load posts, tags, and categories in parallel
    forkJoin({
      posts: this.apiService.getPosts({ 
        page: 1, 
        limit: this.postsPerPage, 
        sort: 'createdAt'
      }).pipe(catchError(() => of({ data: [], currentPage: 1, totalPages: 0, totalItems: 0 }))),
      tags: this.apiService.getTags().pipe(catchError(() => of([]))),
      categories: this.apiService.getCategories().pipe(catchError(() => of([])))
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading.set(false))
    ).subscribe(({ posts, tags, categories }) => {
      this.posts.set(posts.data);
      this.tags.set(tags);
      this.categories.set(categories);
      this.hasMorePosts.set(posts.currentPage < posts.totalPages);
      
      // Set featured post (first post with cover image or just first post)
      const featured = posts.data.find(p => p.coverImage) || posts.data[0];
      if (featured) {
        this.featuredPost.set(featured);
        // Remove featured post from main list
        this.posts.set(posts.data.filter(p => p._id !== featured._id));
      }
    });
  }

  loadPosts(filter: 'latest' | 'popular'): void {
    this.currentFilter.set(filter);
    this.currentPage = 1;
    this.isLoading.set(true);

    const sortField = filter === 'latest' ? 'createdAt' : 'likeCount';
    
    this.apiService.getPosts({ 
      page: 1, 
      limit: this.postsPerPage, 
      sort: sortField
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading.set(false))
    ).subscribe(response => {
      this.posts.set(response.data);
      this.hasMorePosts.set(response.currentPage < response.totalPages);
    });
  }

  loadMorePosts(): void {
    if (this.isLoadingMore() || !this.hasMorePosts()) return;

    this.isLoadingMore.set(true);
    this.currentPage++;

    const sortField = this.currentFilter() === 'latest' ? 'createdAt' : 'likeCount';
    
    this.apiService.getPosts({ 
      page: this.currentPage, 
      limit: this.postsPerPage, 
      sort: sortField
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoadingMore.set(false))
    ).subscribe(response => {
      this.posts.update(current => [...current, ...response.data]);
      this.hasMorePosts.set(response.currentPage < response.totalPages);
    });
  }

  openWriteModal(): void {
    this.showWriteModal.set(true);
  }

  closeWriteModal(): void {
    this.showWriteModal.set(false);
  }

  onPostCreated(post: Post): void {
    // Add new post to the beginning of the list
    this.posts.update(current => [post, ...current]);
    this.closeWriteModal();
  }

  getAuthorName(author: string | User): string {
    return typeof author === 'string' ? 'Unknown Author' : author.name;
  }

  getAuthorAvatar(author: string | User): string {
    return typeof author === 'string' 
      ? '/assets/images/default-avatar.png' 
      : author.avatarUrl || '/assets/images/default-avatar.png';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
