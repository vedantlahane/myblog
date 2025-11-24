import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Post, Comment, User, Tag, CreateCommentRequest } from '../../../types/api';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-16">
        <div class="inline-flex items-center gap-3 font-mono text-sm text-brand-blue">
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent"></div>
          Loading article...
        </div>
      </div>
    } @else if (error()) {
      <div class="py-16 text-center">
        <div class="inline-block rounded-2xl border border-feedback-red bg-feedback-red/10 px-8 py-6">
          <div class="mb-2 font-mono text-sm uppercase tracking-wide text-feedback-red">ARTICLE NOT FOUND</div>
          <p class="mb-4 text-text-secondary">{{ error() }}</p>
          <a routerLink="/" class="btn-primary px-6 py-2 text-sm uppercase tracking-wide">
            Back to Home
          </a>
        </div>
      </div>
    } @else if (post()) {
      <article class="mb-12 rounded-3xl border border-ui-border bg-ui-surface p-8 shadow-sm">
        <header class="mb-8 border-b border-ui-border pb-8">
          <div class="mb-6 text-center">
            <div class="inline-flex items-center rounded-full bg-brand-blue/10 px-4 py-1 text-xs font-mono uppercase tracking-[0.35em] text-brand-blue">
              Article
            </div>
          </div>

          @if (post()?.coverImage) {
            <div class="mb-8">
              <img
                [src]="post()?.coverImage"
                [alt]="post()?.title"
                class="h-96 w-full rounded-2xl object-cover"
              >
            </div>
          }

          <h1 class="mb-6 text-center text-3xl font-semibold leading-tight text-text-primary md:text-5xl">
            {{ post()?.title }}
          </h1>

          @if (post()?.excerpt) {
            <p class="mx-auto mb-8 max-w-4xl text-center text-lg italic leading-relaxed text-text-secondary">
              "{{ post()?.excerpt }}"
            </p>
          }

          <div class="flex flex-col items-center justify-center gap-6 text-sm font-mono text-text-secondary md:flex-row">
            <div class="flex items-center gap-3">
              @if (getAuthor()?.avatarUrl) {
                <img
                  [src]="getAuthor()?.avatarUrl"
                  [alt]="getAuthor()?.name"
                  class="h-12 w-12 rounded-full border border-ui-border object-cover"
                >
              } @else {
                <div class="flex h-12 w-12 items-center justify-center rounded-full border border-ui-border bg-ui-background text-sm font-semibold text-text-primary">
                  {{ getAuthorInitials() }}
                </div>
              }
              <div>
                <div class="font-semibold text-text-primary">{{ getAuthor()?.name || 'Anonymous' }}</div>
                <div class="text-xs text-text-secondary/80">{{ formatDate(post()?.publishedAt || post()?.createdAt || '') }}</div>
              </div>
            </div>

            <div class="flex items-center gap-4 text-xs">
              <span>{{ post()?.readingTime || calculateReadingTime(post()?.content || '') }} min read</span>
              <span aria-hidden="true">•</span>
              <span>{{ post()?.viewCount || 0 }} views</span>
            </div>
          </div>

          @if (getPostTags().length > 0) {
            <div class="mt-6 flex flex-wrap justify-center gap-2">
              @for (tag of getPostTags(); track getTagId(tag)) {
                <a
                  [routerLink]="['/tag', getTagSlug(tag)]"
                  class="btn-pill font-mono uppercase tracking-wide"
                >
                  {{ getTagName(tag) }}
                </a>
              }
            </div>
          }
        </header>

        <div class="mx-auto max-w-4xl">
          <div
            class="prose prose-lg max-w-none text-text-primary"
            [innerHTML]="post()?.content"
          ></div>
        </div>

        <footer class="mt-12 border-t border-ui-border pt-8">
          <div class="flex flex-wrap items-center justify-center gap-4">
            <button
              (click)="toggleLike()"
              [disabled]="!isAuthenticated()"
              [class]="likeButtonClass()"
            >
              <svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
              </svg>
              {{ post()?.likeCount || 0 }} {{ (post()?.likeCount || 0) === 1 ? 'Like' : 'Likes' }}
            </button>

            @if (isAuthenticated()) {
              <button
                (click)="toggleBookmark()"
                [class]="bookmarkButtonClass()"
              >
                <svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                </svg>
                {{ isBookmarked() ? 'Bookmarked' : 'Bookmark' }}
              </button>
            }

            <button
              (click)="sharePost()"
              class="btn-secondary inline-flex items-center gap-2 text-sm"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              Share
            </button>
          </div>

          @if (!isAuthenticated()) {
            <p class="mt-4 text-center text-sm font-mono text-text-secondary">
              <a routerLink="/auth/login" class="font-semibold text-brand-blue hover:text-brand-blue/80">Login</a> to like and bookmark articles
            </p>
          }
        </footer>
      </article>

      @if (relatedPosts().length > 0) {
        <section class="mb-12 rounded-3xl border border-ui-border bg-ui-surface p-6 shadow-sm">
          <h3 class="mb-6 text-center text-2xl font-semibold text-text-primary">Related Articles</h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            @for (relatedPost of relatedPosts().slice(0, 3); track relatedPost._id) {
              <article class="rounded-2xl border border-ui-border bg-ui-background p-4 shadow-sm transition-shadow hover:shadow-md">
                <h4 class="mb-2 line-clamp-2 text-lg font-semibold text-text-primary">
                  <a [routerLink]="['/post', relatedPost.slug]" class="transition-colors hover:text-brand-blue">
                    {{ relatedPost.title }}
                  </a>
                </h4>
                @if (relatedPost.excerpt) {
                  <p class="mb-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                    {{ relatedPost.excerpt }}
                  </p>
                }
                <div class="text-xs font-mono text-text-secondary/80">
                  {{ formatDate(relatedPost.publishedAt || relatedPost.createdAt) }}
                </div>
              </article>
            }
          </div>
        </section>
      }

      <section class="mb-12">
        <div class="rounded-3xl border border-ui-border bg-ui-surface p-8 shadow-sm">
          <h3 class="mb-6 text-center text-2xl font-semibold text-text-primary">
            Comments ({{ comments().length }})
          </h3>

          @if (isAuthenticated()) {
            <div class="mb-8 rounded-2xl border border-ui-border bg-ui-background p-6">
              <form [formGroup]="commentForm" (ngSubmit)="submitComment()">
                <div class="mb-4">
                  <label class="mb-2 block text-sm font-mono text-text-secondary">Add your comment</label>
                  <textarea
                    formControlName="content"
                    rows="4"
                    placeholder="Share your thoughts..."
                    class="w-full rounded-lg border border-ui-border bg-white p-3 text-sm font-mono text-text-primary transition-colors focus:border-brand-blue focus:outline-none"
                  ></textarea>
                  @if (commentForm.get('content')?.invalid && commentForm.get('content')?.touched) {
                    <p class="mt-1 text-xs font-mono text-feedback-red">Comment is required</p>
                  }
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    [disabled]="commentForm.invalid || submittingComment()"
                    class="btn-primary px-6 py-2 text-sm uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    @if (submittingComment()) {
                      Posting...
                    } @else {
                      Post Comment
                    }
                  </button>
                </div>
              </form>
            </div>
          } @else {
            <div class="mb-8 text-center">
              <p class="text-sm font-mono text-text-secondary">
                <a routerLink="/auth/login" class="font-semibold text-brand-blue hover:text-brand-blue/80">Login</a> to join the discussion
              </p>
            </div>
          }

          @if (loadingComments()) {
            <div class="py-8 text-center">
              <div class="inline-flex items-center gap-3 font-mono text-sm text-brand-blue">
                <div class="h-5 w-5 animate-spin rounded-full border-2 border-brand-blue border-t-transparent"></div>
                Loading comments...
              </div>
            </div>
          } @else if (comments().length === 0) {
            <div class="py-12 text-center">
              <div class="inline-block rounded-2xl border border-ui-border bg-ui-background px-6 py-8">
                <div class="mb-2 font-mono text-sm uppercase tracking-wide text-text-secondary">No comments yet</div>
                <p class="text-text-secondary">Be the first to share your thoughts!</p>
              </div>
            </div>
          } @else {
            <div class="space-y-6">
              @for (comment of comments(); track comment._id) {
                <div class="rounded-2xl border border-ui-border bg-ui-background p-6">
                  <div class="flex items-start gap-4">
                    @if (getCommentAuthor(comment)?.avatarUrl) {
                      <img
                        [src]="getCommentAuthor(comment)?.avatarUrl"
                        [alt]="getCommentAuthor(comment)?.name"
                        class="h-10 w-10 rounded-full border border-ui-border object-cover"
                      >
                    } @else {
                      <div class="flex h-10 w-10 items-center justify-center rounded-full border border-ui-border bg-ui-surface text-sm font-semibold text-text-primary">
                        {{ getCommentAuthorInitials(comment) }}
                      </div>
                    }

                    <div class="flex-1">
                      <div class="mb-2 flex items-center gap-3">
                        <span class="font-semibold text-text-primary">{{ getCommentAuthor(comment)?.name || 'Anonymous' }}</span>
                        <span class="text-xs font-mono text-text-secondary/80">{{ formatDate(comment.createdAt) }}</span>
                        @if (comment.isEdited) {
                          <span class="text-xs font-mono text-text-secondary/70">(edited)</span>
                        }
                      </div>

                      <p class="mb-3 leading-relaxed text-text-secondary">{{ comment.content }}</p>

                      <div class="flex items-center gap-4 text-xs font-mono text-text-secondary">
                        <button
                          (click)="toggleCommentLike(comment._id)"
                          [disabled]="!isAuthenticated()"
                          class="inline-flex items-center gap-1 text-text-secondary transition-colors hover:text-brand-blue disabled:cursor-not-allowed"
                        >
                          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                          </svg>
                          {{ comment.likeCount || 0 }}
                        </button>

                        @if (comment.replies && comment.replies.length > 0) {
                          <span>{{ comment.replies.length }} replies</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [`
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
  `]
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Reactive Signals
  loading = signal(false);
  loadingComments = signal(false);
  submittingComment = signal(false);
  error = signal<string>('');
  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  relatedPosts = signal<Post[]>([]);
  isBookmarked = signal(false);
  isLiked = signal(false);

  // Comment Form
  commentForm = new FormGroup({
    content: new FormControl('', [Validators.required, Validators.minLength(5)])
  });

  // Computed values
  likeButtonClass = computed(() => {
    const baseClass = 'btn-secondary inline-flex items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50';
    return this.isLiked()
      ? `${baseClass} border-feedback-red text-feedback-red bg-feedback-red/10 hover:bg-feedback-red/20`
      : baseClass;
  });

  bookmarkButtonClass = computed(() => {
    const baseClass = 'btn-secondary inline-flex items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50';
    return this.isBookmarked()
      ? `${baseClass} border-brand-blue text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20`
      : baseClass;
  });

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      await this.loadPost(slug);
    }
  }

  private async loadPost(slug: string) {
    try {
      this.loading.set(true);
      this.error.set('');

      const post = await this.apiService.getPostBySlug(slug);
      this.post.set(post);

      // Load additional data
      await Promise.all([
        this.loadComments(post._id),
        this.loadRelatedPosts(post._id),
        this.checkBookmarkStatus(post._id),
        this.checkLikeStatus(post._id)
      ]);

    } catch (error) {
      console.error('Failed to load post:', error);
      this.error.set('Article not found or failed to load');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadComments(postId: string) {
    try {
      this.loadingComments.set(true);
      const comments = await this.apiService.getCommentsByPost(postId);
      this.comments.set(comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      this.loadingComments.set(false);
    }
  }

  private async loadRelatedPosts(postId: string) {
    try {
      const related = await this.apiService.getRelatedPosts(postId);
      this.relatedPosts.set(related);
    } catch (error) {
      console.error('Failed to load related posts:', error);
    }
  }

  private async checkBookmarkStatus(postId: string) {
    if (!this.isAuthenticated()) return;

    try {
      const status = await this.apiService.checkBookmarkStatus(postId);
      this.isBookmarked.set(status.isBookmarked);
    } catch (error) {
      console.error('Failed to check bookmark status:', error);
    }
  }

  private checkLikeStatus(postId: string) {
    if (!this.isAuthenticated()) return;
    
    const currentUser = this.apiService.getToken();
    if (currentUser && this.post()?.likes) {
      // This would need user ID, simplified for now
      this.isLiked.set(false);
    }
  }

  async toggleLike() {
    if (!this.isAuthenticated() || !this.post()) return;

    try {
      const postId = this.post()!._id;
      
      if (this.isLiked()) {
        const result = await this.apiService.unlikePost(postId);
        this.post.update(current => current ? {...current, likeCount: result.likes} : current);
        this.isLiked.set(false);
      } else {
        const result = await this.apiService.likePost(postId);
        this.post.update(current => current ? {...current, likeCount: result.likes} : current);
        this.isLiked.set(true);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  }

  async toggleBookmark() {
    if (!this.isAuthenticated() || !this.post()) return;

    try {
      const postId = this.post()!._id;
      
      if (this.isBookmarked()) {
        await this.apiService.removeBookmarkByPost(postId);
        this.isBookmarked.set(false);
      } else {
        await this.apiService.createBookmark({ postId });
        this.isBookmarked.set(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  }

  async submitComment() {
    if (this.commentForm.invalid || !this.post()) return;

    try {
      this.submittingComment.set(true);
      
      const commentData: CreateCommentRequest = {
        content: this.commentForm.value.content!,
        post: this.post()!._id
      };

      const newComment = await this.apiService.createComment(commentData);
      this.comments.update(current => [newComment, ...current]);
      this.commentForm.reset();

    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      this.submittingComment.set(false);
    }
  }

  async toggleCommentLike(commentId: string) {
    if (!this.isAuthenticated()) return;

    try {
      // Simple implementation - would need to track liked comments
      await this.apiService.likeComment(commentId);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  }

  sharePost() {
    if (navigator.share && this.post()) {
      navigator.share({
        title: this.post()!.title,
        text: this.post()!.excerpt || '',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Could add a toast notification here
    }
  }

  // Helper methods
  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  getAuthor(): User | null {
    const author = this.post()?.author;
    return typeof author === 'object' ? author : null;
  }

  getAuthorInitials(): string {
    const author = this.getAuthor();
    if (!author?.name) return 'A';
    return author.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getPostTags(): any[] {
    const tags = this.post()?.tags;
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

  getCommentAuthor(comment: Comment): User | null {
    return typeof comment.author === 'object' ? comment.author : null;
  }

  getCommentAuthorInitials(comment: Comment): string {
    const author = this.getCommentAuthor(comment);
    if (!author?.name) return 'A';
    return author.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  calculateReadingTime(content: string): number {
    const words = content.split(' ').length;
    return Math.ceil(words / 200);
  }
}
