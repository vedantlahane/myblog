import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import type { Post, User } from '../../../types/api';

@Component({
  selector: 'app-latest-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './latest-card.html'
})
export class LatestCardComponent {
  // Modern signal-based inputs
  post = input.required<Post>();
  showImage = input<boolean>(false);
  showAuthor = input<boolean>(false);
  showMetadata = input<boolean>(true);
  
  // Internal state
  imageLoaded = signal(false);
  imageError = signal(false);
  
  // Computed properties
  hasImage = computed(() => this.showImage() && !!this.post().coverImage);
  postUrl = computed(() => ['/post', this.post().slug]);
  author = computed(() => {
    const postAuthor = this.post().author;
    return typeof postAuthor === 'object' ? postAuthor : null;
  });
  
  // Format publication date
  formattedDate = computed(() => {
    const date = this.post().publishedAt || this.post().createdAt;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
