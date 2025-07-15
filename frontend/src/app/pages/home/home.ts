import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { TrendingCardComponent } from '../../components/trending-card/trending-card';
import { HotTopicCardComponent } from '../../components/hot-topic-card/hot-topic-card';
import { LatestCardComponent } from '../../components/latest-card/latest-card';
import type { Post } from '../../../types/api';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface ErrorState {
  trending: string | null;
  latest: string | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TrendingCardComponent,
    HotTopicCardComponent,
    LatestCardComponent
  ],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private destroy$ = new Subject<void>();
  
  // State management with signals
  trendingPosts = signal<Post[]>([]);
  latestPosts = signal<Post[]>([]);
  trendingLoading = signal(false);
  latestLoading = signal(false);
  errorState = signal<ErrorState>({ trending: null, latest: null });
  
  // Computed properties
  hotTopicPost = computed(() => this.trendingPosts()[0] || null);
  loading = computed(() => this.trendingLoading() || this.latestLoading());
  error = computed(() => {
    const errors = this.errorState();
    return errors.trending || errors.latest;
  });

  ngOnInit(): void {
    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPosts(): void {
    this.loadTrendingPosts();
    this.loadLatestPosts();
  }

  private loadTrendingPosts(): void {
    this.trendingLoading.set(true);
    this.updateErrorState({ trending: null });
    
    this.apiService.getTrendingPosts()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading trending posts:', err);
          this.updateErrorState({ trending: 'Failed to load trending posts. Please try again.' });
          return of([]);
        }),
        finalize(() => this.trendingLoading.set(false))
      )
      .subscribe(posts => {
        this.trendingPosts.set(posts.slice(0, 2));
      });
  }

  private loadLatestPosts(): void {
    this.latestLoading.set(true);
    this.updateErrorState({ latest: null });
    
    this.apiService.getPosts({ limit: 10, status: 'published' })
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading latest posts:', err);
          this.updateErrorState({ latest: 'Failed to load latest posts. Please try again.' });
          return of({ data: [] });
        }),
        finalize(() => this.latestLoading.set(false))
      )
      .subscribe(response => {
        this.latestPosts.set(response.data || []);
      });
  }

  private updateErrorState(partialError: Partial<ErrorState>): void {
    this.errorState.update(current => ({ ...current, ...partialError }));
  }

  // Public method for retry functionality
  retryLoad(): void {
    this.errorState.set({ trending: null, latest: null });
    this.loadPosts();
  }
}
