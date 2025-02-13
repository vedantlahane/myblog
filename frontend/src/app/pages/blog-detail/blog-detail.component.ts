// pages/blog-detail/blog-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog.service';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { switchMap } from 'rxjs/operators';

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  avatar: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  thumbnail: string;
  tags: string[];
  comments: Comment[];
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BlogCardComponent
  ],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {
  post?: Post;
  relatedPosts: Post[] = [];
  newComment: string = '';
  isLoading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => this.blogService.getPost(params['id']))
    ).subscribe({
      next: (post) => {
        this.post = post;
        this.loadRelatedPosts();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load post';
        this.isLoading = false;
      }
    });
  }

  loadRelatedPosts() {
    if (this.post) {
      this.blogService.getRelatedPosts(this.post.id).subscribe({
        next: (posts) => this.relatedPosts = posts,
        error: (error) => console.error('Failed to load related posts', error)
      });
    }
  }

  submitComment() {
    if (!this.newComment.trim()) return;

    const comment = {
      content: this.newComment,
      postId: this.post?.id
    };

    this.blogService.addComment(comment).subscribe({
      next: (response) => {
        if (this.post) {
          this.post.comments = [...this.post.comments, response];
        }
        this.newComment = '';
      },
      error: (error) => console.error('Failed to add comment', error)
    });
  }
}