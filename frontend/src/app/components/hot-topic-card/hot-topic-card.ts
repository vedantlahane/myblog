import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import type { Post, User } from '../../../types/api';

@Component({
  selector: 'app-hot-topic-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hot-topic-card.html',
  styleUrls: ['./hot-topic-card.css']
})
export class HotTopicCardComponent {
  @Input() post!: Post;
  @Input() category: string = 'Business';
  @Input() readTime: string = '2 Hours ago';
  
  get authorName(): string {
    if (typeof this.post.author === 'string') {
      return 'Unknown Author';
    }
    return (this.post.author as User).name;
  }
}