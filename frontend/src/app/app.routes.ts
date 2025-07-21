import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { HomeComponent } from './pages/home/home.component';

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
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Modern Blog'
  },
  {
    path: 'register', 
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Register - Modern Blog'
  },
  {
    path: 'post/:slug',
    loadComponent: () => import('./pages/post-detail/post-detail.component').then(m => m.PostDetailComponent),
    data: { prerender: false },
    title: 'Post - Modern Blog'
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./pages/category/category.component').then(m => m.CategoryComponent),
    data: { prerender: false },
    title: 'Category - Modern Blog'
  },
  {
    path: 'tag/:tag',
    loadComponent: () => import('./pages/tag/tag.component').then(m => m.TagComponent),
    data: { prerender: false },
    title: 'Tag - Modern Blog'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Profile - Modern Blog'
  },
  {
    path: 'my-posts',
    loadComponent: () => import('./pages/my-posts/my-posts.component').then(m => m.MyPostsComponent),
    canActivate: [authGuard],
    title: 'My Posts - Modern Blog'
  },
  {
    path: 'bookmarks',
    loadComponent: () => import('./pages/bookmarks/bookmarks.component').then(m => m.BookmarksComponent),
    canActivate: [authGuard],
    title: 'Bookmarks - Modern Blog'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
