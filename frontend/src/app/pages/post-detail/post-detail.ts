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
      <div class="flex justify-center items-center py-16">
        <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-sm">
          <div class="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
          Loading article...
        </div>
      </div>
    } @else if (error()) {
      <div class="text-center py-16">
        <div class="inline-block border-4 border-red-300 p-8 bg-red-50">
          <div class="text-red-600 font-mono text-sm mb-2">ARTICLE NOT FOUND</div>
          <p class="text-red-700 mb-4">{{ error() }}</p>
          <a routerLink="/" class="inline-block bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    } @else if (post()) {
      <!-- Post Header -->
      <article class="mb-12">
        <header class="mb-8 pb-8 border-b-4 border-dotted border-amber-800">
          <!-- Article Meta -->
          <div class="text-center mb-6">
            <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest">
              Article
            </div>
          </div>

          <!-- Cover Image -->
          @if (post()?.coverImage) {
            <div class="mb-8">
              <img 
                [src]="post()?.coverImage" 
                [alt]="post()?.title"
                class="w-full h-96 object-cover border-4 border-amber-700 sepia-[20%] contrast-[110%]"
              >
            </div>
          }

          <!-- Title -->
          <h1 class="font-serif text-3xl md:text-5xl font-bold text-amber-900 mb-6 leading-tight text-center">
            {{ post()?.title }}
          </h1>

          <!-- Excerpt -->
          @if (post()?.excerpt) {
            <p class="text-amber-800 text-lg md:text-xl mb-8 leading-relaxed text-center max-w-4xl mx-auto italic">
              "{{ post()?.excerpt }}"
            </p>
          }

          <!-- Author & Meta Info -->
          <div class="flex flex-col md:flex-row items-center justify-center gap-6 text-sm font-mono text-amber-600">
            <div class="flex items-center gap-3">
              @if (getAuthor()?.avatarUrl) {
                <img 
                  [src]="getAuthor()?.avatarUrl" 
                  [alt]="getAuthor()?.name"
                  class="w-12 h-12 rounded-full border-2 border-amber-400"
                >
              } @else {
                <div class="w-12 h-12 bg-amber-200 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-800">
                  {{ getAuthorInitials() }}
                </div>
              }
              <div>
                <div class="font-bold text-amber-800">{{ getAuthor()?.name || 'Anonymous' }}</div>
                <div class="text-xs">{{ formatDate(post()?.publishedAt || post()?.createdAt || '') }}</div>
              </div>
            </div>

            <div class="flex items-center gap-4 text-xs">
              <span>{{ post()?.readingTime || calculateReadingTime(post()?.content || '') }} min read</span>
              <span>•</span>
              <span>{{ post()?.viewCount || 0 }} views</span>
            </div>
          </div>

          <!-- Tags -->
          @if (getPostTags().length > 0) {
            <div class="flex flex-wrap gap-2 justify-center mt-6">
              @for (tag of getPostTags(); track getTagId(tag)) {
                <a 
                  [routerLink]="['/tag', getTagSlug(tag)]"
                  class="inline-block bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono uppercase tracking-wide hover:bg-amber-300 transition-colors border border-amber-400 hover:border-amber-500"
                >
                  {{ getTagName(tag) }}
                </a>
              }
            </div>
          }
        </header>

        <!-- Post Content -->
        <div class="max-w-4xl mx-auto">
          <div 
            class="prose prose-lg prose-amber max-w-none leading-relaxed text-amber-900"
            [innerHTML]="post()?.content"
          ></div>
        </div>

        <!-- Post Actions -->
        <footer class="mt-12 pt-8 border-t-2 border-dotted border-amber-300">
          <div class="flex items-center justify-center gap-6">
            <!-- Like Button -->
            <button 
              (click)="toggleLike()"
              [disabled]="!isAuthenticated()"
              [class]="likeButtonClass()"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
              </svg>
              {{ post()?.likeCount || 0 }} {{ (post()?.likeCount || 0) === 1 ? 'Like' : 'Likes' }}
            </button>

            <!-- Bookmark Button -->
            @if (isAuthenticated()) {
              <button 
                (click)="toggleBookmark()"
                [class]="bookmarkButtonClass()"
              >
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                </svg>
                {{ isBookmarked() ? 'Bookmarked' : 'Bookmark' }}
              </button>
            }

            <!-- Share Button -->
            <button 
              (click)="sharePost()"
              class="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 font-mono text-sm hover:bg-amber-200 transition-colors border border-amber-300 hover:border-amber-400"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              Share
            </button>
          </div>

          @if (!isAuthenticated()) {
            <p class="text-center text-amber-600 text-sm font-mono mt-4">
              <a routerLink="/auth/login" class="underline hover:text-amber-800">Login</a> to like and bookmark articles
            </p>
          }
        </footer>
      </article>

      <!-- Related Posts -->
      @if (relatedPosts().length > 0) {
        <section class="mb-12 bg-amber-100 border-4 border-amber-800 p-6">
          <h3 class="font-serif text-2xl font-bold text-amber-900 mb-6 text-center">Related Articles</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (relatedPost of relatedPosts().slice(0, 3); track relatedPost._id) {
              <article class="bg-amber-50 border-2 border-amber-200 p-4 hover:border-amber-400 transition-colors">
                <h4 class="font-serif font-bold text-amber-900 mb-2 line-clamp-2">
                  <a [routerLink]="['/post', relatedPost.slug]" class="hover:text-amber-700">
                    {{ relatedPost.title }}
                  </a>
                </h4>
                
                @if (relatedPost.excerpt) {
                  <p class="text-amber-700 text-sm mb-3 line-clamp-2">
                    {{ relatedPost.excerpt }}
                  </p>
                }
                
                <div class="text-xs font-mono text-amber-600">
                  {{ formatDate(relatedPost.publishedAt || relatedPost.createdAt) }}
                </div>
              </article>
            }
          </div>
        </section>
      }

      <!-- Comments Section -->
      <section class="mb-12">
        <div class="border-t-4 border-amber-900 pt-8">
          <h3 class="font-serif text-2xl font-bold text-amber-900 mb-6 text-center">
            Comments ({{ comments().length }})
          </h3>

          <!-- Comment Form -->
          @if (isAuthenticated()) {
            <div class="bg-amber-50 border-2 border-amber-200 p-6 mb-8">
              <form [formGroup]="commentForm" (ngSubmit)="submitComment()">
                <div class="mb-4">
                  <label class="block text-amber-800 font-mono text-sm mb-2">Add your comment</label>
                  <textarea 
                    formControlName="content"
                    rows="4"
                    placeholder="Share your thoughts..."
                    class="w-full p-3 border-2 border-amber-300 focus:border-amber-500 focus:outline-none bg-white font-mono text-sm"
                  ></textarea>
                  
                  @if (commentForm.get('content')?.invalid && commentForm.get('content')?.touched) {
                    <p class="text-red-600 text-xs font-mono mt-1">Comment is required</p>
                  }
                </div>
                
                <div class="flex justify-end">
                  <button 
                    type="submit"
                    [disabled]="commentForm.invalid || submittingComment()"
                    class="bg-amber-800 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 hover:border-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div class="text-center mb-8">
              <p class="text-amber-600 font-mono text-sm mb-4">
                <a routerLink="/auth/login" class="underline hover:text-amber-800">Login</a> to join the discussion
              </p>
            </div>
          }

          <!-- Comments List -->
          @if (loadingComments()) {
            <div class="text-center py-8">
              <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-sm">
                <div class="w-5 h-5 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                Loading comments...
              </div>
            </div>
          } @else if (comments().length === 0) {
            <div class="text-center py-12">
              <div class="inline-block border-2 border-dotted border-amber-300 p-6">
                <div class="text-amber-600 font-mono text-sm mb-2">NO COMMENTS YET</div>
                <p class="text-amber-700">Be the first to share your thoughts!</p>
              </div>
            </div>
          } @else {
            <div class="space-y-6">
              @for (comment of comments(); track comment._id) {
                <div class="bg-amber-50 border-l-4 border-amber-400 p-6">
                  <div class="flex items-start gap-4">
                    @if (getCommentAuthor(comment)?.avatarUrl) {
                      <img 
                        [src]="getCommentAuthor(comment)?.avatarUrl" 
                        [alt]="getCommentAuthor(comment)?.name"
                        class="w-10 h-10 rounded-full border-2 border-amber-300"
                      >
                    } @else {
                      <div class="w-10 h-10 bg-amber-200 border-2 border-amber-300 rounded-full flex items-center justify-center font-bold text-amber-800 text-sm">
                        {{ getCommentAuthorInitials(comment) }}
                      </div>
                    }
                    
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <span class="font-bold text-amber-900">{{ getCommentAuthor(comment)?.name || 'Anonymous' }}</span>
                        <span class="text-xs font-mono text-amber-600">{{ formatDate(comment.createdAt) }}</span>
                        @if (comment.isEdited) {
                          <span class="text-xs font-mono text-amber-500">(edited)</span>
                        }
                      </div>
                      
                      <p class="text-amber-800 leading-relaxed mb-3">{{ comment.content }}</p>
                      
                      <div class="flex items-center gap-4 text-xs font-mono text-amber-600">
                        <button 
                          (click)="toggleCommentLike(comment._id)"
                          [disabled]="!isAuthenticated()"
                          class="hover:text-amber-800 transition-colors disabled:cursor-not-allowed"
                        >
                          <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
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

    /* Custom prose styles for content */
    .prose {
      font-family: 'Georgia', serif;
    }

    .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
      font-family: 'Georgia', serif;
      font-weight: 700;
      color: #92400e;
      margin-top: 2em;
      margin-bottom: 1em;
    }

    .prose p {
      margin-bottom: 1.5em;
      line-height: 1.8;
    }

    .prose blockquote {
      border-left: 4px solid #d97706;
      background: #fef3cd;
      padding: 1rem 1.5rem;
      margin: 2rem 0;
      font-style: italic;
    }

    .prose code {
      background: #fef3cd;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-family: 'Monaco', monospace;
      font-size: 0.875em;
    }

    .prose pre {
      background: #92400e;
      color: #fef3cd;
      padding: 1.5rem;
      overflow-x: auto;
      margin: 2rem 0;
    }

    .prose a {
      color: #b45309;
      text-decoration: underline;
    }

    .prose a:hover {
      color: #92400e;
    }

    .prose ul, .prose ol {
      padding-left: 2rem;
      margin-bottom: 1.5em;
    }

    .prose li {
      margin-bottom: 0.5em;
    }

    /* Vintage paper texture */
    article {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.02) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.02) 0%, transparent 50%);
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
    const baseClass = "inline-flex items-center px-4 py-2 font-mono text-sm transition-colors border";
    return this.isLiked() 
      ? `${baseClass} bg-red-100 text-red-800 border-red-300 hover:bg-red-200 hover:border-red-400`
      : `${baseClass} bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 hover:border-amber-400`;
  });

  bookmarkButtonClass = computed(() => {
    const baseClass = "inline-flex items-center px-4 py-2 font-mono text-sm transition-colors border";
    return this.isBookmarked() 
      ? `${baseClass} bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 hover:border-blue-400`
      : `${baseClass} bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 hover:border-amber-400`;
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
