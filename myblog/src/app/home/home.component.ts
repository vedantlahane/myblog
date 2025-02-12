import { Component } from '@angular/core';
import { BlogPostComponent } from "../blog-post/blog-post.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [BlogPostComponent]
})
export class HomeComponent {

}
