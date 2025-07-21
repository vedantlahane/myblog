import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post, User, Tag } from '../../../types/api';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <article class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div class="p-6">
        <!-- Tags -->
        @if (post.tags && post.tags.length > 0) {
          <div class="flex items-center gap-2 mb-3">
            @for (tag of post.tags.slice(0, 3); track tag; let last = $last) {
              <span class="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                {{ typeof tag === 'string' ? tag : tag.name }}
              </span>
              @if (!last && $index < 2) {
                <span class="text-gray-300 text-xs">•</span>
              }
            }
          </div>
        }

        <!-- Title and Excerpt -->
        <div class="mb-4">
          <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
            <a [routerLink]="['/post', post.slug]" class="block">
              {{ post.title }}
            </a>
          </h3>
          @if (post.excerpt) {
            <p class="text-gray-600 text-sm line-clamp-2">
              {{ post.excerpt }}
            </p>
          }
        </div>

        <!-- Author and Meta Info -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img 
              [src]="getAuthorAvatar(post.author)" 
              [alt]="getAuthorName(post.author)"
              class="w-8 h-8 rounded-full">
            <div>
              <p class="font-medium text-gray-900 text-sm">{{ getAuthorName(post.author) }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(post.publishedAt || post.createdAt) }}</p>
            </div>
          </div>
          
          <!-- Engagement Stats -->
          <div class="flex items-center gap-3 text-gray-500 text-sm">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {{ post.likeCount || 0 }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              {{ post.commentCount || 0 }}
            </span>
          </div>
        </div>

        <!-- Cover Image (if exists) -->
        @if (post.coverImage) {
          <div class="mt-4 aspect-[16/10] rounded-lg overflow-hidden">
            <img 
              [src]="post.coverImage" 
              [alt]="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          </div>
        }
      </div>
    </article>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class PostCardComponent {
  @Input({ required: true }) post!: Post;

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
