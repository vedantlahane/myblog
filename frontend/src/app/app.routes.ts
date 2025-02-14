// app.routes.ts
import { Routes } from '@angular/router';
// Temporarily comment out unused imports
// import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Keep active routes
  {
    path: '',
    loadComponent: () => 
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },

  // Comment out routes you're not working on yet
  /*
  {
    path: 'blog',
    loadComponent: () => 
      import('./pages/blog-listing/blog-listing.component').then(m => m.BlogListingComponent)
  },
  {
    path: 'blog/:id',
    loadComponent: () => 
      import('./pages/blog-detail/blog-detail.component')
        .then(m => m.BlogDetailComponent)
  },
  {
    path: 'create-post',
    loadComponent: () => 
      import('./pages/create-edit-post/create-edit-post.component')
        .then(m => m.CreateEditPostComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit-post/:id',
    loadComponent: () => 
      import('./pages/create-edit-post/create-edit-post.component')
        .then(m => m.CreateEditPostComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => 
      import('./pages/user-profile/user-profile.component')
        .then(m => m.UserProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => 
      import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => 
      import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => 
      import('./pages/auth/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => 
      import('./pages/auth/reset-password/reset-password.component')
        .then(m => m.ResetPasswordComponent)
  }
  */

  // Optional: Add a catch-all route to redirect unmatched URLs to home
  {
    path: '**',
    redirectTo: ''
  }
];