import { Component, input, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import type { Post, User, Tag } from '../../../types/api';

@Component({
  selector: 'app-trending-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trending-card.html'
})
export class TrendingCardComponent {
  private router = inject(Router);
  
  // Modern signal-based inputs
  post = input.required<Post>();
  category = input<string>('Movies');
  readTime = input<string>('3 hours ago');
  showButton = input<boolean>(true);
  showAuthor = input<boolean>(true);
  showTags = input<boolean>(false);
  
  // Internal state
  imageLoaded = signal(false);
  imageError = signal(false);
  
  // Computed properties
  postUrl = computed(() => ['/post', this.post().slug]);
  
  authorName = computed(() => {
    const postAuthor = this.post().author;
    if (typeof postAuthor === 'string') return 'Unknown Author';
    return (postAuthor as User).name;
  });
  
  authorAvatar = computed(() => {
    const postAuthor = this.post().author;
    if (typeof postAuthor === 'string') return '/assets/default-avatar.png';
    return (postAuthor as User).avatarUrl || '/assets/default-avatar.png';
  });
  
  formattedReadTime = computed(() => {
    const post = this.post();
    if (post.publishedAt) {
      const publishedDate = new Date(post.publishedAt);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      }
    }
    return this.readTime();
  });
  
  hasImage = computed(() => !!this.post().coverImage);
  
  tagsList = computed(() => {
    const tags = this.post().tags;
    return tags ? tags.slice(0, 2) : [];
  });

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // The routerLink will handle navigation
    }
  }

  navigateToAuthor(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const postAuthor = this.post().author;
    if (typeof postAuthor === 'object') {
      this.router.navigate(['/profile', postAuthor._id]);
    }
  }

  getTagName(tag: string | Tag): string {
    return typeof tag === 'string' ? tag : tag.name;
  }
}
