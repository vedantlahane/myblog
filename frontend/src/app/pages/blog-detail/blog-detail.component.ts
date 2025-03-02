// src/app/pages/blog-detail/blog-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { switchMap, catchError } from 'rxjs/operators';
import { Post } from '../../models/post.model';
import { Subject, takeUntil, of } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';

@Component({

  selector: 'app-blog-detail',

  standalone: true,

  imports: [

    CommonModule,
    BlogCardComponent

  ],

  templateUrl: './blog-detail.component.html',

})

export class BlogDetailComponent implements OnInit, OnDestroy {
  post?: Post;
  relatedPosts: Post[] = [];
  isLoading: boolean = true;
  error: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {

    console.log('Initializing blog detail component');

    

    this.route.params.pipe(

      switchMap(params => {

        const idOrSlug = params['id'] || params['slug'];

        console.log('Loading post with identifier:', idOrSlug);

        return this.blogService.getPost(idOrSlug).pipe(

          catchError(error => {

            console.error('Error loading post:', error);

            this.error = 'Failed to load post. The post might not exist or has been removed.';

            return of(null);

          })

        );

      }),

      takeUntil(this.destroy$)

    ).subscribe({

      next: (post) => {

        console.log('Received post:', post);

        if (post) {

          this.post = post;

          this.updateMetaTags();

          this.loadRelatedPosts();

        }

        this.isLoading = false;

      },

      error: (error) => {

        console.error('Subscription error:', error);

        this.error = 'Failed to load post';

        this.isLoading = false;

      }

    });

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateMetaTags() {
    if (this.post) {
      // Update page title
      this.titleService.setTitle(`${this.post.title} | My Blog`);
      
      // Update meta tags
      this.metaService.updateTag({ name: 'description', content: this.post.subtitle });
      this.metaService.updateTag({ property: 'og:title', content: this.post.title });
      this.metaService.updateTag({ property: 'og:description', content: this.post.subtitle });
      if (this.post.thumbnail?.url) {
        this.metaService.updateTag({ property: 'og:image', content: this.post.thumbnail.url });
      }
    }
  }

  loadRelatedPosts() {
    if (this.post?._id) {
      this.blogService.getRelatedPosts(this.post._id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (posts) => {
          console.log('Loaded related posts:', posts);
          this.relatedPosts = posts;
        },
        error: (error) => {
          console.error('Failed to load related posts:', error);
        }
      });
    }
  }

  getReadingTime(minutes: number | undefined): string {
    if (!minutes) return '1 minute';
    return minutes > 1 ? `${minutes} minutes` : '1 minute';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack() {
    window.history.back();
  }

  // Helper methods for template
  getAuthorName(): string {
    return this.post?.author?.name || 'Anonymous';
  }

  getAuthorAvatar(): string {
    return this.post?.author?.avatar || 'assets/images/default-avatar.png';
  }

  getThumbnailUrl(): string {
    return this.post?.thumbnail?.url || 'assets/images/default-thumbnail.jpg';
  }

  getThumbnailAlt(): string {
    return this.post?.thumbnail?.alt || this.post?.title || 'Blog post image';
  }

  hasRelatedPosts(): boolean {
    return this.relatedPosts.length > 0;
  }
}