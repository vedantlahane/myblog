import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import type { Post, User } from '../../../types/api';

@Component({
  selector: 'app-hot-topic-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hot-topic-card.html'
})
export class HotTopicCardComponent {
  // Modern signal-based inputs
  post = input.required<Post>();
  category = input<string>('Business');
  readTime = input<string>('2 Hours ago');
  showExcerpt = input<boolean>(true);
  
  // Internal state
  imageLoaded = signal(false);
  imageError = signal(false);
  
  // Computed properties
  authorName = computed(() => {
    const postAuthor = this.post().author;
    if (typeof postAuthor === 'string') {
      return 'Unknown Author';
    }
    return (postAuthor as User).name;
  });
  
  authorAvatar = computed(() => {
    const postAuthor = this.post().author;
    if (typeof postAuthor === 'string') {
      return '/assets/default-avatar.png';
    }
    return (postAuthor as User).avatarUrl || '/assets/default-avatar.png';
  });
  
  postUrl = computed(() => ['/post', this.post().slug]);
  
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
}
