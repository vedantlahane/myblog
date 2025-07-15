import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import type { Post, User, Comment } from '../../../types/api';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.css']
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  relatedPosts: Post[] = [];
  comments: Comment[] = [];
  loading = true;
  error: string | null = null;
  isLiked = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadPost(slug);
      }
    });
  }

  loadPost(slug: string) {
    this.loading = true;
    
    this.apiService.getPostBySlug(slug)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (post) => {
          this.post = post;
          this.checkIfLiked();
          this.loadRelatedPosts(post._id);
          this.loadComments(post._id);
        },
        error: (err) => {
          console.error('Error loading post:', err);
          this.error = 'Failed to load post';
        }
      });
  }

  loadRelatedPosts(postId: string) {
    this.apiService.getRelatedPosts(postId)
      .subscribe({
        next: (posts) => {
          this.relatedPosts = posts.slice(0, 3);
        },
        error: (err) => {
          console.error('Error loading related posts:', err);
        }
      });
  }

  loadComments(postId: string) {
    this.apiService.getComments({ post: postId })
      .subscribe({
        next: (comments) => {
          this.comments = comments;
        },
        error: (err) => {
          console.error('Error loading comments:', err);
        }
      });
  }

  checkIfLiked() {
    // Check if current user has liked this post
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && this.post) {
      const user = JSON.parse(currentUser);
      this.isLiked = this.post.likes.includes(user._id);
    }
  }

  toggleLike() {
    if (!this.post) return;
    
    if (this.isLiked) {
      this.apiService.unlikePost(this.post._id).subscribe({
        next: (response) => {
          this.isLiked = false;
          if (this.post) {
            this.post.likeCount = response.likes;
          }
        }
      });
    } else {
      this.apiService.likePost(this.post._id).subscribe({
        next: (response) => {
          this.isLiked = true;
          if (this.post) {
            this.post.likeCount = response.likes;
          }
        }
      });
    }
  }

  get authorName(): string {
    if (!this.post) return '';
    if (typeof this.post.author === 'string') return 'Unknown Author';
    return (this.post.author as User).name;
  }

  get authorAvatar(): string {
    if (!this.post) return '';
    if (typeof this.post.author === 'string') return 'assets/default-avatar.png';
    return (this.post.author as User).avatarUrl || 'assets/default-avatar.png';
  }

  get readingTime(): number {
    if (!this.post) return 0;
    return this.post.readingTime || Math.ceil(this.post.content.split(' ').length / 200);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}