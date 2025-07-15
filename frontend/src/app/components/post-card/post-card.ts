import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post, Tag, User } from '../../../types/api';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css'
})
export class PostCardComponent {
  @Input() post!: Post;

  get tagsList(): (string | Tag)[] {
    return this.post?.tags || [];
  }

  getTagName(tag: string | Tag): string {
    return typeof tag === 'string' ? tag : tag.name;
  }

  getTagNames(tags: (string | Tag)[]): string[] {
    return tags.map(tag => this.getTagName(tag));
  }

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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
