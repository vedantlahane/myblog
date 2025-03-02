// src/app/services/blog.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:5000/api';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    if (error.status === 0) {
      // A client-side or network error occurred
      console.error('An error occurred:', error.error);
      return throwError(() => new Error('Network error occurred'));
    }
    
    // Backend error
    const errorMessage = error.error?.message || `Server error: ${error.status}`;
    return throwError(() => new Error(errorMessage));
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<any>(`${this.apiUrl}/posts`, this.httpOptions).pipe(
      retry(1),
      map(response => {
        console.log('Posts response:', response);
        return response.posts;
      }),
      catchError(this.handleError)
    );
  }

  getPost(idOrSlug: string): Observable<Post> {
    // Try by slug first
    return this.http.get<any>(`${this.apiUrl}/posts/slug/${idOrSlug}`, this.httpOptions).pipe(
      map(response => {
        console.log('Post by slug response:', response);
        if (response.success && response.post) {
          return response.post;
        }
        throw new Error('Post not found');
      }),
      catchError((error) => {
        console.log('Trying by ID after slug failed');
        // If slug fails, try by ID
        return this.http.get<any>(`${this.apiUrl}/posts/${idOrSlug}`, this.httpOptions).pipe(
          map(response => {
            console.log('Post by ID response:', response);
            if (response.success && response.post) {
              return response.post;
            }
            throw new Error('Post not found');
          }),
          catchError(this.handleError)
        );
      })
    );
  }

  getRelatedPosts(postId: string): Observable<Post[]> {
    return this.http.get<any>(`${this.apiUrl}/posts/${postId}/related`, this.httpOptions).pipe(
      map(response => response.posts || []),
      catchError(() => {
        console.log('No related posts found');
        return [];
      })
    );
  }
}