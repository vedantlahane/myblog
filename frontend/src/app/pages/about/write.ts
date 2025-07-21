import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { CreatePostRequest, UpdatePostRequest, Post, Tag, Media } from '../../../types/api';

@Component({
  selector: 'app-write',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25 pb-12">
      <!-- Header -->
      <header class="bg-amber-100 border-4 border-amber-800 p-6 mb-8">
        <div class="max-w-6xl mx-auto">
          <div class="flex items-center justify-between">
            <div>
              <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-2">
                {{ isEditing() ? 'Edit Article' : 'New Article' }}
              </div>
              <h1 class="font-serif text-2xl md:text-3xl font-bold text-amber-900">
                {{ isEditing() ? 'Edit Your Story' : 'Share Your Story' }}
              </h1>
              <p class="text-amber-700 text-sm font-mono mt-1">
                {{ isEditing() ? 'Refine your thoughts and republish' : 'Craft something meaningful for the world' }}
              </p>
            </div>
            
            <!-- Auto-save Status -->
            <div class="text-right">
              @if (autoSaveStatus()) {
                <div class="flex items-center gap-2 text-sm font-mono text-amber-600 mb-2">
                  @if (autoSaving()) {
                    <div class="w-3 h-3 border border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Auto-saving...</span>
                  } @else if (lastSaved()) {
                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-green-600">Saved {{ getTimeAgo(lastSaved()!) }}</span>
                  }
                }
              }
              
              <div class="text-xs text-amber-600 font-mono">
                {{ wordCount() }} words • {{ readingTime() }} min read
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-6xl mx-auto px-4">
        <form [formGroup]="postForm" (ngSubmit)="onSubmit()">
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Main Content Area -->
            <div class="lg:col-span-2">
              <!-- Title -->
              <div class="mb-8">
                <label class="block text-amber-900 font-mono text-sm font-bold mb-3">
                  Article Title
                </label>
                <input
                  type="text"
                  formControlName="title"
                  placeholder="Write a compelling title..."
                  class="w-full px-6 py-4 text-2xl font-serif border-4 border-amber-300 focus:border-amber-600 focus:outline-none bg-white text-amber-900 placeholder-amber-400"
                  [class.border-red-400]="isFieldInvalid('title')"
                />
                
                @if (isFieldInvalid('title')) {
                  <p class="mt-2 text-red-600 text-xs font-mono">Title is required</p>
                }
                
                @if (postForm.get('title')?.value) {
                  <div class="mt-2 text-xs font-mono text-amber-600">
                    Slug: /post/{{ generateSlug(postForm.get('title')?.value || '') }}
                  </div>
                }
              </div>

              <!-- Excerpt -->
              <div class="mb-8">
                <label class="block text-amber-900 font-mono text-sm font-bold mb-3">
                  Excerpt <span class="text-amber-600 font-normal">(Optional but recommended)</span>
                </label>
                <textarea
                  formControlName="excerpt"
                  rows="3"
                  placeholder="A brief description that will appear in previews..."
                  class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm text-amber-900 placeholder-amber-400 resize-none"
                ></textarea>
                
                <div class="mt-2 text-xs font-mono text-amber-600">
                  {{ (postForm.get('excerpt')?.value || '').length }}/200 characters
                </div>
              </div>

              <!-- Cover Image -->
              <div class="mb-8">
                <label class="block text-amber-900 font-mono text-sm font-bold mb-3">
                  Cover Image <span class="text-amber-600 font-normal">(Optional)</span>
                </label>
                
                @if (coverImageUrl()) {
                  <div class="relative mb-4">
                    <img 
                      [src]="coverImageUrl()" 
                      alt="Cover image" 
                      class="w-full h-64 object-cover border-4 border-amber-300"
                    />
                    <button
                      type="button"
                      (click)="removeCoverImage()"
                      class="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                } @else {
                  <div class="border-4 border-dotted border-amber-300 p-8 text-center">
                    <input
                      #fileInput
                      type="file"
                      accept="image/*"
                      (change)="onImageSelect($event)"
                      class="hidden"
                    />
                    
                    @if (uploadingImage()) {
                      <div class="flex items-center justify-center gap-3 text-amber-700">
                        <div class="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                        <span class="font-mono text-sm">Uploading image...</span>
                      </div>
                    } @else {
                      <div>
                        <svg class="w-12 h-12 text-amber-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-amber-700 font-mono text-sm mb-2">Add a cover image</p>
                        <button
                          type="button"
                          (click)="fileInput.click()"
                          class="bg-amber-200 text-amber-900 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors border-2 border-amber-400"
                        >
                          Choose Image
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Content Editor -->
              <div class="mb-8">
                <label class="block text-amber-900 font-mono text-sm font-bold mb-3">
                  Article Content
                </label>
                
                <!-- Toolbar -->
                <div class="bg-amber-100 border-4 border-amber-300 border-b-2 p-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      (click)="formatText('bold')"
                      [class]="getToolbarButtonClass()"
                      title="Bold"
                    >
                      <strong>B</strong>
                    </button>
                    
                    <button
                      type="button"
                      (click)="formatText('italic')"
                      [class]="getToolbarButtonClass()"
                      title="Italic"
                    >
                      <em>I</em>
                    </button>
                    
                    <div class="w-px h-6 bg-amber-400"></div>
                    
                    <button
                      type="button"
                      (click)="formatText('heading')"
                      [class]="getToolbarButtonClass()"
                      title="Heading"
                    >
                      H
                    </button>
                    
                    <button
                      type="button"
                      (click)="formatText('quote')"
                      [class]="getToolbarButtonClass()"
                      title="Quote"
                    >
                      "
                    </button>
                    
                    <div class="w-px h-6 bg-amber-400"></div>
                    
                    <button
                      type="button"
                      (click)="formatText('list')"
                      [class]="getToolbarButtonClass()"
                      title="List"
                    >
                      •
                    </button>
                    
                    <button
                      type="button"
                      (click)="formatText('link')"
                      [class]="getToolbarButtonClass()"
                      title="Link"
                    >
                      🔗
                    </button>
                    
                    <div class="w-px h-6 bg-amber-400"></div>
                    
                    <span class="text-xs font-mono text-amber-600 ml-auto">
                      Tip: Use Markdown for formatting
                    </span>
                  </div>
                </div>
                
                <textarea
                  #contentEditor
                  formControlName="content"
                  rows="20"
                  placeholder="Start writing your story here...

You can use **bold**, *italic*, and other Markdown formatting.

# Heading 1
## Heading 2

> This is a quote

- List item
- Another item

[Link text](https://example.com)"
                  class="w-full px-6 py-4 border-4 border-amber-300 border-t-0 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm text-amber-900 placeholder-amber-400 resize-none"
                  [class.border-red-400]="isFieldInvalid('content')"
                  (keydown)="onKeyDown($event)"
                ></textarea>
                
                @if (isFieldInvalid('content')) {
                  <p class="mt-2 text-red-600 text-xs font-mono">Content is required</p>
                }
              </div>

              <!-- Preview -->
              @if (showPreview()) {
                <div class="mb-8 bg-white border-4 border-amber-300 p-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="font-serif text-xl font-bold text-amber-900">Preview</h3>
                    <button
                      type="button"
                      (click)="togglePreview()"
                      class="text-amber-600 hover:text-amber-800 font-mono text-sm"
                    >
                      Hide Preview
                    </button>
                  </div>
                  
                  <div 
                    class="prose prose-lg prose-amber max-w-none"
                    [innerHTML]="getPreviewContent()"
                  ></div>
                </div>
              }
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-1">
              <!-- Publish Settings -->
              <div class="bg-amber-50 border-4 border-amber-300 p-6 mb-8">
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Publish Settings</h3>
                
                <!-- Status -->
                <div class="mb-6">
                  <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                    Status
                  </label>
                  <select 
                    formControlName="status"
                    class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Now</option>
                  </select>
                </div>
                
                <!-- Action Buttons -->
                <div class="space-y-3">
                  @if (!showPreview()) {
                    <button
                      type="button"
                      (click)="togglePreview()"
                      class="w-full bg-amber-200 text-amber-900 py-3 px-4 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400"
                    >
                      Preview Article
                    </button>
                  }
                  
                  <button
                    type="button"
                    (click)="saveDraft()"
                    [disabled]="!postForm.get('title')?.value || saving()"
                    class="w-full bg-amber-100 text-amber-900 py-3 px-4 font-mono text-sm uppercase tracking-wider hover:bg-amber-200 transition-colors border-2 border-amber-300 disabled:opacity-50"
                  >
                    @if (saving()) {
                      Saving...
                    } @else {
                      Save Draft
                    }
                  </button>
                  
                  <button
                    type="submit"
                    [disabled]="postForm.invalid || saving()"
                    class="w-full bg-amber-800 text-amber-100 py-3 px-4 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 disabled:opacity-50"
                  >
                    @if (saving()) {
                      <div class="flex items-center justify-center gap-2">
                        <div class="w-4 h-4 border-2 border-amber-100 border-t-transparent rounded-full animate-spin"></div>
                        {{ postForm.get('status')?.value === 'published' ? 'Publishing...' : 'Saving...' }}
                      </div>
                    } @else {
                      {{ postForm.get('status')?.value === 'published' ? 'Publish Article' : 'Save Article' }}
                    }
                  </button>
                </div>
                
                @if (isEditing()) {
                  <div class="mt-4 pt-4 border-t border-amber-300">
                    <button
                      type="button"
                      (click)="deletePost()"
                      class="w-full bg-red-100 text-red-800 py-2 px-4 font-mono text-xs uppercase tracking-wider hover:bg-red-200 transition-colors border-2 border-red-300"
                    >
                      Delete Article
                    </button>
                  </div>
                }
              </div>

              <!-- Tags -->
              <div class="bg-amber-50 border-4 border-amber-300 p-6 mb-8">
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Tags</h3>
                
                <!-- Tag Input -->
                <div class="mb-4">
                  <input
                    #tagInput
                    type="text"
                    (keydown.enter)="addTag($event)"
                    (keydown.comma)="addTag($event)"
                    placeholder="Add tags (press Enter or comma)"
                    class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
                  />
                  <p class="text-xs font-mono text-amber-600 mt-1">
                    Press Enter or comma to add tags
                  </p>
                </div>
                
                <!-- Selected Tags -->
                @if (selectedTags().length > 0) {
                  <div class="flex flex-wrap gap-2 mb-4">
                    @for (tag of selectedTags(); track tag) {
                      <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-sm font-mono">
                        {{ tag }}
                        <button
                          type="button"
                          (click)="removeTag(tag)"
                          class="hover:text-amber-900"
                        >
                          ×
                        </button>
                      </span>
                    }
                  </div>
                }
                
                <!-- Popular Tags -->
                @if (popularTags().length > 0) {
                  <div>
                    <p class="text-sm font-mono text-amber-600 mb-2">Popular tags:</p>
                    <div class="flex flex-wrap gap-2">
                      @for (tag of popularTags().slice(0, 10); track tag._id) {
                        <button
                          type="button"
                          (click)="addPopularTag(tag.name)"
                          [disabled]="selectedTags().includes(tag.name)"
                          class="text-xs font-mono bg-amber-100 text-amber-700 px-2 py-1 hover:bg-amber-200 transition-colors border border-amber-400 disabled:opacity-50"
                        >
                          {{ tag.name }}
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Tips -->
              <div class="bg-amber-900 text-amber-100 border-4 border-amber-700 p-6">
                <h3 class="font-serif text-lg font-bold mb-4">Writing Tips</h3>
                
                <div class="space-y-3 text-sm">
                  <div class="flex items-start gap-2">
                    <span class="text-amber-400 mt-1">•</span>
                    <span>Write a compelling title that makes people want to read more</span>
                  </div>
                  
                  <div class="flex items-start gap-2">
                    <span class="text-amber-400 mt-1">•</span>
                    <span>Add an excerpt to give readers a preview of your content</span>
                  </div>
                  
                  <div class="flex items-start gap-2">
                    <span class="text-amber-400 mt-1">•</span>
                    <span>Use headings to structure your content and make it scannable</span>
                  </div>
                  
                  <div class="flex items-start gap-2">
                    <span class="text-amber-400 mt-1">•</span>
                    <span>Tags help readers find your content - use relevant ones</span>
                  </div>
                  
                  <div class="flex items-start gap-2">
                    <span class="text-amber-400 mt-1">•</span>
                    <span>Your work auto-saves every 30 seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* Custom prose styles for preview */
    .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
      font-family: 'Georgia', serif;
      font-weight: 700;
      color: #92400e;
      margin-top: 2em;
      margin-bottom: 1em;
    }

    .prose p {
      margin-bottom: 1.5em;
      line-height: 1.8;
      color: #92400e;
    }

    .prose blockquote {
      border-left: 4px solid #d97706;
      background: #fef3cd;
      padding: 1rem 1.5rem;
      margin: 2rem 0;
      font-style: italic;
      color: #b45309;
    }

    .prose code {
      background: #fef3cd;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-family: 'Monaco', monospace;
      font-size: 0.875em;
      color: #92400e;
    }

    .prose pre {
      background: #92400e;
      color: #fef3cd;
      padding: 1.5rem;
      overflow-x: auto;
      margin: 2rem 0;
      border-radius: 0.5rem;
    }

    .prose a {
      color: #b45309;
      text-decoration: underline;
    }

    .prose ul, .prose ol {
      padding-left: 2rem;
      margin-bottom: 1.5em;
    }

    .prose li {
      margin-bottom: 0.5em;
      color: #92400e;
    }

    /* Vintage paper texture */
    .bg-amber-50, .bg-white {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.02) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.02) 0%, transparent 50%);
    }

    /* Focus styles */
    textarea:focus, input:focus, select:focus {
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }
  `]
})
export class WriteComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  private autoSaveInterval?: number;
  
  // Reactive Signals
  saving = signal(false);
  autoSaving = signal(false);
  uploadingImage = signal(false);
  showPreview = signal(false);
  autoSaveStatus = signal(true);
  lastSaved = signal<Date | null>(null);
  
  isEditing = signal(false);
  editingPostId = signal<string>('');
  coverImageUrl = signal<string>('');
  selectedTags = signal<string[]>([]);
  popularTags = signal<Tag[]>([]);
  
  // Form
  postForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(5)]),
    content: new FormControl('', [Validators.required, Validators.minLength(50)]),
    excerpt: new FormControl(''),
    coverImage: new FormControl(''),
    status: new FormControl('draft')
  });

  // Computed values
  wordCount = computed(() => {
    const content = this.postForm.get('content')?.value || '';
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  });
  
  readingTime = computed(() => Math.ceil(this.wordCount() / 200));

  async ngOnInit() {
    // Check authentication
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/write' }
      });
      return;
    }

    // Load initial data
    await this.loadPopularTags();
    
    // Check if editing existing post
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.isEditing.set(true);
      this.editingPostId.set(postId);
      await this.loadPost(postId);
    }

    // Setup auto-save
    this.setupAutoSave();
    
    // Setup form subscriptions
    this.setupFormSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  private async loadPopularTags() {
    try {
      const tags = await this.apiService.getPopularTags();
      this.popularTags.set(tags);
    } catch (error) {
      console.error('Failed to load popular tags:', error);
    }
  }

  private async loadPost(postId: string) {
    try {
      const post = await this.apiService.getPostById(postId);
      
      this.postForm.patchValue({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        coverImage: post.coverImage || '',
        status: post.status
      });
      
      if (post.coverImage) {
        this.coverImageUrl.set(post.coverImage);
      }
      
      // Extract tags
      const tags = Array.isArray(post.tags) ? post.tags.map(tag => 
        typeof tag === 'string' ? tag : tag.name
      ) : [];
      this.selectedTags.set(tags);
      
    } catch (error) {
      console.error('Failed to load post:', error);
      this.router.navigate(['/']);
    }
  }

  private setupAutoSave() {
    this.autoSaveInterval = window.setInterval(() => {
      if (this.postForm.get('title')?.value && this.postForm.get('content')?.value) {
        this.autoSaveDraft();
      }
    }, 30000); // Auto-save every 30 seconds
  }

  private setupFormSubscriptions() {
    // Watch form changes for auto-save status
    const formSub = this.postForm.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(() => {
      this.autoSaveStatus.set(true);
    });
    
    this.subscriptions.push(formSub);
  }

  private async autoSaveDraft() {
    if (this.saving() || this.autoSaving()) return;
    
    try {
      this.autoSaving.set(true);
      
      const formValue = this.postForm.value;
      const draftData = {
        title: formValue.title || '',
        content: formValue.content || '',
        excerpt: formValue.excerpt || '',
        coverImage: this.coverImageUrl() || '',
        tags: this.selectedTags(),
        autoSave: true
      };

      if (this.isEditing()) {
        await this.apiService.updateDraft(this.editingPostId(), draftData);
      } else {
        await this.apiService.createDraft(draftData);
      }
      
      this.lastSaved.set(new Date());
      
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      this.autoSaving.set(false);
    }
  }

  async onSubmit() {
    if (this.postForm.invalid) return;
    
    try {
      this.saving.set(true);
      
      const formValue = this.postForm.value;
      const postData: CreatePostRequest | UpdatePostRequest = {
        title: formValue.title!,
        content: formValue.content!,
        excerpt: formValue.excerpt || undefined,
        coverImage: this.coverImageUrl() || undefined,
        tags: this.selectedTags(),
        status: formValue.status as 'draft' | 'published'
      };

      let savedPost: Post;
      
      if (this.isEditing()) {
        savedPost = await this.apiService.updatePost(this.editingPostId(), postData);
      } else {
        savedPost = await this.apiService.createPost(postData as CreatePostRequest);
      }
      
      // Navigate to the post or back to drafts
      if (formValue.status === 'published') {
        this.router.navigate(['/post', savedPost.slug]);
      } else {
        this.router.navigate(['/drafts']);
      }
      
    } catch (error) {
      console.error('Failed to save post:', error);
      // Show error message to user
    } finally {
      this.saving.set(false);
    }
  }

  async saveDraft() {
    if (!this.postForm.get('title')?.value) return;
    
    try {
      this.saving.set(true);
      
      const formValue = this.postForm.value;
      const draftData = {
        title: formValue.title!,
        content: formValue.content || '',
        excerpt: formValue.excerpt || '',
        coverImage: this.coverImageUrl() || '',
        tags: this.selectedTags(),
        autoSave: false
      };

      if (this.isEditing()) {
        await this.apiService.updateDraft(this.editingPostId(), draftData);
      } else {
        await this.apiService.createDraft(draftData);
      }
      
      this.router.navigate(['/drafts']);
      
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deletePost() {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    
    try {
      await this.apiService.deletePost(this.editingPostId());
      this.router.navigate(['/drafts']);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  }

  // Image handling
  async onImageSelect(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      this.uploadingImage.set(true);
      
      const media = await this.apiService.uploadMedia(file, {
        altText: 'Cover image',
        description: 'Article cover image'
      });
      
      this.coverImageUrl.set(media.url);
      this.postForm.patchValue({ coverImage: media.url });
      
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      this.uploadingImage.set(false);
    }
  }

  removeCoverImage() {
    this.coverImageUrl.set('');
    this.postForm.patchValue({ coverImage: '' });
  }

  // Tag management
  addTag(event: any) {
    event.preventDefault();
    const input = event.target;
    const tag = input.value.trim().toLowerCase();
    
    if (tag && !this.selectedTags().includes(tag)) {
      this.selectedTags.update(tags => [...tags, tag]);
      input.value = '';
    }
  }

  removeTag(tag: string) {
    this.selectedTags.update(tags => tags.filter(t => t !== tag));
  }

  addPopularTag(tagName: string) {
    const tag = tagName.toLowerCase();
    if (!this.selectedTags().includes(tag)) {
      this.selectedTags.update(tags => [...tags, tag]);
    }
  }

  // Editor toolbar
  formatText(format: string) {
    // Simple markdown formatting helpers
    const textarea = document.querySelector('textarea[formControlName="content"]') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let replacement = '';
    
    switch (format) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'heading':
        replacement = `\n## ${selectedText}\n`;
        break;
      case 'quote':
        replacement = `\n> ${selectedText}\n`;
        break;
      case 'list':
        replacement = `\n- ${selectedText}\n`;
        break;
      case 'link':
        replacement = `[${selectedText}](url)`;
        break;
    }
    
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    this.postForm.patchValue({ content: newValue });
    
    // Refocus and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    });
  }

  onKeyDown(event: KeyboardEvent) {
    // Handle common keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          this.formatText('bold');
          break;
        case 'i':
          event.preventDefault();
          this.formatText('italic');
          break;
        case 's':
          event.preventDefault();
          this.saveDraft();
          break;
      }
    }
  }

  // Preview
  togglePreview() {
    this.showPreview.update(current => !current);
  }

  getPreviewContent(): string {
    const content = this.postForm.get('content')?.value || '';
    return this.markdownToHtml(content);
  }

  private markdownToHtml(markdown: string): string {
    // Simple markdown parser - in production, use a proper library like marked.js
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>')
      .replace(/^(.*)/, '<p>$1</p>');
  }

  // Helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.postForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  getToolbarButtonClass(): string {
    return 'px-3 py-1 bg-amber-200 text-amber-900 hover:bg-amber-300 transition-colors border border-amber-400 font-mono text-sm';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
}
