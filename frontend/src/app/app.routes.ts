import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { ApiService } from './services/api.service';

// Auth Guard
const authGuard = () => {
  const apiService = inject(ApiService);
  return apiService.isAuthenticated();
};

// Guest Guard (for login/register pages)
const guestGuard = () => {
  const apiService = inject(ApiService);
  return !apiService.isAuthenticated();
};

export const routes: Routes = [
  // Home/Latest Posts
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(c => c.HomeComponent),
    title: 'MyBlog - Latest Articles'
  },

  // Authentication Routes
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then(c => c.LoginComponent),
        title: 'Login - MyBlog'
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register').then(c => c.RegisterComponent),
        title: 'Join MyBlog'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(c => c.ForgotPasswordComponent),
        title: 'Reset Password - MyBlog'
      }
    ]
  },

  // Post Routes
  {
    path: 'post',
    children: [
      {
        path: ':slug',
        loadComponent: () => import('./pages/post-detail/post-detail').then(c => c.PostDetailComponent),
        title: 'Article - MyBlog'
      }
    ]
  },

  // Archive/Browse Posts
  {
    path: 'archive',
    loadComponent: () => import('./pages/archive/archive').then(c => c.ArchiveComponent),
    title: 'Archive - MyBlog'
  },

  // Tag Routes
  {
    path: 'tag',
    children: [
      {
        path: ':slug',
        loadComponent: () => import('./pages/tag-posts/tag-posts').then(c => c.TagPostsComponent),
        title: 'Tagged Articles - MyBlog'
      }
    ]
  },

  // Search Results
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search').then(c => c.SearchComponent),
    title: 'Search Results - MyBlog'
  },

  // About Page
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(c => c.AboutComponent),
    title: 'About - MyBlog'
  },

  // Protected User Routes
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user-profile/profile').then(c => c.UserProfileComponent),
    title: 'Profile - MyBlog'
  },

  {
    path: 'write',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/write/write').then(c => c.WriteComponent),
        title: 'Write Article - MyBlog'
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./pages/write/write').then(c => c.WriteComponent),
        title: 'Edit Article - MyBlog'
      }
    ]
  },

  {
    path: 'drafts',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/drafts/drafts').then(c => c.DraftsComponent),
    title: 'My Drafts - MyBlog'
  },

  {
    path: 'bookmarks',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/bookmarks/bookmarks').then(c => c.BookmarksComponent),
    title: 'Bookmarks - MyBlog'
  },

  // User Profile Routes
  {
    path: 'user',
    children: [
      {
        path: ':id',
        loadComponent: () => import('./pages/user-profile/profile').then(c => c.UserProfileComponent),
        title: 'User Profile - MyBlog'
      }
    ]
  },

  // Collection Routes
  {
    path: 'collection',
    children: [
      {
        path: ':slug',
        loadComponent: () => import('./pages/collection-detail/collection-detail').then(c => c.CollectionDetailComponent),
        title: 'Collection - MyBlog'
      }
    ]
  },

  {
    path: 'collections',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/collections/collections').then(c => c.CollectionsComponent),
    title: 'My Collections - MyBlog'
  },

  // Settings Routes
  {
    path: 'settings',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/settings/profile-settings/profile-settings').then(c => c.ProfileSettingsComponent),
        title: 'Profile Settings - MyBlog'
      },
      {
        path: 'account',
        loadComponent: () => import('./pages/settings/account-settings/account-settings').then(c => c.AccountSettingsComponent),
        title: 'Account Settings - MyBlog'
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/settings/notification-settings/notification-settings').then(c => c.NotificationSettingsComponent),
        title: 'Notification Settings - MyBlog'
      }
    ]
  },

  // Admin Routes (if admin)
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-layout/admin-layout').then(c => c.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then(c => c.AdminDashboardComponent),
        title: 'Admin Dashboard - MyBlog'
      },
      {
        path: 'posts',
        loadComponent: () => import('./pages/admin/posts/posts').then(c => c.AdminPostsComponent),
        title: 'Manage Posts - MyBlog'
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/users').then(c => c.AdminUsersComponent),
        title: 'Manage Users - MyBlog'
      },
      {
        path: 'tags',
        loadComponent: () => import('./pages/admin/tags/tags').then(c => c.AdminTagsComponent),
        title: 'Manage Tags - MyBlog'
      },
      {
        path: 'media',
        loadComponent: () => import('./pages/admin/media/media').then(c => c.AdminMediaComponent),
        title: 'Media Library - MyBlog'
      }
    ]
  },

  // Legal/Static Pages
  {
    path: 'privacy',
    loadComponent: () => import('./pages/legal/privacy/privacy').then(c => c.PrivacyComponent),
    title: 'Privacy Policy - MyBlog'
  },

  {
    path: 'terms',
    loadComponent: () => import('./pages/legal/terms/terms').then(c => c.TermsComponent),
    title: 'Terms of Service - MyBlog'
  },

  // RSS Feed (handled by backend, but route for UI)
  {
    path: 'rss',
    redirectTo: '/api/rss',
    pathMatch: 'full'
  },

  // 404 Page
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then(c => c.NotFoundComponent),
    title: 'Page Not Found - MyBlog'
  },

  // Wildcard route - must be last
  {
    path: '**',
    redirectTo: '404'
  }
];
