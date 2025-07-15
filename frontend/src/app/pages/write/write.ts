import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';
import { Post, Tag, CreatePostRequest, UpdatePostRequest } from '../../../types/api';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface LoadingState {
  page: boolean;
  tags: boolean;
  post: boolean;
  saving: boolean;
}

@Component({
  selector: 'app-write',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './write.html'
})
export class WriteComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private destroy$ = new Subject<void>();

  // State management with signals
  postForm: FormGroup;
  availableTags = signal<Tag[]>([]);
  selectedTags = signal<string[]>([]);
  loadingState = signal<LoadingState>({
    page: false,
    tags: false,
    post: false,
    saving: false
  });
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isEditMode = signal(false);
  postId = signal<string | null>(null);
  post = signal<Post | null>(null);

  // Computed properties
  loading = computed(() => this.loadingState().page || this.loadingState().post);
  saving = computed(() => this.loadingState().saving);
  canSave = computed(() => 
    this.postForm?.valid && 
    this.selectedTags().length > 0 && 
    !this.saving()
  );

  constructor() {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      excerpt: ['', [Validators.maxLength(500)]],
      coverImage: [''],
      status: ['draft', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupRouteListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.setLoadingState({ page: true, tags: true });
    
    this.apiService.getTags().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to load tags:', err);
        this.error.set('Failed to load tags. Please refresh the page.');
        return of([]);
      }),
      finalize(() => this.setLoadingState({ tags: false, page: false }))
    ).subscribe(tags => {
      this.availableTags.set(tags);
    });
  }

  private setupRouteListener(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.postId.set(params['id']);
        this.loadPost(params['id']);
      }
    });
  }

  private loadPost(postId: string): void {
    this.setLoadingState({ post: true });
    this.error.set(null);
    
    this.apiService.getPostById(postId).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to load post:', err);
        this.error.set('Failed to load post. Please check the URL and try again.');
        return of(null);
      }),
      finalize(() => this.setLoadingState({ post: false }))
    ).subscribe(post => {
      if (post) {
        this.post.set(post);
        this.populateForm(post);
      }
    });
  }

  private populateForm(post: Post): void {
    this.postForm.patchValue({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      status: post.status
    });
    
    // Set selected tags
    if (Array.isArray(post.tags)) {
      const tagIds = post.tags.map((tag: any) => 
        typeof tag === 'string' ? tag : tag._id
      );
      this.selectedTags.set(tagIds);
    }
  }

  toggleTag(tagId: string): void {
    this.selectedTags.update(current => {
      const index = current.indexOf(tagId);
      if (index > -1) {
        return current.filter(id => id !== tagId);
      } else {
        return [...current, tagId];
      }
    });
    
    // Clear tag selection error when user selects a tag
    if (this.selectedTags().length > 0) {
      this.error.set(null);
    }
  }

  isTagSelected(tagId: string): boolean {
    return this.selectedTags().includes(tagId);
  }

  saveDraft(): void {
    this.savePost('draft');
  }

  publishPost(): void {
    this.savePost('published');
  }

  private savePost(status: 'draft' | 'published'): void {
    if (this.postForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.selectedTags().length === 0) {
      this.error.set('Please select at least one tag');
      return;
    }

    this.setLoadingState({ saving: true });
    this.error.set(null);
    this.successMessage.set(null);

    const formValue = this.postForm.value;
    const postData = {
      ...formValue,
      status,
      tags: this.selectedTags()
    };

    const request = this.isEditMode() 
      ? this.apiService.updatePost(this.postId()!, postData as UpdatePostRequest)
      : this.apiService.createPost(postData as CreatePostRequest);

    request.pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Failed to save post:', err);
        this.error.set(err.message || 'Failed to save post. Please try again.');
        return of(null);
      }),
      finalize(() => this.setLoadingState({ saving: false }))
    ).subscribe(post => {
      if (post) {
        const message = this.isEditMode() ? 'Post updated successfully!' : 'Post created successfully!';
        this.successMessage.set(message);
        
        // Navigate after a short delay to show success message
        setTimeout(() => {
          if (status === 'published') {
            this.router.navigate(['/post', post.slug || post._id]);
          } else {
            this.router.navigate(['/drafts']);
          }
        }, 1000);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.postForm.controls).forEach(key => {
      this.postForm.get(key)?.markAsTouched();
    });
  }

  cancel(): void {
    const currentPost = this.post();
    if (this.isEditMode() && currentPost) {
      this.router.navigate(['/post', currentPost.slug || currentPost._id]);
    } else {
      this.router.navigate(['/']);
    }
  }

  // Helper methods for template
  getFieldError(fieldName: string): string | null {
    const field = this.postForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short (minimum ${field.errors['minlength'].requiredLength} characters)`;
      if (field.errors['maxlength']) return `${fieldName} is too long (maximum ${field.errors['maxlength'].requiredLength} characters)`;
      if (field.errors['url']) return `Please enter a valid URL`;
    }
    return null;
  }

  retryLoad(): void {
    this.error.set(null);
    this.loadInitialData();
    
    if (this.isEditMode() && this.postId()) {
      this.loadPost(this.postId()!);
    }
  }

  private setLoadingState(state: Partial<LoadingState>): void {
    this.loadingState.update(current => ({ ...current, ...state }));
  }
}
