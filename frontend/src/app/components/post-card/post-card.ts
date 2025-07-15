import { Component, input, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Post, Tag, User } from '../../../types/api';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-card.html'
})
export class PostCardComponent {
  private router = inject(Router);
  
  // Modern signal-based inputs
  post = input.required<Post>();
  showFullContent = input<boolean>(false);
  showActions = input<boolean>(false);
  
  // Internal state
  imageLoaded = signal(false);
  imageError = signal(false);
  isLiked = signal(false);
  isBookmarked = signal(false);
  
  // Computed properties
  tagsList = computed(() => this.post()?.tags || []);
  
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
  
  readingTime = computed(() => {
    const currentPost = this.post();
    return currentPost.readingTime || Math.ceil(currentPost.content.split(' ').length / 200);
  });
  
  postUrl = computed(() => ['/post', this.post().slug || this.post()._id]);
  
  formattedDate = computed(() => {
    const date = this.post().publishedAt || this.post().createdAt;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  });
  
  hasImage = computed(() => !!this.post().coverImage);
  
  // Relative time computation
  relativeTime = computed(() => {
    const date = new Date(this.post().publishedAt || this.post().createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return this.formattedDate();
  });

  getTagName(tag: string | Tag): string {
    return typeof tag === 'string' ? tag : tag.name;
  }

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

  toggleLike(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isLiked.update(current => !current);
    // Implement actual like API call here
  }

  toggleBookmark(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isBookmarked.update(current => !current);
    // Implement actual bookmark API call here
  }

  sharePost(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: this.post().title,
        text: this.post().excerpt,
        url: window.location.origin + '/post/' + (this.post().slug || this.post()._id)
      });
    } else {
      // Fallback: copy to clipboard
      const url = window.location.origin + '/post/' + (this.post().slug || this.post()._id);
      navigator.clipboard.writeText(url);
    }
  }
}
