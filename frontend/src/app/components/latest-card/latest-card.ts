import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import type { Post } from '../../../types/api';

@Component({
  selector: 'app-latest-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './latest-card.html',
  styleUrls: ['./latest-card.css']
})
export class LatestCardComponent {
  @Input() post!: Post;
  @Input() showImage: boolean = false;
}