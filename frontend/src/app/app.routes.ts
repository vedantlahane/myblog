import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './services/api';
import { HomeComponent } from './pages/home/home';
import { PostDetailComponent } from './pages/post-detail/post-detail';

// Auth Guard function
const authGuard = () => {
  const apiService = inject(ApiService);
  const router = inject(Router);
  
  if (apiService.isAuthenticated()) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home - Modern Blog'
  },
  {
    path: 'post/:slug',
    component: PostDetailComponent,
    data: { prerender: false },
    title: 'Post - Modern Blog'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent),
    title: 'Login - Modern Blog'
  },
  {
    path: 'register', 
    loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent),
    title: 'Register - Modern Blog'
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./pages/category/category').then(m => m.CategoryComponent),
    data: { prerender: false },
    title: 'Category - Modern Blog'
  },
  {
    path: 'tag/:tag',
    loadComponent: () => import('./pages/tag/tag').then(m => m.TagComponent),
    title: 'Tag - Modern Blog'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Profile - Modern Blog'
  },
  {
    path: 'write',
    loadComponent: () => import('./pages/write/write').then(m => m.WriteComponent),
    canActivate: [authGuard],
    title: 'Write - Modern Blog'
  },
  {
    path: 'my-posts',
    loadComponent: () => import('./pages/my-posts/my-posts').then(m => m.MyPostsComponent),
    canActivate: [authGuard],
    title: 'My Posts - Modern Blog'
  },
  {
    path: 'bookmarks',
    loadComponent: () => import('./pages/bookmarks/bookmarks').then(m => m.BookmarksComponent),
    canActivate: [authGuard],
    title: 'Bookmarks - Modern Blog'
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent),
    canActivate: [authGuard],
    title: 'Settings - Modern Blog'
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search').then(m => m.SearchComponent),
    title: 'Search - Modern Blog'
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent),
    title: 'Page Not Found - Modern Blog'
  }
];
