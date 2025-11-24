import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post, Tag, PostsResponse } from '../../../types/api';
import { BlogCardComponent } from '../../ui/common/blog-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, BlogCardComponent],
  template: `
    <!-- Hero Section with Featured Post -->
    @if (featuredPost()) {
      <section class="mb-12 rounded-2xl border border-border-default overflow-hidden relative shadow-card dark:border-border-dark dark:bg-surface-dark">
        <div class="rounded-xl border border-dashed border-border-default/70 bg-surface-muted/80 p-6 dark:border-white/10 dark:bg-surface-dark">
          <div class="mb-6 text-center">
            <div class="inline-flex items-center rounded-full bg-brand-blue/10 px-4 py-1 text-xs font-mono uppercase tracking-[0.35em] text-brand-blue">
              Featured Article
            </div>
            @if (totalPosts() > 0) {
              <div class="mt-3 inline-flex items-center gap-2 rounded-full border border-border-default/60 bg-surface px-5 py-2 text-[0.65rem] font-mono uppercase tracking-[0.4em] text-text-secondary transition-colors duration-200 dark:border-white/10 dark:bg-surface-dark">
                <span class="inline-flex h-2 w-2 rounded-full bg-brand-blue"></span>
                {{ totalPosts() }} Published Posts
              </div>
            }
          </div>

          <article class="space-y-6 text-center">
            @if (featuredPost()?.coverImage) {
              <div class="relative h-[420px] w-full rounded-xl overflow-hidden">
                <img
                  [src]="featuredPost()?.coverImage"
                  [alt]="featuredPost()?.title"
                  class="absolute inset-0 h-full w-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-105"
                >
                <div class="absolute inset-0 hero-overlay"></div>
                <div class="absolute bottom-6 left-6 right-6 z-10 rounded-lg bg-gradient-to-r from-black/60 via-transparent to-black/20 p-6 text-left">
                  <h1 class="text-3xl font-semibold leading-tight text-white transition-colors duration-200 md:text-4xl">
                    <a
                      [routerLink]="['/post', featuredPost()?.slug]"
                      class="transition-colors duration-200 hover:text-brand-blue"
                    >
                      {{ featuredPost()?.title }}
                    </a>
                  </h1>

                  <p class="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary/80">
                    {{ featuredPost()?.excerpt }}
                  </p>

                  <div class="mt-4 flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em] text-text-subtle">
                    <span>{{ getAuthorName(featuredPost()?.author) }}</span>
                    <span aria-hidden="true">•</span>
                    <span>{{ formatDate(featuredPost()?.publishedAt || featuredPost()?.createdAt) }}</span>
                    <span aria-hidden="true">•</span>
                    <span>{{ featuredPost()?.readingTime || 5 }} min read</span>
                  </div>

                  <div class="mt-4">
                    <a
                      [routerLink]="['/post', featuredPost()?.slug]"
                      class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:bg-brand-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                    >
                      Read Full Article
                    </a>
                  </div>
                </div>
              </div>
            }

            <h1 class="text-3xl font-semibold leading-tight text-text-primary transition-colors duration-200 dark:text-white md:text-4xl">
              <a
                [routerLink]="['/post', featuredPost()?.slug]"
                class="transition-colors duration-200 hover:text-brand-blue"
              >
                {{ featuredPost()?.title }}
              </a>
            </h1>

            <p class="mx-auto max-w-3xl text-lg leading-relaxed text-text-secondary dark:text-slate-300">
              {{ featuredPost()?.excerpt }}
            </p>

            <div class="flex items-center justify-center gap-4 text-sm font-mono uppercase tracking-[0.2em] text-text-subtle dark:text-slate-400">
              <span>{{ getAuthorName(featuredPost()?.author) }}</span>
              <span aria-hidden="true">•</span>
              <span>{{ formatDate(featuredPost()?.publishedAt || featuredPost()?.createdAt) }}</span>
              <span aria-hidden="true">•</span>
              <span>{{ featuredPost()?.readingTime || 5 }} min read</span>
            </div>

            <div class="flex justify-center">
              <a
                [routerLink]="['/post', featuredPost()?.slug]"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:bg-brand-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
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
          @if (totalPosts() > 0) {
            <p class="text-sm font-mono text-text-secondary">{{ totalPosts() }} published posts and counting</p>
          } @else {
            <p class="text-sm font-mono text-text-secondary">Fresh thoughts and insights</p>
          }
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
            <div class="animate-pulse rounded-xl border border-border-default bg-surface p-6 dark:border-border-dark dark:bg-surface-dark">
              <div class="mb-4 h-40 rounded-lg bg-border-default/40 dark:bg-white/10"></div>
              <div class="mb-2 h-4 rounded bg-border-default/30 dark:bg-white/10"></div>
              <div class="mb-2 h-3 rounded bg-border-default/30 dark:bg-white/10"></div>
              <div class="h-3 w-2/3 rounded bg-border-default/30 dark:bg-white/10"></div>
            </div>
          }
        </div>
      } @else if (latestPosts().length === 0) {
        <div class="rounded-2xl border border-dashed border-border-default p-12 text-center dark:border-white/10">
          <div class="mb-2 text-sm font-mono uppercase tracking-[0.3em] text-text-subtle dark:text-slate-400">No articles yet</div>
          <p class="text-text-secondary dark:text-slate-300">The first article is coming soon!</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (post of latestPosts(); track post._id) {
            <app-blog-card
              [post]="post"
              [showEngagement]="true"
              [priorityImage]="false"
            ></app-blog-card>
          }
        </div>

        @if (hasMore()) {
          <div class="mt-12 text-center">
            <button
              (click)="loadMore()"
              [disabled]="loadingMore()"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-border-default px-8 py-3 text-sm font-semibold uppercase tracking-wide text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-white"
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
      <div class="rounded-2xl border border-border-default bg-surface p-6 text-center shadow-card dark:border-border-dark dark:bg-surface-dark">
        <h3 class="mb-4 text-xl font-semibold text-text-primary">Popular Topics</h3>

        @if (popularTags().length > 0) {
          <div class="flex flex-wrap justify-center gap-2">
            @for (tag of popularTags(); track tag._id) {
              <a
                [routerLink]="['/tag', tag.slug]"
                class="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-muted px-3 py-1 text-xs font-mono uppercase tracking-[0.3em] text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-brand-accent"
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
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-semibold uppercase tracking-wide text-brand-navy transition-all duration-200 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Join Xandar
            </a>
          </div>
        </div>
      </section>
    }
  `,
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
  totalPosts = signal(0);
  
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
      
      const posts = response.posts || response.data || [];
      this.posts.set(posts);
      this.totalPages.set(response.totalPages || 1);
      this.totalPosts.set(response.totalPosts || posts.length);
      
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
      this.totalPosts.set(response.totalPosts || this.posts().length);
      
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
