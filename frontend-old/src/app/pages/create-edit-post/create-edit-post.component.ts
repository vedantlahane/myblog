// pages/create-edit-post/create-edit-post.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-create-edit-post',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule
  ],
  templateUrl: './create-edit-post.component.html',
  styleUrls: ['./create-edit-post.component.css']
})
export class CreateEditPostComponent implements OnInit {
  postForm: FormGroup;
  isEditMode: boolean = false;
  postId?: number;
  isSubmitting: boolean = false;
  thumbnailPreview?: string;
  availableTags: string[] = [
    'Technology', 'Programming', 'Web Development', 'Angular',
    'JavaScript', 'TypeScript', 'Design', 'UI/UX'
  ];

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      excerpt: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', Validators.required],
      thumbnail: [null],
      tags: [[]],
      status: ['draft']
    });
  }

  ngOnInit() {
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

  loadPost(id: number) {
    this.blogService.getPost(id).subscribe({
      next: (post) => {
        this.postForm.patchValue({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          tags: post.tags,
          status: post.status
        });
        this.thumbnailPreview = post.thumbnail;
      },
      error: (error) => {
        console.error('Error loading post:', error);
      }
    });
  }

  onThumbnailChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.thumbnailPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
      
      this.postForm.patchValue({
        thumbnail: file
      });
    }
  }

  toggleTag(tag: string) {
    const currentTags = this.postForm.get('tags')?.value || [];
    const index = currentTags.indexOf(tag);
    
    if (index === -1) {
      currentTags.push(tag);
    } else {
      currentTags.splice(index, 1);
    }
    
    this.postForm.patchValue({ tags: currentTags });
  }

  onSubmit() {
    if (this.postForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const formValue = this.postForm.value;

    // Append all form fields to FormData
    Object.keys(formValue).forEach(key => {
      if (key === 'thumbnail' && formValue[key]) {
        formData.append(key, formValue[key]);
      } else if (key === 'tags') {
        formData.append(key, JSON.stringify(formValue[key]));
      } else {
        formData.append(key, formValue[key]);
      }
    });

    const request = this.isEditMode
      ? this.blogService.updatePost(this.postId!, formData)
      : this.blogService.createPost(formData);

    request.subscribe({
      next: (response) => {
        this.router.navigate(['/blog', response.id]);
      },
      error: (error) => {
        console.error('Error saving post:', error);
        this.isSubmitting = false;
      }
    });
  }
}