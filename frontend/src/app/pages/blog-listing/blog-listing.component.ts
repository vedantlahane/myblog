// src/app/pages/blog-listing/blog-listing.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { FiltersComponent } from '../../components/filters/filters.component';
import { BlogService } from '../../services/blog.service';
import { Post } from '../../models/post.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface FilterOptions {
  category?: string;
  tag?: string;
  sortBy?: 'date' | 'views' | 'likes';
}

@Component({
  selector: 'app-blog-listing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BlogCardComponent,
    FiltersComponent
  ],
  templateUrl: './blog-listing.component.html'
})
export class BlogListingComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  postsPerPage: number = 9;
  totalPages: number = 1;
  totalPosts: number = 0;
  isLoading: boolean = true;
  error: string = '';

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  currentFilters: FilterOptions = {};

  constructor(private blogService: BlogService) {
    this.setupSearchSubscription();
  }

  private setupSearchSubscription() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1; // Reset to first page on search
      this.filterPosts();
    });
  }

  ngOnInit() {
    this.loadPosts();
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  loadPosts() {
    this.isLoading = true;
    this.error = '';

    console.log('Loading posts...');

    this.blogService.getPosts().subscribe({
      next: (posts) => {
        // console.log('Received posts:', posts);
        if (Array.isArray(posts)) {
          this.posts = posts;
          this.filterPosts();
        }
        this.isLoading = false;
      },
      error: (error) => {
        // console.error('Error loading posts:', error);
        this.error = 'Failed to load posts. Please try again later.';
        this.posts = [];
        this.filteredPosts = [];
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(filters: FilterOptions) {
    this.currentFilters = filters;
    this.currentPage = 1; // Reset to first page on filter change
    this.filterPosts();
  }

  filterPosts() {
    let filtered = [...this.posts];

    // Apply search
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.subtitle.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (this.currentFilters.category) {
      filtered = filtered.filter(post => 
        post.category === this.currentFilters.category
      );
    }

    // Apply tag filter
    if (this.currentFilters.tag && filtered[0]?.tags) {
      filtered = filtered.filter(post => 
        post.tags?.includes(this.currentFilters.tag!)
      );
    }

    // Apply sorting
    if (this.currentFilters.sortBy) {
      filtered.sort((a, b) => {
        switch (this.currentFilters.sortBy) {
          case 'date':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'views':
            return (b.stats?.views || 0) - (a.stats?.views || 0);
          case 'likes':
            return (b.stats?.likes || 0) - (a.stats?.likes || 0);
          default:
            return 0;
        }
      });
    }

    // Calculate pagination
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.postsPerPage));
    this.currentPage = Math.min(this.currentPage, this.totalPages);

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    this.filteredPosts = filtered.slice(startIndex, startIndex + this.postsPerPage);

    console.log('Filtered posts:', this.filteredPosts);
  }

  onPageChange(page: number) {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterPosts();
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  trackByPostId(index: number, post: Post): string {
    return post._id;
  }

  hasPosts(): boolean {
    return this.filteredPosts.length > 0;
  }
}