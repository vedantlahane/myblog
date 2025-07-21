import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post, User, Tag } from '../../../types/api';
import { Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      @if (isLoading()) {
        <!-- Loading State -->
        <div class="max-w-4xl mx-auto px-4 py-12">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-pulse">
            <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div class="h-64 bg-gray-200 rounded mb-6"></div>
            <div class="space-y-3">
              @for (item of [1,2,3,4,5]; track item) {
                <div class="h-4 bg-gray-200 rounded"></div>
              }
            </div>
          </div>
        </div>
      } @else if (post()) {
        <!-- Article Content -->
        <article class="max-w-4xl mx-auto px-4 py-12">
          <!-- Article Header -->
          <header class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <!-- Tags -->
            @if (post()!.tags && post()!.tags.length > 0) {
              <div class="flex flex-wrap gap-2 mb-4">
                @for (tag of post()!.tags; track tag) {
                  <a 
                    [routerLink]="['/tag', typeof tag === 'string' ? tag : tag.slug]"
                    class="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors">
                    {{ typeof tag === 'string' ? tag : tag.name }}
                  </a>
                }
              </div>
            }

            <!-- Title -->
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {{ post()!.title }}
            </h1>

            <!-- Meta Info -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <!-- Author Info -->
              <div class="flex items-center gap-4">
                <img 
                  [src]="getAuthorAvatar(post()!.author)" 
                  [alt]="getAuthorName(post()!.author)"
                  class="w-12 h-12 rounded-full">
                <div>
                  <p class="font-semibold text-gray-900">{{ getAuthorName(post()!.author) }}</p>
                  <p class="text-sm text-gray-500">
                    Published {{ formatDate(post()!.publishedAt || post()!.createdAt) }}
                  </p>
                </div>
              </div>

              <!-- Engagement Stats -->
              <div class="flex items-center gap-6 text-gray-500">
                <button 
                  (click)="toggleLike()"
                  [disabled]="isUpdatingLike()"
                  class="flex items-center gap-2 hover:text-amber-600 transition-colors"
                  [class.text-red-500]="isLiked()">
                  <svg class="w-5 h-5" [class.fill-current]="isLiked()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  {{ post()!.likeCount || 0 }}
                </button>
                <span class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  {{ post()!.commentCount || 0 }}
                </span>
              </div>
            </div>
          </header>

          <!-- Cover Image -->
          @if (post()!.coverImage) {
            <div class="mb-8 aspect-[16/9] rounded-xl overflow-hidden">
              <img 
                [src]="post()!.coverImage" 
                [alt]="post()!.title"
                class="w-full h-full object-cover">
            </div>
          }

          <!-- Article Content -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div class="prose prose-lg prose-gray max-w-none">
              <div [innerHTML]="getFormattedContent(post()!.content)" class="whitespace-pre-wrap leading-relaxed text-gray-800">
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <section class="mt-12">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">
                Comments ({{ post()!.commentCount || 0 }})
              </h2>
              
              @if (isAuthenticated()) {
                <!-- Comment Form -->
                <div class="mb-8 p-4 bg-gray-50 rounded-lg">
                  <p class="text-gray-600">Comment functionality will be implemented soon.</p>
                </div>
              } @else {
                <div class="text-center py-8">
                  <p class="text-gray-600 mb-4">
                    <a routerLink="/login" class="text-amber-600 hover:text-amber-700 font-semibold">Sign in</a> 
                    to join the discussion.
                  </p>
                </div>
              }
            </div>
          </section>
        </article>
      } @else if (errorMessage()) {
        <!-- Error State -->
        <div class="max-w-4xl mx-auto px-4 py-12">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
            <p class="text-gray-600 mb-6">{{ errorMessage() }}</p>
            <a routerLink="/" class="text-amber-600 hover:text-amber-700 font-semibold">
              ← Back to Home
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class PostDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private destroy$ = new Subject<void>();

  // State signals
  post = signal<Post | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isUpdatingLike = signal(false);

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadPost(slug);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPost(slug: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.apiService.getPost(slug).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.errorMessage.set(error.message || 'Failed to load post.');
        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(post => {
      this.post.set(post);
    });
  }

  toggleLike(): void {
    const currentPost = this.post();
    if (!currentPost || this.isUpdatingLike() || !this.isAuthenticated()) {
      return;
    }

    this.isUpdatingLike.set(true);
    const isCurrentlyLiked = this.isLiked();

    const likeAction = isCurrentlyLiked 
      ? this.apiService.unlikePost(currentPost._id)
      : this.apiService.likePost(currentPost._id);

    likeAction.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isUpdatingLike.set(false))
    ).subscribe({
      next: (updatedPost) => {
        this.post.set(updatedPost);
      },
      error: (error) => {
        console.error('Failed to toggle like:', error);
      }
    });
  }

  isLiked(): boolean {
    const currentPost = this.post();
    if (!currentPost || !this.isAuthenticated()) {
      return false;
    }
    // This would need to be implemented based on your backend response
    // For now, returning false
    return false;
  }

  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
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
      month: 'long', 
      day: 'numeric' 
    });
  }

  getFormattedContent(content: string): string {
    // Basic content formatting - could be enhanced with a markdown parser
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/^\s*/, '<p>')
      .replace(/\s*$/, '</p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
}
