import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { User, Post } from '../../../types/api';
// import { PostCardComponent } from '../../components/post-card/post-card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule], // PostCardComponent
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  posts: Post[] = [];
  loading = false;
  error: string | null = null;
  isOwnProfile = false;
  isFollowing = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.loadUserProfile(userId);
      }
    });
  }

  private loadUserProfile(userId: string) {
    this.loading = true;
    this.error = null;

    // Load user information
    this.apiService.getUserById(userId).subscribe({
      next: (user: User) => {
        this.user = user;
        this.loadUserPosts(userId);
        this.checkIfOwnProfile();
        this.checkFollowingStatus();
      },
      error: (err: any) => {
        this.error = 'User not found';
        this.loading = false;
      }
    });
  }

  private loadUserPosts(userId: string) {
    this.apiService.getPosts({ author: userId }).subscribe({
      next: (response: any) => {
        this.posts = response.data || response;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load user posts';
        this.loading = false;
      }
    });
  }

  private checkIfOwnProfile() {
    // Check if viewing own profile
    this.apiService.getCurrentUser().subscribe({
      next: (currentUser: User) => {
        this.isOwnProfile = currentUser._id === this.user?._id;
      },
      error: () => {
        this.isOwnProfile = false;
      }
    });
  }

  private checkFollowingStatus() {
    if (!this.isOwnProfile && this.user) {
      // Check if already following this user
      // This would need to be implemented in the API service
      this.isFollowing = false;
    }
  }

  followUser() {
    if (!this.user) return;

    this.apiService.followUser(this.user._id).subscribe({
      next: () => {
        this.isFollowing = true;
        if (this.user) {
          this.user.followerCount = (this.user.followerCount || 0) + 1;
        }
      },
      error: (err: any) => {
        console.error('Failed to follow user:', err);
      }
    });
  }

  unfollowUser() {
    if (!this.user) return;

    this.apiService.unfollowUser(this.user._id).subscribe({
      next: () => {
        this.isFollowing = false;
        if (this.user) {
          this.user.followerCount = Math.max((this.user.followerCount || 0) - 1, 0);
        }
      },
      error: (err: any) => {
        console.error('Failed to unfollow user:', err);
      }
    });
  }

  editProfile() {
    this.router.navigate(['/settings/profile']);
  }
}
