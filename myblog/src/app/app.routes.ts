import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { ArticleComponent } from './article/article.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { WriteblogComponent } from './writeblog/writeblog.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect to home page if no path is provided
  {path:'login',component:LoginFormComponent},
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'blog', component: BlogPostComponent },
  {path:'writeblog',component:WriteblogComponent},
  { path: 'article/:id', component: ArticleComponent },
  { path: '**', redirectTo: '/home' } // Redirect to home page if the provided path is not found
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
