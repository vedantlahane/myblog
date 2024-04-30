import { Component, OnInit } from '@angular/core';
import { FetchblogService } from '../services/fetchblog.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [],
  templateUrl: './article.component.html',
  styleUrl: './article.component.css'
})
export class ArticleComponent implements OnInit{
  postId!: string;
  post: any;
  url:any;

  constructor(private route: ActivatedRoute, private blogService: FetchblogService) {}

  ngOnInit(): void {
    // Extract the postId from the URL
    this.postId = this.route.snapshot.paramMap.get('_id')!;

    // Fetch the details of the blog post using the postId
    this.blogService.getBlogPost(this.postId).subscribe((post: any) => {
      this.post = post;
    });
  }

}
