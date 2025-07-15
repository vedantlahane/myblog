import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';
// import { TrendingCardComponent } from '../../components/trending-card/trending-card';
import type { Post } from '../../../types/api';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule], // TrendingCardComponent
  templateUrl: './category.html',
  styleUrls: ['./category.css']
})
export class CategoryComponent implements OnInit {
  category: string = '';
  posts: Post[] = [];
  loading = true;
  error: string | null = null;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.category = params['category'];
      this.loadPosts();
    });
  }

  loadPosts() {
    this.loading = true;
    
    this.apiService.getPosts({
      tags: [this.category],
      page: this.currentPage,
      limit: 12,
      status: 'published'
    }).subscribe({
      next: (response) => {
        this.posts = response.data;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load posts';
        this.loading = false;
      }
    });
  }

  loadMore() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPosts();
    }
  }

  getCategoryTitle(): string {
    return this.category.charAt(0).toUpperCase() + this.category.slice(1);
  }
}