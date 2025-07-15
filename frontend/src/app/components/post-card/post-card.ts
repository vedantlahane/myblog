import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post, User, Tag } from '../../../types/api';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css'
})
export class PostCardComponent {
  @Input() post!: Post;

  get authorName(): string {
    if (typeof this.post.author === 'string') return 'Unknown Author';
    return (this.post.author as User).name;
  }

  get authorAvatar(): string {
    if (typeof this.post.author === 'string') return '/assets/default-avatar.png';
    return (this.post.author as User).avatarUrl || '/assets/default-avatar.png';
  }

  get readingTime(): number {
    return this.post.readingTime || Math.ceil(this.post.content.split(' ').length / 200);
  }

  getTagName(tag: string | Tag): string {
    return typeof tag === 'string' ? tag : tag.name;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
