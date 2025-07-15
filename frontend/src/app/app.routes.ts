import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { PostDetailComponent } from './pages/post-detail/post-detail';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'post/:slug',
    component: PostDetailComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./pages/category/category').then(m => m.CategoryComponent)
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