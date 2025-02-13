// blog-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Post {
  id: number;
  title: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  date: string;
}

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  template: `
    <article class="bg-white rounded-lg shadow-lg overflow-hidden">
      <img [src]="post.thumbnail" [alt]="post.title" class="w-full h-48 object-cover">
      <div class="p-4">
        <h2 class="text-xl font-semibold mb-2">{{post.title}}</h2>
        <p class="text-gray-600 mb-4">{{post.excerpt}}</p>
        <div class="flex justify-between items-center text-sm text-gray-500">
          <span>By {{post.author}}</span>
          <span>{{post.date | date}}</span>
        </div>
        <a [routerLink]="['/blog', post.id]" 
           class="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Read More
        </a>
      </div>
    </article>
  `
})
export class BlogCardComponent {
  @Input() post!: Post;
}