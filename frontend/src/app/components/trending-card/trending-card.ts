import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import type { Post } from '../../../types/api';

@Component({
  selector: 'app-trending-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trending-card.html',
  styleUrls: ['./trending-card.css']
})
export class TrendingCardComponent {
  @Input() post!: Post;
  @Input() category: string = 'Movies';
  @Input() readTime: string = '3 hours ago';
}