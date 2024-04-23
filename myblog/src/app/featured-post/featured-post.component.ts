import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
interface FeaturedPost {
  title: string;
  imageUrl: string;
  description: string;
}
@Component({
  selector: 'app-featured-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-post.component.html',
  styleUrl: './featured-post.component.css'
})
export class FeaturedPostComponent {
  featuredPosts: FeaturedPost[] = [
    {
      title: 'Featured Post 1',
      imageUrl: 'https://example.com/image1.jpg',
      description: 'Description for Featured Post 1'
    },
    {
      title: 'Featured Post 2',
      imageUrl: 'https://example.com/image2.jpg',
      description: 'Description for Featured Post 2'
    },
    // Add more featured posts as needed
  ];

}
