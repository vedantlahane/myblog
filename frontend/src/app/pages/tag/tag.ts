import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../services/api';
import { Tag, Post } from '../../../types/api';
// import { PostCardComponent } from '../../components/post-card/post-card';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [CommonModule], // PostCardComponent
  templateUrl: './tag.html',
  styleUrl: './tag.css'
})
export class TagComponent implements OnInit {
  tag: Tag | null = null;
  posts: Post[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadTagData(slug);
      }
    });
  }

  private loadTagData(slug: string) {
    this.loading = true;
    this.error = null;

    // Load tag information
    this.apiService.getTagBySlug(slug).subscribe({
      next: (tag: Tag) => {
        this.tag = tag;
        this.loadPostsByTag(tag._id);
      },
      error: (err: any) => {
        this.error = 'Tag not found';
        this.loading = false;
      }
    });
  }

  private loadPostsByTag(tagId: string) {
    this.apiService.getPosts({ tags: [tagId] }).subscribe({
      next: (response: any) => {
        this.posts = response.data || response;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load posts';
        this.loading = false;
      }
    });
  }
}
