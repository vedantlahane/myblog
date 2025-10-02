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
      <section class="mb-12 rounded-2xl border border-ui-border bg-ui-surface p-8 shadow-sm">
        <div class="rounded-xl border border-dashed border-ui-border/70 bg-ui-background/60 p-6">
          <div class="mb-6 text-center">
            <div class="inline-flex items-center rounded-full bg-brand-blue/10 px-4 py-1 text-xs font-mono uppercase tracking-[0.35em] text-brand-blue">
              Featured Article
            </div>
          </div>

          <article class="space-y-6 text-center">
            @if (featuredPost()?.coverImage) {
              <img
                [src]="featuredPost()?.coverImage"
                [alt]="featuredPost()?.title"
                class="mx-auto h-64 w-full max-w-4xl rounded-xl object-cover"
              >
            }

            <h1 class="text-3xl font-semibold leading-tight text-text-primary md:text-4xl">
              <a
                [routerLink]="['/post', featuredPost()?.slug]"
                class="transition-colors hover:text-brand-blue"
              >
                {{ featuredPost()?.title }}
              </a>
            </h1>

            <p class="mx-auto max-w-3xl text-lg leading-relaxed text-text-secondary">
              {{ featuredPost()?.excerpt }}
            </p>

            <div class="flex items-center justify-center gap-4 text-sm font-mono text-text-secondary">
              <span>{{ getAuthorName(featuredPost()?.author) }}</span>
              <span aria-hidden="true">•</span>
              <span>{{ formatDate(featuredPost()?.publishedAt || featuredPost()?.createdAt) }}</span>
              <span aria-hidden="true">•</span>
              <span>{{ featuredPost()?.readingTime || 5 }} min read</span>
            </div>

            <div class="flex justify-center">
              <a
                [routerLink]="['/post', featuredPost()?.slug]"
                class="btn-primary px-8 py-3 text-sm uppercase tracking-wide"
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
      <div class="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-text-primary">Latest Articles</h2>
          <p class="text-sm font-mono text-text-secondary">Fresh thoughts and insights</p>
        </div>

        <a
          routerLink="/archive"
          class="text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue/80"
        >
          View Archive →
        </a>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="animate-pulse rounded-xl border border-ui-border bg-ui-surface p-6">
              <div class="mb-4 h-40 rounded-lg bg-ui-border/50"></div>
              <div class="mb-2 h-4 rounded bg-ui-border/40"></div>
              <div class="mb-2 h-3 rounded bg-ui-border/40"></div>
              <div class="h-3 w-2/3 rounded bg-ui-border/40"></div>
            </div>
          }
        </div>
      } @else if (latestPosts().length === 0) {
        <div class="rounded-2xl border border-dashed border-ui-border p-12 text-center">
          <div class="mb-2 text-sm font-mono uppercase tracking-widest text-text-secondary">No articles yet</div>
          <p class="text-text-secondary">The first article is coming soon!</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (post of latestPosts(); track post._id) {
            <article class="blog-card group transition-shadow duration-200 hover:shadow-md focus-within:shadow-md">
              @if (post.coverImage) {
                <div class="blog-card__media">
                  <img
                    [src]="post.coverImage"
                    [alt]="post.title"
                  >
                </div>
              }

              <div class="blog-card__content">
                <h3 class="text-xl font-semibold leading-tight text-text-primary">
                  <a
                    [routerLink]="['/post', post.slug]"
                    class="transition-colors hover:text-brand-blue"
                  >
                    {{ post.title }}
                  </a>
                </h3>

                @if (post.excerpt) {
                  <p class="line-clamp-3 text-sm leading-relaxed text-text-secondary">
                    {{ post.excerpt }}
                  </p>
                }

                @if (getPostTags(post.tags).length > 0) {
                  <div class="flex flex-wrap gap-2">
                    @for (tag of getPostTags(post.tags).slice(0, 3); track tag._id || tag) {
                      <a
                        [routerLink]="['/tag', getTagSlug(tag)]"
                        class="btn-pill font-mono uppercase tracking-wide"
                      >
                        {{ getTagName(tag) }}
                      </a>
                    }
                  </div>
                }

                <div class="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <div class="flex items-center gap-2">
                    <span>{{ getAuthorName(post.author) }}</span>
                    <span aria-hidden="true">•</span>
                    <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <span>{{ post.readingTime || calculateReadingTime(post.content) }} min</span>
                    <span aria-hidden="true">•</span>
                    <div class="flex items-center gap-1 text-brand-blue">
                      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
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

        @if (hasMore()) {
          <div class="mt-12 text-center">
            <button
              (click)="loadMore()"
              [disabled]="loadingMore()"
              class="btn-secondary inline-flex px-8 py-3 text-sm uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
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
      <div class="rounded-2xl border border-ui-border bg-ui-surface p-6 text-center shadow-sm">
        <h3 class="mb-4 text-xl font-semibold text-text-primary">Popular Topics</h3>

        @if (popularTags().length > 0) {
          <div class="flex flex-wrap justify-center gap-2">
            @for (tag of popularTags(); track tag._id) {
              <a
                [routerLink]="['/tag', tag.slug]"
                class="btn-pill font-mono uppercase tracking-wide"
              >
                {{ tag.name }} ({{ tag.postCount }})
              </a>
            }
          </div>
        } @else {
          <p class="text-sm font-mono text-text-secondary">No tags yet</p>
        }
      </div>
    </aside>

    @if (!isAuthenticated()) {
      <section class="mb-12">
        <div class="rounded-2xl bg-brand-navy p-8 text-white shadow-md">
          <div class="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <h3 class="mb-3 text-2xl font-semibold">Join the Community</h3>
            <p class="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-white/80">
              Get notified when new articles are published. Join our growing community of readers and thinkers.
            </p>
            <a
              routerLink="/auth/register"
              class="btn-primary px-8 py-3 text-sm uppercase tracking-wide"
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
