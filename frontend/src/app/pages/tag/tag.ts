import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { Tag, Post } from '../../../types/api';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface LoadingState {
  tag: boolean;
  posts: boolean;
}

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag.html'
})
export class TagComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private destroy$ = new Subject<void>();

  // State management with signals
  tag = signal<Tag | null>(null);
  posts = signal<Post[]>([]);
  loadingState = signal<LoadingState>({
    tag: false,
    posts: false
  });
  error = signal<string | null>(null);

  // Computed properties
  loading = computed(() => this.loadingState().tag || this.loadingState().posts);
  postCount = computed(() => {
    const currentTag = this.tag();
    return currentTag?.postCount || this.posts().length;
  });

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadTagData(slug);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTagData(slug: string): void {
    this.setLoadingState({ tag: true, posts: true });
    this.error.set(null);

    // Load tag info first, then posts
    this.apiService.getTagBySlug(slug).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Error loading tag:', err);
        this.error.set('Tag not found. Please check the URL and try again.');
        return of(null);
      }),
      finalize(() => this.setLoadingState({ tag: false }))
    ).subscribe(tag => {
      if (tag) {
        this.tag.set(tag);
        this.loadPostsByTag(tag._id);
      }
    });
  }

  private loadPostsByTag(tagId: string): void {
    this.apiService.getPosts({ tags: [tagId] }).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Error loading posts:', err);
        this.error.set('Failed to load posts for this tag. Please try again.');
        return of({ data: [] });
      }),
      finalize(() => this.setLoadingState({ posts: false }))
    ).subscribe(response => {
      this.posts.set(response.data || response);
    });
  }

  navigateToPost(post: Post): void {
    this.router.navigate(['/post', post.slug]);
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  retryLoad(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadTagData(slug);
      }
    });
  }

  private setLoadingState(state: Partial<LoadingState>): void {
    this.loadingState.update(current => ({ ...current, ...state }));
  }
}
