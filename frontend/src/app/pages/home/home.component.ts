import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post, User, PaginatedResponse, Tag, Category } from '../../../types/api';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { WriteModalComponent } from '../../components/write-modal/write-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, PostCardComponent, WriteModalComponent],
  templateUrl: './home.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private destroy$ = new Subject<void>();

  // State signals
  posts = signal<Post[]>([]);
  featuredPost = signal<Post | null>(null);
  tags = signal<Tag[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(false);
  isLoadingMore = signal(false);
  hasMorePosts = signal(true);
  currentFilter = signal<'latest' | 'popular'>('latest');
  showWriteModal = signal(false);
  
  // Pagination
  currentPage = 1;
  postsPerPage = 10;

  // Computed properties
  isAuthenticated = computed(() => this.apiService.isAuthenticated());

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading.set(true);

    // Load posts, tags, and categories in parallel
    forkJoin({
      posts: this.apiService.getPosts({ 
        page: 1, 
        limit: this.postsPerPage, 
        sort: 'createdAt'
      }).pipe(catchError(() => of({ data: [], currentPage: 1, totalPages: 0, totalItems: 0 }))),
      tags: this.apiService.getTags().pipe(catchError(() => of([]))),
      categories: this.apiService.getCategories().pipe(catchError(() => of([])))
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading.set(false))
    ).subscribe(({ posts, tags, categories }) => {
      this.posts.set(posts.data);
      this.tags.set(tags);
      this.categories.set(categories);
      this.hasMorePosts.set(posts.currentPage < posts.totalPages);
      
      // Set featured post (first post with cover image or just first post)
      const featured = posts.data.find(p => p.coverImage) || posts.data[0];
      if (featured) {
        this.featuredPost.set(featured);
        // Remove featured post from main list
        this.posts.set(posts.data.filter(p => p._id !== featured._id));
      }
    });
  }

  loadPosts(filter: 'latest' | 'popular'): void {
    this.currentFilter.set(filter);
    this.currentPage = 1;
    this.isLoading.set(true);

    const sortField = filter === 'latest' ? 'createdAt' : 'likeCount';
    
    this.apiService.getPosts({ 
      page: 1, 
      limit: this.postsPerPage, 
      sort: sortField
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading.set(false))
    ).subscribe(response => {
      this.posts.set(response.data);
      this.hasMorePosts.set(response.currentPage < response.totalPages);
    });
  }

  loadMorePosts(): void {
    if (this.isLoadingMore() || !this.hasMorePosts()) return;

    this.isLoadingMore.set(true);
    this.currentPage++;

    const sortField = this.currentFilter() === 'latest' ? 'createdAt' : 'likeCount';
    
    this.apiService.getPosts({ 
      page: this.currentPage, 
      limit: this.postsPerPage, 
      sort: sortField
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoadingMore.set(false))
    ).subscribe(response => {
      this.posts.update(current => [...current, ...response.data]);
      this.hasMorePosts.set(response.currentPage < response.totalPages);
    });
  }

  openWriteModal(): void {
    this.showWriteModal.set(true);
  }

  closeWriteModal(): void {
    this.showWriteModal.set(false);
  }

  onPostCreated(post: Post): void {
    // Add new post to the beginning of the list
    this.posts.update(current => [post, ...current]);
    this.closeWriteModal();
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
      month: 'short', 
      day: 'numeric' 
    });
  }
}
