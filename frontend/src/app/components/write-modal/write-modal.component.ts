import { Component, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Post, Tag, Category, CreatePostRequest } from '../../../types/api';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-write-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './write-modal.component.html',
  styles: [`
    .modal-backdrop {
      backdrop-filter: blur(4px);
    }
  `]
})
export class WriteModalComponent implements OnInit {
  private apiService = inject(ApiService);
  private formBuilder = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  @Output() close = new EventEmitter<void>();
  @Output() postCreated = new EventEmitter<Post>();

  // State signals
  selectedTags = signal<string[]>([]);
  availableTags = signal<Tag[]>([]);
  availableCategories = signal<Category[]>([]);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Form
  postForm: FormGroup;

  constructor() {
    this.postForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      excerpt: [''],
      content: ['', [Validators.required, Validators.minLength(10)]],
      coverImage: [''],
      category: [''],
      status: ['draft', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFormData();
    // Focus on title input when modal opens
    setTimeout(() => {
      const titleInput = document.querySelector('input[formControlName="title"]') as HTMLInputElement;
      titleInput?.focus();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFormData(): void {
    // Load tags and categories
    forkJoin({
      tags: this.apiService.getTags().pipe(catchError(() => of([]))),
      categories: this.apiService.getCategories().pipe(catchError(() => of([])))
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe(({ tags, categories }) => {
      this.availableTags.set(tags);
      this.availableCategories.set(categories);
    });
  }

  addTag(tagName: string, inputElement: HTMLInputElement): void {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !this.selectedTags().includes(trimmedTag) && this.selectedTags().length < 5) {
      this.selectedTags.update(tags => [...tags, trimmedTag]);
      inputElement.value = '';
    }
  }

  selectTag(tagName: string): void {
    if (!this.selectedTags().includes(tagName) && this.selectedTags().length < 5) {
      this.selectedTags.update(tags => [...tags, tagName]);
    }
  }

  removeTag(tagName: string): void {
    this.selectedTags.update(tags => tags.filter(tag => tag !== tagName));
  }

  isTagSelected(tagName: string): boolean {
    return this.selectedTags().includes(tagName);
  }

  onSubmit(): void {
    if (this.postForm.invalid || this.isSubmitting()) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.postForm.value;
    const postData: CreatePostRequest = {
      title: formValue.title,
      content: formValue.content,
      excerpt: formValue.excerpt || undefined,
      coverImage: formValue.coverImage || undefined,
      tags: this.selectedTags(),
      status: formValue.status
    };

    this.apiService.createPost(postData).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (post) => {
        this.postCreated.emit(post);
        this.close.emit();
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Failed to create post. Please try again.');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.postForm.controls).forEach(key => {
      this.postForm.get(key)?.markAsTouched();
    });
  }
}
