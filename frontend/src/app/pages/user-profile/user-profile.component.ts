// pages/user-profile/user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { BlogService } from '../../services/blog.service';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    BlogCardComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  activeTab: 'profile' | 'posts' | 'settings' = 'profile';
  profileForm: FormGroup;
  settingsForm: FormGroup;
  userPosts: any[] = [];
  isLoading = true;
  avatarPreview?: string;
  saveSuccess = false;
  saveError = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private blogService: BlogService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      bio: [''],
      twitter: [''],
      linkedin: [''],
      github: ['']
    });

    this.settingsForm = this.fb.group({
      emailNotifications: [true],
      newsletterSubscription: [true],
      twoFactorAuth: [false]
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserPosts();
  }

  loadUserProfile() {
    this.userService.getCurrentUser().subscribe({
      next: (user: UserProfile) => {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          bio: user.bio,
          twitter: user.socialLinks.twitter,
          linkedin: user.socialLinks.linkedin,
          github: user.socialLinks.github
        });
        this.avatarPreview = user.avatar;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoading = false;
      }
    });
  }

  loadUserPosts() {
    this.blogService.getUserPosts().subscribe({
      next: (posts) => {
        this.userPosts = posts;
      },
      error: (error) => console.error('Error loading user posts:', error)
    });
  }

  onAvatarChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
      
      this.userService.updateAvatar(file).subscribe({
        next: (response) => {
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 3000);
        },
        error: (error) => {
          this.saveError = 'Failed to update avatar';
          setTimeout(() => this.saveError = '', 3000);
        }
      });
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    const profileData = {
      ...this.profileForm.value,
      socialLinks: {
        twitter: this.profileForm.value.twitter,
        linkedin: this.profileForm.value.linkedin,
        github: this.profileForm.value.github
      }
    };

    this.userService.updateProfile(profileData).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (error) => {
        this.saveError = 'Failed to update profile';
        setTimeout(() => this.saveError = '', 3000);
      }
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) return;

    this.userService.updateSettings(this.settingsForm.value).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (error) => {
        this.saveError = 'Failed to update settings';
        setTimeout(() => this.saveError = '', 3000);
      }
    });
  }

  deletePost(postId: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.blogService.deletePost(postId).subscribe({
        next: () => {
          this.userPosts = this.userPosts.filter(post => post.id !== postId);
        },
        error: (error) => console.error('Error deleting post:', error)
      });
    }
  }
}