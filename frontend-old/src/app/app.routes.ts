// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Home'
  },
  {
    path: 'blog',
    children: [
     
      {
        path: ':id',
        loadComponent: () => 
          import('./pages/blog-detail/blog-detail.component')
            .then(m => m.BlogDetailComponent),
        title: 'Blog Post'
      },
    ]
  },
 
  // Add these routes when you create the components
  /*
  {
    path: 'about',
    loadComponent: () => 
      import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'About'
  },
  {
    path: 'contact',
    loadComponent: () => 
      import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact'
  }
  */
  {
    path: '**',
    redirectTo: ''
  }
];