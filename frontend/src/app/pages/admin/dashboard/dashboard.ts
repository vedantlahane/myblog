import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';

interface DashboardStats {
  totalPosts: number;
  totalUsers: number;
  totalComments: number;
  totalViews: number;
  postsThisMonth: number;
  usersThisMonth: number;
  commentsThisMonth: number;
  viewsThisMonth: number;
}

interface RecentActivity {
  id: string;
  type: 'post' | 'user' | 'comment';
  title: string;
  author: string;
  date: string;
  status?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      <!-- Dashboard Header -->
      <header class="bg-amber-100 border-4 border-amber-300 p-6">
        <div class="text-center border-2 border-dotted border-amber-400 p-4">
          <h1 class="font-serif text-2xl md:text-3xl font-bold text-amber-900 mb-2">
            Admin Dashboard
          </h1>
          <p class="text-amber-700 font-mono text-sm">
            Welcome back! Here's what's happening with your blog.
          </p>
        </div>
      </header>

      @if (loading()) {
        <!-- Loading State -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-amber-50 border-2 border-amber-200 p-6 animate-pulse">
              <div class="h-12 bg-amber-200 rounded mb-4"></div>
              <div class="h-6 bg-amber-200 rounded mb-2"></div>
              <div class="h-4 bg-amber-200 rounded w-2/3"></div>
            </div>
          }
        </div>
      } @else {
        <!-- Stats Cards -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Posts -->
          <div class="bg-amber-50 border-4 border-amber-300 p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 border-4 border-blue-300 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <h3 class="font-serif text-xl font-bold text-amber-900 mb-2">Total Posts</h3>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-bold text-amber-900">{{ stats().totalPosts }}</span>
              <span class="text-green-600 text-sm font-mono">
                +{{ stats().postsThisMonth }} this month
              </span>
            </div>
            
            <div class="mt-4">
              <a routerLink="/admin/posts" class="text-amber-600 hover:text-amber-800 font-mono text-sm underline">
                Manage Posts →
              </a>
            </div>
          </div>

          <!-- Total Users -->
          <div class="bg-amber-50 border-4 border-amber-300 p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-100 border-4 border-green-300 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
              </div>
            </div>
            
            <h3 class="font-serif text-xl font-bold text-amber-900 mb-2">Total Users</h3>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-bold text-amber-900">{{ stats().totalUsers }}</span>
              <span class="text-green-600 text-sm font-mono">
                +{{ stats().usersThisMonth }} this month
              </span>
            </div>
            
            <div class="mt-4">
              <a routerLink="/admin/users" class="text-amber-600 hover:text-amber-800 font-mono text-sm underline">
                Manage Users →
              </a>
            </div>
          </div>

          <!-- Total Comments -->
          <div class="bg-amber-50 border-4 border-amber-300 p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-100 border-4 border-purple-300 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <h3 class="font-serif text-xl font-bold text-amber-900 mb-2">Comments</h3>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-bold text-amber-900">{{ stats().totalComments }}</span>
              <span class="text-green-600 text-sm font-mono">
                +{{ stats().commentsThisMonth }} this month
              </span>
            </div>
            
            <div class="mt-4">
              <a routerLink="/admin/comments" class="text-amber-600 hover:text-amber-800 font-mono text-sm underline">
                Moderate Comments →
              </a>
            </div>
          </div>

          <!-- Total Views -->
          <div class="bg-amber-50 border-4 border-amber-300 p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-orange-100 border-4 border-orange-300 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <h3 class="font-serif text-xl font-bold text-amber-900 mb-2">Total Views</h3>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-bold text-amber-900">{{ formatNumber(stats().totalViews) }}</span>
              <span class="text-green-600 text-sm font-mono">
                +{{ formatNumber(stats().viewsThisMonth) }} this month
              </span>
            </div>
            
            <div class="mt-4">
              <span class="text-amber-600 font-mono text-sm">Analytics Available</span>
            </div>
          </div>
        </section>

        <!-- Recent Activity & Quick Actions -->
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Recent Activity -->
          <div class="lg:col-span-2">
            <div class="bg-amber-50 border-4 border-amber-300 p-6">
              <h2 class="font-serif text-xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
                Recent Activity
              </h2>
              
              @if (recentActivity().length === 0) {
                <div class="text-center py-8">
                  <p class="text-amber-700">No recent activity to display.</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (activity of recentActivity(); track activity.id) {
                    <div class="flex items-center gap-4 p-4 bg-amber-100 border-2 border-amber-200 hover:border-amber-400 transition-colors">
                      <!-- Activity Icon -->
                      <div class="w-10 h-10 flex items-center justify-center rounded-full border-2" 
                           [class]="getActivityIconClass(activity.type)">
                        @if (activity.type === 'post') {
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
                          </svg>
                        } @else if (activity.type === 'user') {
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                          </svg>
                        } @else {
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clip-rule="evenodd"></path>
                          </svg>
                        }
                      </div>
                      
                      <!-- Activity Details -->
                      <div class="flex-1">
                        <h4 class="font-bold text-amber-900 text-sm leading-tight">{{ activity.title }}</h4>
                        <p class="text-amber-700 text-xs">by {{ activity.author }}</p>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-amber-600 text-xs font-mono">{{ formatDate(activity.date) }}</span>
                          @if (activity.status) {
                            <span class="px-2 py-1 text-xs font-mono uppercase rounded"
                                  [class]="getStatusClass(activity.status)">
                              {{ activity.status }}
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="lg:col-span-1">
            <div class="bg-amber-50 border-4 border-amber-300 p-6">
              <h2 class="font-serif text-xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
                Quick Actions
              </h2>
              
              <div class="space-y-3">
                <a 
                  routerLink="/write"
                  class="block w-full bg-green-100 text-green-800 p-4 font-mono text-sm uppercase tracking-wider hover:bg-green-200 transition-colors border-2 border-green-300 text-center"
                >
                  <svg class="w-5 h-5 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                  </svg>
                  Create New Post
                </a>
                
                <button 
                  class="block w-full bg-blue-100 text-blue-800 p-4 font-mono text-sm uppercase tracking-wider hover:bg-blue-200 transition-colors border-2 border-blue-300 text-center"
                >
                  <svg class="w-5 h-5 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                  </svg>
                  Add New User
                </button>
                
                <a 
                  routerLink="/admin/tags"
                  class="block w-full bg-purple-100 text-purple-800 p-4 font-mono text-sm uppercase tracking-wider hover:bg-purple-200 transition-colors border-2 border-purple-300 text-center"
                >
                  <svg class="w-5 h-5 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                  </svg>
                  Manage Tags
                </a>
                
                <a 
                  routerLink="/admin/media"
                  class="block w-full bg-orange-100 text-orange-800 p-4 font-mono text-sm uppercase tracking-wider hover:bg-orange-200 transition-colors border-2 border-orange-300 text-center"
                >
                  <svg class="w-5 h-5 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                  </svg>
                  Upload Media
                </a>
              </div>
            </div>

            <!-- System Info -->
            <div class="bg-amber-900 border-4 border-amber-800 p-6 mt-6 text-amber-100">
              <h3 class="font-serif text-lg font-bold mb-4">System Information</h3>
              
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span>Motherworld Version:</span>
                  <span class="font-mono">v2.1.0</span>
                </div>
                
                <div class="flex justify-between">
                  <span>Database:</span>
                  <span class="font-mono text-green-300">Connected</span>
                </div>
                
                <div class="flex justify-between">
                  <span>Storage:</span>
                  <span class="font-mono">{{ getStorageUsage() }}% used</span>
                </div>
                
                <div class="flex justify-between">
                  <span>Last Backup:</span>
                  <span class="font-mono">{{ getLastBackup() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Vintage paper texture */
    .bg-amber-50 {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Card hover effects */
    .hover\\:shadow-lg:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
      transition: all 0.3s ease;
    }

    /* Smooth animations */
    .transition-shadow {
      transition: box-shadow 0.3s ease, transform 0.3s ease;
    }

    .transition-colors {
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  // Reactive Signals
  loading = signal(true);
  stats = signal<DashboardStats>({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalViews: 0,
    postsThisMonth: 0,
    usersThisMonth: 0,
    commentsThisMonth: 0,
    viewsThisMonth: 0
  });
  recentActivity = signal<RecentActivity[]>([]);

  async ngOnInit() {
    await this.loadDashboardData();
  }

  private async loadDashboardData() {
    try {
      this.loading.set(true);

      // In a real implementation, you'd have specific admin endpoints
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

      // Mock dashboard stats
      this.stats.set({
        totalPosts: 142,
        totalUsers: 1250,
        totalComments: 2847,
        totalViews: 45230,
        postsThisMonth: 12,
        usersThisMonth: 89,
        commentsThisMonth: 234,
        viewsThisMonth: 5621
      });

      // Mock recent activity
      this.recentActivity.set([
        {
          id: '1',
          type: 'post',
          title: 'New article: "Building Modern Web Apps"',
          author: 'John Doe',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'published'
        },
        {
          id: '2',
          type: 'user',
          title: 'New user registration',
          author: 'Jane Smith',
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: '3',
          type: 'comment',
          title: 'Comment on "Angular Best Practices"',
          author: 'Mike Johnson',
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'approved'
        },
        {
          id: '4',
          type: 'post',
          title: 'Draft updated: "TypeScript Tips"',
          author: 'Sarah Wilson',
          date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'draft'
        }
      ]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  // Helper Methods
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'post':
        return 'bg-blue-100 border-blue-300 text-blue-600';
      case 'user':
        return 'bg-green-100 border-green-300 text-green-600';
      case 'comment':
        return 'bg-purple-100 border-purple-300 text-purple-600';
      default:
        return 'bg-amber-100 border-amber-300 text-amber-600';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'published':
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'draft':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  }

  getStorageUsage(): number {
    return 67; // Mock value
  }

  getLastBackup(): string {
    return '2 days ago'; // Mock value
  }
}
