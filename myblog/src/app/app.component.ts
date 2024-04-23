import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { BlogPostComponent } from "./blog-post/blog-post.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { FooterComponent } from "./footer/footer.component";
import { FeaturedPostComponent } from "./featured-post/featured-post.component"; // Import routes from app.route.ts

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, HeaderComponent, BlogPostComponent, CommonModule, FooterComponent, FeaturedPostComponent]
})
export class AppComponent {
  title = 'myblog';
  constructor() {
    RouterModule.forRoot(routes); // Configure routes
  }
}
