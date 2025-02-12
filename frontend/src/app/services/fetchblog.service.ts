import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FetchblogService {
  private url = 'http://localhost:9000/blogs'; // Endpoint to fetch blogs
  

  constructor(private http: HttpClient) {}

  getBlogs(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }
  getBlogPost(postId: string): Observable<any> {
    const postUrl = `${this.url}/${postId}`;
    return this.http.get<any>(postUrl);
  }
}
