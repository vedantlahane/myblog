import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { User, Post, UpdateProfileRequest } from '../../../types/api';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      @if (loading()) {
        <div class="flex justify-center items-center py-16">
          <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-lg">
            <div class="w-8 h-8 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
            Loading profile...
          </div>
        </div>
      } @else if (error()) {
        <div class="text-center py-16">
          <div class="inline-block border-4 border-red-300 p-8 bg-red-50">
            <div class="text-red-600 font-mono text-sm mb-2">PROFILE NOT FOUND</div>
            <p class="text-red-700 mb-4">{{ error() }}</p>
            <a routerLink="/" class="inline-block bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors">
              Back to Home
            </a>
          </div>
        </div>
      } @else if (user()) {
        <!-- Profile Header -->
        <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
          <div class="max-w-4xl mx-auto">
            <div class="flex flex-col md:flex-row items-start gap-8">
              <!-- Avatar Section -->
              <div class="flex flex-col items-center">
                @if (user()?.avatarUrl) {
                  <img 
                    [src]="user()?.avatarUrl" 
                    [alt]="user()?.name"
                    class="w-32 h-32 rounded-full border-4 border-amber-600 shadow-lg"
                  >
                } @else {
                  <div class="w-32 h-32 bg-amber-200 border-4 border-amber-600 rounded-full flex items-center justify-center shadow-lg">
                    <span class="text-4xl font-bold text-amber-800">{{ getUserInitials() }}</span>
                  </div>
                }
                
                <!-- Avatar Upload for own profile -->
                @if (isOwnProfile() && !editingProfile()) {
                  <div class="mt-4 flex gap-2">
                    <input
                      #avatarInput
                      type="file"
                      accept="image/*"
                      (change)="onAvatarSelect($event)"
                      class="hidden"
                    />
                    <button
                      (click)="avatarInput.click()"
                      [disabled]="uploadingAvatar()"
                      class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400 disabled:opacity-50"
                    >
                      @if (uploadingAvatar()) {
                        Uploading...
                      } @else {
                        Change Photo
                      }
                    </button>
                    
                    @if (user()?.avatarUrl) {
                      <button
                        (click)="removeAvatar()"
                        class="text-red-600 hover:text-red-800 font-mono text-xs uppercase tracking-wider transition-colors"
                      >
                        Remove
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Profile Info -->
              <div class="flex-1">
                @if (editingProfile()) {
                  <!-- Edit Profile Form -->
                  <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4">
                    <div>
                      <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Name</label>
                      <input
                        type="text"
                        formControlName="name"
                        class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-serif text-xl"
                        [class.border-red-400]="isFieldInvalid('name')"
                      />
                      @if (isFieldInvalid('name')) {
                        <p class="mt-1 text-red-600 text-xs font-mono">Name is required</p>
                      }
                    </div>

                    <div>
                      <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Bio</label>
                      <textarea
                        formControlName="bio"
                        rows="4"
                        placeholder="Tell us about yourself..."
                        class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white resize-none"
                      ></textarea>
                      <div class="mt-1 text-xs font-mono text-amber-600">
                        {{ (profileForm.get('bio')?.value || '').length }}/300 characters
                      </div>
                    </div>

                    <div class="flex gap-3">
                      <button
                        type="submit"
                        [disabled]="profileForm.invalid || savingProfile()"
                        class="bg-amber-800 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 disabled:opacity-50"
                      >
                        @if (savingProfile()) {
                          Saving...
                        } @else {
                          Save Changes
                        }
                      </button>
                      
                      <button
                        type="button"
                        (click)="cancelEdit()"
                        class="bg-amber-200 text-amber-800 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                } @else {
                  <!-- Profile Display -->
                  <div class="border-2 border-dotted border-amber-700 p-6">
                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-2">
                          {{ user()?.name }}
                          @if (user()?.isVerified) {
                            <svg class="inline w-6 h-6 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                          }
                        </h1>
                        
                        @if (user()?.isAdmin) {
                          <div class="inline-block bg-red-100 text-red-800 px-3 py-1 text-xs font-mono uppercase mb-2">
                            Administrator
                          </div>
                        }
                      </div>

                      <!-- Action Buttons -->
                      <div class="flex gap-3">
                        @if (isOwnProfile()) {
                          <button
                            (click)="startEditing()"
                            class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400"
                          >
                            Edit Profile
                          </button>
                        } @else if (isAuthenticated()) {
                          <button
                            (click)="toggleFollow()"
                            [disabled]="followLoading()"
                            [class]="getFollowButtonClass()"
                          >
                            @if (followLoading()) {
                              <div class="flex items-center gap-2">
                                <div class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                                Loading...
                              </div>
                            } @else {
                              {{ isFollowing() ? 'Following' : 'Follow' }}
                            }
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Bio -->
                    @if (user()?.bio) {
                      <p class="text-amber-800 text-lg leading-relaxed mb-6 italic">
                        "{{ user()?.bio }}"
                      </p>
                    }

                    <!-- Stats -->
                    <div class="flex items-center gap-8 text-sm font-mono text-amber-600 mb-4">
                      <div class="text-center">
                        <div class="text-2xl font-bold text-amber-900">{{ userPosts().length }}</div>
                        <div>Articles</div>
                      </div>
                      <div class="text-center">
                        <button
                          (click)="showFollowers()"
                          class="hover:text-amber-800 transition-colors"
                        >
                          <div class="text-2xl font-bold text-amber-900">{{ user()?.followerCount || followers().length }}</div>
                          <div>Followers</div>
                        </button>
                      </div>
                      <div class="text-center">
                        <button
                          (click)="showFollowing()"
                          class="hover:text-amber-800 transition-colors"
                        >
                          <div class="text-2xl font-bold text-amber-900">{{ user()?.followingCount || following().length }}</div>
                          <div>Following</div>
                        </button>
                      </div>
                      <div class="text-center">
                        <div class="text-2xl font-bold text-amber-900">{{ formatDate(user()?.createdAt || '') }}</div>
                        <div>Joined</div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </header>

        <!-- Profile Navigation -->
        <section class="mb-8">
          <div class="bg-amber-50 border-4 border-amber-300 p-4">
            <nav class="flex justify-center">
              <div class="flex gap-6">
                <button
                  (click)="setActiveTab('posts')"
                  [class]="getTabClass('posts')"
                >
                  Articles ({{ userPosts().length }})
                </button>
                
                @if (showFollowersModal() || showFollowingModal()) {
                  <button
                    (click)="setActiveTab('followers')"
                    [class]="getTabClass('followers')"
                  >
                    Followers ({{ followers().length }})
                  </button>
                  
                  <button
                    (click)="setActiveTab('following')"
                    [class]="getTabClass('following')"
                  >
                    Following ({{ following().length }})
                  </button>
                }
              </div>
            </nav>
          </div>
        </section>

        <!-- Tab Content -->
        <section class="mb-12">
          @if (activeTab() === 'posts') {
            <!-- User Posts -->
            @if (postsLoading()) {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (i of [1,2,3,4,5,6]; track i) {
                  <div class="bg-amber-50 border-2 border-amber-200 p-6 animate-pulse">
                    <div class="h-6 bg-amber-200 rounded mb-4"></div>
                    <div class="h-4 bg-amber-200 rounded mb-2"></div>
                    <div class="h-4 bg-amber-200 rounded mb-2"></div>
                    <div class="h-4 bg-amber-200 rounded w-2/3"></div>
                  </div>
                }
              </div>
            } @else if (userPosts().length === 0) {
              <div class="text-center py-16">
                <div class="inline-block border-4 border-amber-300 p-12 bg-amber-100">
                  <div class="text-amber-600 font-mono text-lg mb-4">📝 NO ARTICLES YET</div>
                  <p class="text-amber-700 mb-6">
                    @if (isOwnProfile()) {
                      You haven't published any articles yet. Start writing to share your thoughts!
                    } @else {
                      {{ user()?.name }} hasn't published any articles yet.
                    }
                  </p>
                  @if (isOwnProfile()) {
                    <a
                      routerLink="/write"
                      class="inline-block bg-amber-800 text-amber-100 px-8 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700"
                    >
                      Write Your First Article
                    </a>
                  }
                </div>
              </div>
            } @else {
              <!-- Posts Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (post of userPosts(); track post._id) {
                  <article class="bg-amber-50 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 group">
                    @if (post.coverImage) {
                      <img 
                        [src]="post.coverImage" 
                        [alt]="post.title"
                        class="w-full h-48 object-cover border-b-2 border-amber-200 group-hover:sepia-[20%] transition-all"
                      >
                    }
                    
                    <div class="p-6">
                      @if (post.status === 'draft') {
                        <div class="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 text-xs font-mono uppercase mb-3">
                          Draft
                        </div>
                      }
                      
                      <h3 class="font-serif text-xl font-bold text-amber-900 mb-3 leading-tight">
                        <a 
                          [routerLink]="['/post', post.slug]"
                          class="hover:text-amber-700 transition-colors"
                        >
                          {{ post.title }}
                        </a>
                      </h3>
                      
                      @if (post.excerpt) {
                        <p class="text-amber-700 text-sm mb-4 leading-relaxed line-clamp-3">
                          {{ post.excerpt }}
                        </p>
                      }
                      
                      <!-- Meta Info -->
                      <div class="flex items-center justify-between text-xs font-mono text-amber-600">
                        <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
                        <div class="flex items-center gap-3">
                          <span>{{ post.readingTime || calculateReadingTime(post.content) }} min</span>
                          <div class="flex items-center gap-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                            </svg>
                            <span>{{ post.likeCount || 0 }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                }
              </div>
            }
          } @else if (activeTab() === 'followers') {
            <!-- Followers List -->
            @if (followers().length === 0) {
              <div class="text-center py-16">
                <div class="inline-block border-4 border-amber-300 p-8 bg-amber-100">
                  <div class="text-amber-600 font-mono text-lg mb-2">👥 NO FOLLOWERS YET</div>
                  <p class="text-amber-700">
                    @if (isOwnProfile()) {
                      Share great content to build your following!
                    } @else {
                      {{ user()?.name }} doesn't have any followers yet.
                    }
                  </p>
                </div>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (follower of followers(); track follower._id) {
                  <div class="bg-amber-50 border-2 border-amber-200 p-4 hover:border-amber-400 transition-colors">
                    <div class="flex items-center gap-3">
                      @if (follower.avatarUrl) {
                        <img 
                          [src]="follower.avatarUrl" 
                          [alt]="follower.name"
                          class="w-12 h-12 rounded-full border-2 border-amber-300"
                        >
                      } @else {
                        <div class="w-12 h-12 bg-amber-200 border-2 border-amber-300 rounded-full flex items-center justify-center font-bold text-amber-800">
                          {{ getInitials(follower.name) }}
                        </div>
                      }
                      
                      <div class="flex-1">
                        <h4 class="font-bold text-amber-900">
                          <a [routerLink]="['/user', follower._id]" class="hover:text-amber-700">
                            {{ follower.name }}
                          </a>
                        </h4>
                        @if (follower.bio) {
                          <p class="text-amber-700 text-sm line-clamp-1">{{ follower.bio }}</p>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          } @else if (activeTab() === 'following') {
            <!-- Following List -->
            @if (following().length === 0) {
              <div class="text-center py-16">
                <div class="inline-block border-4 border-amber-300 p-8 bg-amber-100">
                  <div class="text-amber-600 font-mono text-lg mb-2">👤 NOT FOLLOWING ANYONE YET</div>
                  <p class="text-amber-700">
                    @if (isOwnProfile()) {
                      Discover interesting authors to follow!
                    } @else {
                      {{ user()?.name }} isn't following anyone yet.
                    }
                  </p>
                </div>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (followedUser of following(); track followedUser._id) {
                  <div class="bg-amber-50 border-2 border-amber-200 p-4 hover:border-amber-400 transition-colors">
                    <div class="flex items-center gap-3">
                      @if (followedUser.avatarUrl) {
                        <img 
                          [src]="followedUser.avatarUrl" 
                          [alt]="followedUser.name"
                          class="w-12 h-12 rounded-full border-2 border-amber-300"
                        >
                      } @else {
                        <div class="w-12 h-12 bg-amber-200 border-2 border-amber-300 rounded-full flex items-center justify-center font-bold text-amber-800">
                          {{ getInitials(followedUser.name) }}
                        </div>
                      }
                      
                      <div class="flex-1">
                        <h4 class="font-bold text-amber-900">
                          <a [routerLink]="['/user', followedUser._id]" class="hover:text-amber-700">
                            {{ followedUser.name }}
                          </a>
                        </h4>
                        @if (followedUser.bio) {
                          <p class="text-amber-700 text-sm line-clamp-1">{{ followedUser.bio }}</p>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Vintage paper texture */
    article {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Avatar hover effect */
    .avatar-container:hover {
      transform: scale(1.02);
      transition: transform 0.3s ease-in-out;
    }

    /* Profile card shadow */
    .profile-card {
      box-shadow: 0 8px 16px -4px rgba(146, 64, 14, 0.2);
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Reactive Signals
  loading = signal(false);
  postsLoading = signal(false);
  uploadingAvatar = signal(false);
  savingProfile = signal(false);
  followLoading = signal(false);
  error = signal('');
  
  user = signal<User | null>(null);
  currentUser = signal<User | null>(null);
  userPosts = signal<Post[]>([]);
  followers = signal<User[]>([]);
  following = signal<User[]>([]);
  
  editingProfile = signal(false);
  activeTab = signal<'posts' | 'followers' | 'following'>('posts');
  showFollowersModal = signal(false);
  showFollowingModal = signal(false);
  isFollowing = signal(false);

  // Profile Form
  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    bio: new FormControl('', [Validators.maxLength(300)])
  });

  // Computed values
  isOwnProfile = computed(() => {
    const user = this.user();
    const currentUser = this.currentUser();
    return user && currentUser && user._id === currentUser._id;
  });

  async ngOnInit() {
    await this.loadCurrentUser();
    
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      await this.loadUserProfile(userId);
    }
  }

  private async loadCurrentUser() {
    if (this.apiService.isAuthenticated()) {
      try {
        const currentUser = await this.apiService.getCurrentUser();
        this.currentUser.set(currentUser);
      } catch (error) {
        console.error('Failed to load current user:', error);
      }
    }
  }

  private async loadUserProfile(userId: string) {
    try {
      this.loading.set(true);
      this.error.set('');

      const user = await this.apiService.getUserById(userId);
      this.user.set(user);

      // Load user's posts
      await this.loadUserPosts(userId);

      // Check if following (for authenticated users)
      if (this.isAuthenticated() && !this.isOwnProfile()) {
        await this.checkFollowStatus(userId);
      }

    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.error.set('Profile not found or failed to load');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadUserPosts(userId: string) {
    try {
      this.postsLoading.set(true);
      const posts = await this.apiService.getUserPosts(userId);
      this.userPosts.set(posts);
    } catch (error) {
      console.error('Failed to load user posts:', error);
      this.userPosts.set([]);
    } finally {
      this.postsLoading.set(false);
    }
  }

  private async checkFollowStatus(userId: string) {
    try {
      // This would need an API method to check follow status
      // For now, we'll assume not following
      this.isFollowing.set(false);
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  }

  // Profile Editing
  startEditing() {
    const user = this.user();
    if (!user) return;

    this.profileForm.patchValue({
      name: user.name,
      bio: user.bio || ''
    });
    this.editingProfile.set(true);
  }

  cancelEdit() {
    this.editingProfile.set(false);
    this.profileForm.reset();
  }

  async saveProfile() {
    if (this.profileForm.invalid) return;

    try {
      this.savingProfile.set(true);

      const formValue = this.profileForm.value;
      const updateData: UpdateProfileRequest = {
        name: formValue.name!,
        bio: formValue.bio || undefined
      };

      const updatedUser = await this.apiService.updateProfile(updateData);
      this.user.set(updatedUser);
      this.currentUser.set(updatedUser);
      this.editingProfile.set(false);

    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      this.savingProfile.set(false);
    }
  }

  // Avatar Management
  async onAvatarSelect(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      this.uploadingAvatar.set(true);
      
      const result = await this.apiService.uploadAvatar(file);
      
      // Update user avatar
      this.user.update(current => 
        current ? { ...current, avatarUrl: result.avatarUrl } : current
      );
      
      if (this.currentUser()) {
        this.currentUser.update(current => 
          current ? { ...current, avatarUrl: result.avatarUrl } : current
        );
      }

    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      this.uploadingAvatar.set(false);
    }
  }

  async removeAvatar() {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;

    try {
      await this.apiService.deleteAvatar();
      
      // Update user avatar
      this.user.update(current => 
        current ? { ...current, avatarUrl: undefined } : current
      );
      
      if (this.currentUser()) {
        this.currentUser.update(current => 
          current ? { ...current, avatarUrl: undefined } : current
        );
      }

    } catch (error) {
      console.error('Failed to remove avatar:', error);
    }
  }

  // Follow/Unfollow
  async toggleFollow() {
    const userId = this.user()?._id;
    if (!userId || !this.isAuthenticated()) return;

    try {
      this.followLoading.set(true);

      if (this.isFollowing()) {
        await this.apiService.unfollowUser(userId);
        this.isFollowing.set(false);
        
        // Update follower count
        this.user.update(current => 
          current ? { ...current, followerCount: (current.followerCount || 0) - 1 } : current
        );
      } else {
        await this.apiService.followUser(userId);
        this.isFollowing.set(true);
        
        // Update follower count
        this.user.update(current => 
          current ? { ...current, followerCount: (current.followerCount || 0) + 1 } : current
        );
      }

    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      this.followLoading.set(false);
    }
  }

  // Followers/Following
  async showFollowers() {
    const userId = this.user()?._id;
    if (!userId) return;

    try {
      const followers = await this.apiService.getFollowers(userId);
      this.followers.set(followers);
      this.showFollowersModal.set(true);
      this.setActiveTab('followers');
    } catch (error) {
      console.error('Failed to load followers:', error);
    }
  }

  async showFollowing() {
    const userId = this.user()?._id;
    if (!userId) return;

    try {
      const following = await this.apiService.getFollowing(userId);
      this.following.set(following);
      this.showFollowingModal.set(true);
      this.setActiveTab('following');
    } catch (error) {
      console.error('Failed to load following:', error);
    }
  }

  // Tab Management
  setActiveTab(tab: 'posts' | 'followers' | 'following') {
    this.activeTab.set(tab);
  }

  getTabClass(tab: 'posts' | 'followers' | 'following'): string {
    const baseClass = "px-6 py-3 font-mono text-sm uppercase tracking-wider border-2 transition-colors";
    return this.activeTab() === tab
      ? `${baseClass} bg-amber-800 text-amber-100 border-amber-700`
      : `${baseClass} bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:border-amber-400`;
  }

  getFollowButtonClass(): string {
    const baseClass = "px-4 py-2 font-mono text-sm uppercase tracking-wider transition-colors border-2 disabled:opacity-50";
    return this.isFollowing()
      ? `${baseClass} bg-green-100 text-green-800 border-green-300 hover:bg-green-200`
      : `${baseClass} bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200`;
  }

  // Helper Methods
  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getUserInitials(): string {
    const user = this.user();
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  }

  calculateReadingTime(content: string): number {
    if (!content) return 1;
    const words = content.split(' ').length;
    return Math.ceil(words / 200);
  }
}
