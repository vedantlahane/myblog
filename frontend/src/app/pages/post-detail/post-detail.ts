import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { ApiService } from '../../services/api';
import type { Post, User, Comment, Tag } from '../../../types/api';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject, forkJoin } from 'rxjs';

interface LoadingState {
  post: boolean;
  related: boolean;
  comments: boolean;
  like: boolean;
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-detail.html'
})
export class PostDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private destroy$ = new Subject<void>();
  
  // State management with signals
  post = signal<Post | null>(null);
  relatedPosts = signal<Post[]>([]);
  comments = signal<Comment[]>([]);
  loadingState = signal<LoadingState>({
    post: false,
    related: false,
    comments: false,
    like: false
  });
  error = signal<string | null>(null);
  isLiked = signal(false);

  // Computed properties
  loading = computed(() => this.loadingState().post);
  authorName = computed(() => {
    const currentPost = this.post();
    if (!currentPost) return '';
    if (typeof currentPost.author === 'string') return 'Unknown Author';
    return (currentPost.author as User).name;
  });

  authorAvatar = computed(() => {
    const currentPost = this.post();
    if (!currentPost) return '';
    if (typeof currentPost.author === 'string') return 'assets/default-avatar.png';
    return (currentPost.author as User).avatarUrl || 'assets/default-avatar.png';
  });

  readingTime = computed(() => {
    const currentPost = this.post();
    if (!currentPost) return 0;
    return currentPost.readingTime || Math.ceil(currentPost.content.split(' ').length / 200);
  });

  tagsList = computed(() => this.post()?.tags || []);

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

  loadPost(slug: string): void {
    this.setLoadingState({ post: true });
    this.error.set(null);
    
    this.apiService.getPostBySlug(slug)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading post:', err);
          this.error.set('Failed to load post. Please try again.');
          return of(null);
        }),
        finalize(() => this.setLoadingState({ post: false }))
      )
      .subscribe(post => {
        if (post) {
          this.post.set(post);
          this.checkIfLiked();
          this.loadAdditionalData(post._id);
        }
      });
  }

  private loadAdditionalData(postId: string): void {
    // Load related posts and comments in parallel
    forkJoin({
      related: this.apiService.getRelatedPosts(postId).pipe(
        catchError(err => {
          console.error('Error loading related posts:', err);
          return of([]);
        })
      ),
      comments: this.apiService.getComments({ post: postId }).pipe(
        catchError(err => {
          console.error('Error loading comments:', err);
          return of([]);
        })
      )
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe(({ related, comments }) => {
      this.relatedPosts.set(related.slice(0, 3));
      this.comments.set(comments);
    });
  }

  private checkIfLiked(): void {
    if (!this.isBrowser) return;
    
    const currentUser = localStorage.getItem('currentUser');
    const currentPost = this.post();
    
    if (currentUser && currentPost) {
      try {
        const user = JSON.parse(currentUser);
        this.isLiked.set(currentPost.likes?.includes(user._id) || false);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }

  toggleLike(): void {
    const currentPost = this.post();
    if (!currentPost) return;
    
    this.setLoadingState({ like: true });
    
    const likeAction = this.isLiked() 
      ? this.apiService.unlikePost(currentPost._id)
      : this.apiService.likePost(currentPost._id);
    
    likeAction.pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Error toggling like:', err);
        return of(null);
      }),
      finalize(() => this.setLoadingState({ like: false }))
    ).subscribe(response => {
      if (response) {
        this.isLiked.set(!this.isLiked());
        // Update the post with new like count
        this.post.update(current => {
          if (current) {
            return { ...current, likeCount: response.likes };
          }
          return current;
        });
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTagName(tag: any): string {
    return typeof tag === 'string' ? tag : tag.name;
  }

  getTagSlug(tag: any): string {
    return typeof tag === 'string' 
      ? tag.toLowerCase().replace(/\s+/g, '-') 
      : tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-');
  }

  sharePost(platform: 'twitter' | 'facebook' | 'linkedin'): void {
    const currentPost = this.post();
    if (!currentPost || !this.isBrowser) return;
    
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentPost.title);
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }

  private setLoadingState(state: Partial<LoadingState>): void {
    this.loadingState.update(current => ({ ...current, ...state }));
  }

  // Public method for retry functionality
  retryLoad(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadPost(slug);
      }
    });
  }
}
