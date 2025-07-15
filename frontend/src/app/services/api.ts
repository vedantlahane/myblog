import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Post,
  PostQueryParams,
  PaginatedResponse,
  CreatePostRequest,
  UpdatePostRequest,
  Tag,
  Comment,
  CreateCommentRequest
} from '../../types/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseURL = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check for existing token
    const token = localStorage.getItem('authToken');
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // Auth methods
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseURL}/auth/login`, data)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            this.tokenSubject.next(response.token);
          }
        })
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseURL}/auth/register`, data)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            this.tokenSubject.next(response.token);
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseURL}/auth/logout`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          localStorage.removeItem('authToken');
          this.tokenSubject.next(null);
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseURL}/auth/me`, { headers: this.getHeaders() });
  }

  // Post methods
  getPosts(params?: PostQueryParams): Observable<PaginatedResponse<Post>> {
    return this.http.get<PaginatedResponse<Post>>(`${this.baseURL}/posts`, {
      params: params as any,
      headers: this.getHeaders()
    });
  }

  getPostBySlug(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseURL}/posts/slug/${slug}`, { headers: this.getHeaders() });
  }

  getTrendingPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseURL}/posts/trending`, { headers: this.getHeaders() });
  }

  createPost(data: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(`${this.baseURL}/posts`, data, { headers: this.getHeaders() });
  }

  updatePost(id: string, data: UpdatePostRequest): Observable<Post> {
    return this.http.put<Post>(`${this.baseURL}/posts/${id}`, data, { headers: this.getHeaders() });
  }

  likePost(id: string): Observable<any> {
    return this.http.post(`${this.baseURL}/posts/${id}/like`, {}, { headers: this.getHeaders() });
  }

  unlikePost(id: string): Observable<any> {
    return this.http.delete(`${this.baseURL}/posts/${id}/like`, { headers: this.getHeaders() });
  }

  // Additional Post methods
  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseURL}/posts/${id}`, { headers: this.getHeaders() });
  }

  getRelatedPosts(id: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseURL}/posts/${id}/related`, { headers: this.getHeaders() });
  }

  // User methods
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseURL}/users/${id}`, { headers: this.getHeaders() });
  }

  followUser(id: string): Observable<any> {
    return this.http.post(`${this.baseURL}/users/${id}/follow`, {}, { headers: this.getHeaders() });
  }

  unfollowUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseURL}/users/${id}/follow`, { headers: this.getHeaders() });
  }

  // Tag methods
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseURL}/tags`, { headers: this.getHeaders() });
  }

  getTagBySlug(slug: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.baseURL}/tags/slug/${slug}`, { headers: this.getHeaders() });
  }

  // Comment methods
  getComments(params?: any): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseURL}/comments`, {
      params: params as any,
      headers: this.getHeaders()
    });
  }

  createComment(data: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseURL}/comments`, data, { headers: this.getHeaders() });
  }
}