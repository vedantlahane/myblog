import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';
import { Post, Tag, CreatePostRequest, UpdatePostRequest } from '../../../types/api';

@Component({
  selector: 'app-write',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './write.html',
  styleUrl: './write.css'
})
export class WriteComponent implements OnInit {
  postForm: FormGroup;
  availableTags: Tag[] = [];
  selectedTags: string[] = [];
  loading = false;
  saving = false;
  error: string | null = null;
  isEditMode = false;
  postId: string | null = null;
  post: Post | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      excerpt: ['', [Validators.maxLength(500)]],
      coverImage: [''],
      status: ['draft', Validators.required]
    });
  }

  ngOnInit() {
    this.loadTags();

    // Check if editing an existing post
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.postId = params['id'];
        if (this.postId) {
          this.loadPost(this.postId);
        }
      }
    });
  }

  private loadTags() {
    this.apiService.getTags().subscribe({
      next: (tags: Tag[]) => {
        this.availableTags = tags;
      },
      error: (err: any) => {
        console.error('Failed to load tags:', err);
      }
    });
  }

  private loadPost(postId: string) {
    this.loading = true;
    this.apiService.getPostById(postId).subscribe({
      next: (post: Post) => {
        this.post = post;
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          status: post.status
        });
        
        // Set selected tags
        if (Array.isArray(post.tags)) {
          this.selectedTags = post.tags.map((tag: any) => 
            typeof tag === 'string' ? tag : tag._id
          );
        }
        
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load post';
        this.loading = false;
      }
    });
  }

  toggleTag(tagId: string) {
    const index = this.selectedTags.indexOf(tagId);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tagId);
    }
  }

  isTagSelected(tagId: string): boolean {
    return this.selectedTags.includes(tagId);
  }

  saveDraft() {
    this.savePost('draft');
  }

  publishPost() {
    this.savePost('published');
  }

  private savePost(status: 'draft' | 'published') {
    if (this.postForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.selectedTags.length === 0) {
      this.error = 'Please select at least one tag';
      return;
    }

    this.saving = true;
    this.error = null;

    const formValue = this.postForm.value;
    const postData = {
      ...formValue,
      status,
      tags: this.selectedTags
    };

    const request = this.isEditMode 
      ? this.apiService.updatePost(this.postId!, postData as UpdatePostRequest)
      : this.apiService.createPost(postData as CreatePostRequest);

    request.subscribe({
      next: (post: Post) => {
        this.saving = false;
        const message = this.isEditMode ? 'Post updated' : 'Post created';
        
        if (status === 'published') {
          this.router.navigate(['/post', post.slug || post._id]);
        } else {
          this.router.navigate(['/drafts']);
        }
      },
      error: (err: any) => {
        this.error = err.message || 'Failed to save post';
        this.saving = false;
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.postForm.controls).forEach(key => {
      this.postForm.get(key)?.markAsTouched();
    });
  }

  cancel() {
    if (this.isEditMode && this.post) {
      this.router.navigate(['/post', this.post.slug || this.post._id]);
    } else {
      this.router.navigate(['/']);
    }
  }

  // Helper methods for template
  getFieldError(fieldName: string): string | null {
    const field = this.postForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['maxlength']) return `${fieldName} is too long`;
    }
    return null;
  }
}
