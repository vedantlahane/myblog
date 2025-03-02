// src/app/components/blog-card/blog-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-card.component.html',
})
export class BlogCardComponent {
  @Input({ required: true }) post!: Post;

  getReadingTime(minutes: number): string {
    return minutes > 1 ? `${minutes} minutes` : '1 minute';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCategoryClass(category: string): string {
    const classes: Record<string, string> = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Programming': 'bg-green-100 text-green-800',
      'Design': 'bg-purple-100 text-purple-800',
      'Business': 'bg-yellow-100 text-yellow-800',
      'Lifestyle': 'bg-pink-100 text-pink-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return classes[category] || classes['Other'];
  }
}