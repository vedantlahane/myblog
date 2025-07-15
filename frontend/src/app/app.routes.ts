import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { PostDetailComponent } from './pages/post-detail/post-detail';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'post/:slug',
    component: PostDetailComponent,
    data: { prerender: false }
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./pages/category/category').then(m => m.CategoryComponent),
    data: { prerender: false }
  },
  {
    path: 'tag/:tag',
    loadComponent: () => import('./pages/tag/tag').then(m => m.TagComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent),
    // Add auth guard here
  },
  {
    path: 'write',
    loadComponent: () => import('./pages/write/write').then(m => m.WriteComponent),
    // Add auth guard here
  },
  {
    path: '**',
    redirectTo: ''
  }
];