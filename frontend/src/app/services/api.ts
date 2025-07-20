import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, retry, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import type {
  LoginRequest, RegisterRequest, AuthResponse, User, Post, PostQueryParams,
  PaginatedResponse, CreatePostRequest, UpdatePostRequest,
  Tag, Comment, CreateCommentRequest, UpdateProfileRequest, 
  ChangePasswordRequest, BookmarkStatusResponse
} from '../../types/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private baseURL = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor() {
    if (this.isBrowser) {
      const token = localStorage.getItem('authToken');
      if (token) {
        this.tokenSubject.next(token);
      }
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'An error occurred';
    
    if (error.status === 401) {
      // Token expired or invalid
      this.clearToken();
      errorMessage = 'Session expired. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'Access denied. Insufficient permissions.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.error?.error) {
      // Backend returns { error: "message" }
      errorMessage = error.error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  };

  private clearToken(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
    }
    this.tokenSubject.next(null);
  }

  // Auth Methods
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseURL}/api/auth/login`, data)
      .pipe(
        tap(response => {
          if (response.token && this.isBrowser) {
            localStorage.setItem('authToken', response.token);
            this.tokenSubject.next(response.token);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseURL}/api/auth/register`, data)
      .pipe(
        tap(response => {
          if (response.token && this.isBrowser) {
            localStorage.setItem('authToken', response.token);
            this.tokenSubject.next(response.token);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseURL}/api/auth/logout`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => this.clearToken()),
        catchError(this.handleError)
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseURL}/api/auth/me`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Profile Methods
  updateProfile(data: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.baseURL}/api/users/me/profile`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseURL}/api/users/me/password`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Post Methods
  getPosts(params?: PostQueryParams): Observable<PaginatedResponse<Post>> {
    return this.http.get<any>(`${this.baseURL}/api/posts`, {
      params: params as any,
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      // Transform backend response to match frontend interface
      map(response => ({
        data: response.posts || response.data || [],
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalPosts || response.totalItems || 0
      })),
      catchError(this.handleError)
    );
  }

  getPostBySlug(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseURL}/api/posts/slug/${slug}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getTrendingPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseURL}/api/posts/trending`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createPost(data: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(`${this.baseURL}/api/posts`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updatePost(id: string, data: UpdatePostRequest): Observable<Post> {
    return this.http.put<Post>(`${this.baseURL}/api/posts/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deletePost(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/posts/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  likePost(id: string): Observable<{ message: string; likes: number }> {
    return this.http.post<{ message: string; likes: number }>(`${this.baseURL}/api/posts/${id}/like`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  unlikePost(id: string): Observable<{ message: string; likes: number }> {
    return this.http.delete<{ message: string; likes: number }>(`${this.baseURL}/api/posts/${id}/like`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseURL}/api/posts/${id}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getRelatedPosts(id: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseURL}/api/posts/${id}/related`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // User Methods
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseURL}/api/users/${id}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  followUser(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseURL}/api/users/${id}/follow`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  unfollowUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/users/${id}/follow`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Tag Methods
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseURL}/api/tags`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getTagBySlug(slug: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.baseURL}/api/tags/slug/${slug}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Comment Methods
  getComments(params?: any): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseURL}/api/comments`, {
      params: params as any,
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  createComment(data: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseURL}/api/comments`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Bookmark Methods
  checkBookmarkStatus(postId: string): Observable<BookmarkStatusResponse> {
    return this.http.get<BookmarkStatusResponse>(`${this.baseURL}/api/bookmarks/check/${postId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Search Methods
  searchPosts(query: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseURL}/api/search/posts?q=${encodeURIComponent(query)}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseURL}/api/search/users?q=${encodeURIComponent(query)}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return this.tokenSubject.value !== null;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }
}
