// services/blog.service.ts

import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

// import { environment } from '../../../environments/environment';


@Injectable({

  providedIn: 'root'

})

export class BlogService {

  private apiUrl = 'http://localhost:3000';


  constructor(private http: HttpClient) {}

  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posts`);
  }

  getPost(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/posts/${id}`);
  }

  createPost(post: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/posts`, post);
  }

  updatePost(id: number, post: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/posts/${id}`, post);
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/posts/${id}`);
  }getRelatedPosts(postId: number): Observable<any[]> {

    return this.http.get<any[]>(`${this.apiUrl}/posts/${postId}/related`);

  }


  addComment(comment: any): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/comments`, comment);

  }

}