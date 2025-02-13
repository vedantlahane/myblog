// blog-listing.component.ts

import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { BlogService } from '../../services/blog.service';

import { FiltersComponent } from '../../components/filters/filters.component';

import { BlogCardComponent } from '../../components/blog-card/blog-card.component';


interface Post {

  id: number;

  title: string;

  excerpt: string;

  thumbnail: string;

  author: string;

  date: string;

}


@Component({

  selector: 'app-blog-listing',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    FiltersComponent,

    BlogCardComponent

  ],

  templateUrl: './blog-listing.component.html',

  styleUrls: ['./blog-listing.component.css']

})

export class BlogListingComponent implements OnInit {

  posts: Post[] = [];

  filteredPosts: Post[] = [];

  searchTerm: string = '';

  currentPage: number = 1;

  totalPages: number = 1;

  postsPerPage: number = 9;


  constructor(private blogService: BlogService) {}


  ngOnInit() {

    this.loadPosts();

  }


  loadPosts() {
    this.blogService.getPosts().subscribe(posts => {
      this.posts = posts;
      this.applyFilters();
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(filters: any) {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.posts];

    // Apply search
    if (this.searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Calculate pagination
    this.totalPages = Math.ceil(filtered.length / this.postsPerPage);
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    this.filteredPosts = filtered.slice(startIndex, startIndex + this.postsPerPage);
  }
}