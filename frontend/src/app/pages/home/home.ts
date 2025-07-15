import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { TrendingCardComponent } from '../../components/trending-card/trending-card';
import { HotTopicCardComponent } from '../../components/hot-topic-card/hot-topic-card';
import { LatestCardComponent } from '../../components/latest-card/latest-card';
import type { Post } from '../../../types/api';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TrendingCardComponent,
    HotTopicCardComponent,
    LatestCardComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  trendingPosts: Post[] = [];
  hotTopicPost: Post | null = null;
  latestPosts: Post[] = [];
  loading = true;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    
    // Load trending posts
    this.apiService.getTrendingPosts()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (posts) => {
          this.trendingPosts = posts.slice(0, 2);
          this.hotTopicPost = posts[0]; // Use first trending as hot topic
        },
        error: (err) => {
          console.error('Error loading trending posts:', err);
          this.error = 'Failed to load trending posts';
        }
      });

    // Load latest posts
    this.apiService.getPosts({ limit: 10, status: 'published' })
      .subscribe({
        next: (response) => {
          this.latestPosts = response.data;
        },
        error: (err) => {
          console.error('Error loading latest posts:', err);
        }
      });
  }
}