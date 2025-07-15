import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { User, Post } from '../../../types/api';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject, forkJoin } from 'rxjs';

interface LoadingState {
  profile: boolean;
  posts: boolean;
  follow: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private destroy$ = new Subject<void>();

  // State management with signals
  user = signal<User | null>(null);
  posts = signal<Post[]>([]);
  currentUser = signal<User | null>(null);
  loadingState = signal<LoadingState>({
    profile: false,
    posts: false,
    follow: false
  });
  error = signal<string | null>(null);
  isFollowing = signal(false);

  // Computed properties
  loading = computed(() => this.loadingState().profile || this.loadingState().posts);
  isOwnProfile = computed(() => {
    const current = this.currentUser();
    const viewed = this.user();
    return current && viewed && current._id === viewed._id;
  });

  ngOnInit(): void {
    this.loadCurrentUser();
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.loadUserProfile(userId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.apiService.getCurrentUser().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to load current user:', err);
        return of(null);
      })
    ).subscribe(user => {
      this.currentUser.set(user);
    });
  }

  private loadUserProfile(userId: string): void {
    this.setLoadingState({ profile: true, posts: true });
    this.error.set(null);

    // Load user and posts in parallel
    forkJoin({
      user: this.apiService.getUserById(userId).pipe(
        catchError(err => {
          console.error('Error loading user:', err);
          return of(null);
        })
      ),
      posts: this.apiService.getPosts({ author: userId }).pipe(
        catchError(err => {
          console.error('Error loading posts:', err);
          return of({ data: [] });
        })
      )
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.setLoadingState({ profile: false, posts: false }))
    ).subscribe(({ user, posts }) => {
      if (user) {
        this.user.set(user);
        this.posts.set(posts.data || posts);
        this.checkFollowingStatus();
      } else {
        this.error.set('User not found');
      }
    });
  }

  private checkFollowingStatus(): void {
    const currentUserData = this.currentUser();
    const viewedUser = this.user();
    
    if (!this.isOwnProfile() && currentUserData && viewedUser) {
      // Check if already following this user
      // This logic would depend on your API structure
      // For now, using a placeholder implementation
      this.isFollowing.set(false);
    }
  }

  followUser(): void {
    const viewedUser = this.user();
    if (!viewedUser) return;

    this.setLoadingState({ follow: true });

    this.apiService.followUser(viewedUser._id).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to follow user:', err);
        return of(null);
      }),
      finalize(() => this.setLoadingState({ follow: false }))
    ).subscribe(response => {
      if (response) {
        this.isFollowing.set(true);
        this.user.update(current => {
          if (current) {
            return {
              ...current,
              followerCount: (current.followerCount || 0) + 1
            };
          }
          return current;
        });
      }
    });
  }

  unfollowUser(): void {
    const viewedUser = this.user();
    if (!viewedUser) return;

    this.setLoadingState({ follow: true });

    this.apiService.unfollowUser(viewedUser._id).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to unfollow user:', err);
        return of(null);
      }),
      finalize(() => this.setLoadingState({ follow: false }))
    ).subscribe(response => {
      if (response) {
        this.isFollowing.set(false);
        this.user.update(current => {
          if (current) {
            return {
              ...current,
              followerCount: Math.max((current.followerCount || 0) - 1, 0)
            };
          }
          return current;
        });
      }
    });
  }

  editProfile(): void {
    this.router.navigate(['/settings/profile']);
  }

  navigateToPost(post: Post): void {
    this.router.navigate(['/post', post.slug]);
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  navigateToWrite(): void {
    this.router.navigate(['/write']);
  }

  retryLoad(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.loadUserProfile(userId);
      }
    });
  }

  private setLoadingState(state: Partial<LoadingState>): void {
    this.loadingState.update(current => ({ ...current, ...state }));
  }
}
