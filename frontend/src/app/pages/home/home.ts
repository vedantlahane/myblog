import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post, Tag, PostsResponse } from '../../../types/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section with Featured Post -->
    @if (featuredPost()) {
      <section class="mb-12 bg-amber-100 border-4 border-amber-800 p-8 shadow-lg">
        <div class="border-2 border-dotted border-amber-700 p-6">
          <div class="text-center mb-6">
            <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest">
              Featured Article
            </div>
          </div>
          
          <article class="text-center">
            @if (featuredPost()?.coverImage) {
              <img 
                [src]="featuredPost()?.coverImage" 
                [alt]="featuredPost()?.title"
                class="w-full h-64 object-cover border-2 border-amber-700 mb-6 sepia-[30%] contrast-[110%]"
              >
            }
            
            <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-4 leading-tight">
              <a 
                [routerLink]="['/post', featuredPost()?.slug]"
                class="hover:text-amber-700 transition-colors"
              >
                {{ featuredPost()?.title }}
              </a>
            </h1>
            
            <p class="text-amber-800 text-lg mb-6 leading-relaxed max-w-3xl mx-auto">
              {{ featuredPost()?.excerpt }}
            </p>
            
            <div class="flex items-center justify-center gap-4 text-sm font-mono text-amber-600 mb-4">
              <span>{{ getAuthorName(featuredPost()?.author) }}</span>
              <span>•</span>
              <span>{{ formatDate(featuredPost()?.publishedAt || featuredPost()?.createdAt) }}</span>
              <span>•</span>
              <span>{{ featuredPost()?.readingTime || 5 }} min read</span>
            </div>
            
            <div class="flex justify-center">
              <a 
                [routerLink]="['/post', featuredPost()?.slug]"
                class="inline-block bg-amber-800 text-amber-100 px-8 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 hover:border-amber-600"
              >
                Read Full Article
              </a>
            </div>
          </article>
        </div>
      </section>
    }

    <!-- Latest Articles Grid -->
    <section class="mb-12">
      <div class="flex items-center justify-between mb-8">
        <div class="border-b-2 border-dotted border-amber-800 pb-2">
          <h2 class="font-serif text-2xl font-bold text-amber-900">Latest Articles</h2>
          <p class="text-amber-700 text-sm font-mono mt-1">Fresh thoughts and insights</p>
        </div>
        
        <a 
          routerLink="/archive" 
          class="text-amber-700 hover:text-amber-900 font-mono text-sm uppercase tracking-wide border-b border-transparent hover:border-amber-700 transition-all"
        >
          View Archive →
        </a>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-amber-50 border-2 border-amber-200 p-6 animate-pulse">
              <div class="h-4 bg-amber-200 rounded mb-4"></div>
              <div class="h-3 bg-amber-200 rounded mb-2"></div>
              <div class="h-3 bg-amber-200 rounded mb-2"></div>
              <div class="h-3 bg-amber-200 rounded w-2/3"></div>
            </div>
          }
        </div>
      } @else if (latestPosts().length === 0) {
        <div class="text-center py-12">
          <div class="inline-block border-4 border-amber-300 p-8">
            <div class="text-amber-600 font-mono text-sm mb-2">NO ARTICLES YET</div>
            <p class="text-amber-700">The first article is coming soon!</p>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (post of latestPosts(); track post._id) {
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
                    @for (tag of getPostTags(post.tags).slice(0, 3); track tag._id || tag) {
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
                <div class="flex items-center justify-between text-xs font-mono text-amber-600">
                  <div class="flex items-center gap-2">
                    <span>{{ getAuthorName(post.author) }}</span>
                    <span>•</span>
                    <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <span>{{ post.readingTime || calculateReadingTime(post.content) }} min</span>
                    <span>•</span>
                    <div class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                      </svg>
                      <span>{{ post.likeCount || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          }
        </div>
        
        <!-- Load More Button -->
        @if (hasMore()) {
          <div class="text-center mt-12">
            <button 
              (click)="loadMore()"
              [disabled]="loadingMore()"
              class="inline-block bg-amber-100 text-amber-900 px-8 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-200 transition-colors border-2 border-amber-300 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (loadingMore()) {
                Loading More...
              } @else {
                Load More Articles
              }
            </button>
          </div>
        }
      }
    </section>

    <!-- Popular Tags Sidebar -->
    <aside class="mb-12">
      <div class="bg-amber-100 border-4 border-amber-800 p-6">
        <h3 class="font-serif text-xl font-bold text-amber-900 mb-4 text-center">Popular Topics</h3>
        
        @if (popularTags().length > 0) {
          <div class="flex flex-wrap gap-2 justify-center">
            @for (tag of popularTags(); track tag._id) {
              <a 
                [routerLink]="['/tag', tag.slug]"
                class="inline-block bg-amber-200 text-amber-800 px-3 py-2 text-sm font-mono uppercase tracking-wide hover:bg-amber-300 transition-colors border border-amber-400 hover:border-amber-500"
              >
                {{ tag.name }} ({{ tag.postCount }})
              </a>
            }
          </div>
        } @else {
          <p class="text-center text-amber-600 font-mono text-sm">No tags yet</p>
        }
      </div>
    </aside>

    <!-- Newsletter Signup Section (if not authenticated) -->
    @if (!isAuthenticated()) {
      <section class="mb-12">
        <div class="bg-amber-900 text-amber-100 border-4 border-amber-700 p-8 text-center">
          <div class="border-2 border-dotted border-amber-600 p-6">
            <h3 class="font-serif text-2xl font-bold mb-3">Join the Community</h3>
            <p class="text-amber-200 mb-6 max-w-2xl mx-auto">
              Get notified when new articles are published. Join our growing community of readers and thinkers.
            </p>
            <a 
              routerLink="/auth/register"
              class="inline-block bg-amber-600 text-amber-100 px-8 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors border-2 border-amber-500 hover:border-amber-400"
            >
              Join MyBlog
            </a>
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .sepia-20 {
      filter: sepia(20%) contrast(110%);
    }

    /* Vintage paper texture effect */
    article {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Typewriter loading animation */
    .loading-dots::after {
      content: '';
      animation: dots 1.5s steps(5, end) infinite;
    }

    @keyframes dots {
      0%, 20% { content: ''; }
      40% { content: '.'; }
      60% { content: '..'; }
      80%, 100% { content: '...'; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  
  // Reactive Signals
  loading = signal(false);
  loadingMore = signal(false);
  posts = signal<Post[]>([]);
  featuredPost = signal<Post | null>(null);
  popularTags = signal<Tag[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  
  // Computed values
  latestPosts = computed(() => 
    this.posts().filter(post => post._id !== this.featuredPost()?._id)
  );
  
  hasMore = computed(() => this.currentPage() < this.totalPages());
  
  async ngOnInit() {
    await Promise.all([
      this.loadPosts(),
      this.loadPopularTags()
    ]);
  }

  private async loadPosts() {
    try {
      this.loading.set(true);
      const response = await this.apiService.getPosts({
          status: 'published',
          limit: 12,
          page: 1,
          sort: '-publishedAt',
          dateTo: '',
          dateFrom: ''
      });
      
      this.posts.set(response.posts || response.data || []);
      this.totalPages.set(response.totalPages || 1);
      
      // Set featured post (first post)
      if (this.posts().length > 0) {
        this.featuredPost.set(this.posts()[0]);
      }
      
    } catch (error) {
      console.error('Failed to load posts:', error);
      this.posts.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPopularTags() {
    try {
      const tags = await this.apiService.getPopularTags();
      this.popularTags.set(tags.slice(0, 8)); // Show top 8 tags
    } catch (error) {
      console.error('Failed to load popular tags:', error);
      this.popularTags.set([]);
    }
  }

  async loadMore() {
    if (this.loadingMore() || !this.hasMore()) return;

    try {
      this.loadingMore.set(true);
      const nextPage = this.currentPage() + 1;
      
      const response = await this.apiService.getPosts({
          status: 'published',
          limit: 12,
          page: nextPage,
          sort: '-publishedAt',
          dateTo: '',
          dateFrom: ''
      });
      
      const newPosts = response.posts || response.data || [];
      this.posts.update(current => [...current, ...newPosts]);
      this.currentPage.set(nextPage);
      
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      this.loadingMore.set(false);
    }
  }

  // Helper methods
  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  getAuthorName(author: string | any): string {
    if (typeof author === 'string') return 'Anonymous';
    return author?.name || 'Anonymous';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getPostTags(tags: string[] | any[]): any[] {
    if (!Array.isArray(tags)) return [];
    return tags;
  }

  getTagName(tag: string | any): string {
    if (typeof tag === 'string') return tag;
    return tag?.name || '';
  }

  getTagSlug(tag: string | any): string {
    if (typeof tag === 'string') return tag.toLowerCase().replace(/\s+/g, '-');
    return tag?.slug || tag?.name?.toLowerCase().replace(/\s+/g, '-') || '';
  }

  calculateReadingTime(content: string): number {
    if (!content) return 1;
    const words = content.split(' ').length;
    return Math.ceil(words / 200); // Average reading speed
  }
}
