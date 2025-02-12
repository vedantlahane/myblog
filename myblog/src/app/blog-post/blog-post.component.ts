import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturedPostComponent } from "../featured-post/featured-post.component";
import { Router } from '@angular/router';
import { RecommendedTopicsComponent } from '../recommended-topics/recommended-topics.component';
import { FetchblogService } from '../services/fetchblog.service';
export interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  date: string;
}
@Component({
    selector: 'app-blog-post',
    standalone: true,
    templateUrl: './blog-post.component.html',
    styleUrl: './blog-post.component.css',
    imports: [CommonModule, FeaturedPostComponent,RecommendedTopicsComponent]
})

export class BlogPostComponent implements OnInit {
  blogs: any[] = [];

  constructor(private fetchblogService: FetchblogService,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.fetchBlogs();
  }

  fetchBlogs(): void {
    this.fetchblogService.getBlogs().subscribe((blogs: any[]) => {
      this.blogs = blogs
    }, error => {
      console.error("Error fetching blogs:", error);
    });
  }

  navigateToPost(postId: string): void {
    // Add your navigation logic here
    console.log("Navigating to post with ID:", postId);
    // For example, you can navigate to a detailed view of the blog post using Angular Router
    // this.router.navigate(['/blog', postId]);
    this.router.navigate(['/article', postId]);
  }
}
