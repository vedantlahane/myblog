import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, retry, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import type {
  LoginRequest, RegisterRequest, AuthResponse, User, Post, PostQueryParams,
  PaginatedResponse, CreatePostRequest, UpdatePostRequest,
  Tag, Comment, CreateCommentRequest, UpdateCommentRequest, UpdateProfileRequest, 
  ChangePasswordRequest, BookmarkStatusResponse, Category, Draft, Bookmark,
  Collection, Media, Notification, CreateBookmarkRequest, UpdateBookmarkRequest,
  CreateCollectionRequest, UpdateCollectionRequest, AddPostToCollectionRequest,
  ReorderCollectionPostsRequest, UpdateMediaRequest, CreateNotificationRequest,
  CreateTagRequest, UpdateTagRequest, CreateCategoryRequest, UpdateCategoryRequest,
  CreateDraftRequest, UpdateDraftRequest, UserQueryParams, CommentQueryParams,
  BookmarkQueryParams, CollectionQueryParams, MediaQueryParams, NotificationQueryParams
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
      this.clearToken();
      errorMessage = 'Session expired. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'Access denied. Insufficient permissions.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.error?.error) {
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

  // ========================= AUTH METHODS =========================
  
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
      .pipe(catchError(this.handleError));
  }

  isAuthenticated(): boolean {
    return this.tokenSubject.value !== null;
  }

  // ========================= POST METHODS =========================

  getPosts(params?: PostQueryParams): Observable<PaginatedResponse<Post>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Post>>(`${this.baseURL}/api/posts`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getPost(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseURL}/api/posts/${slug}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createPost(data: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(`${this.baseURL}/api/posts`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updatePost(id: string, data: UpdatePostRequest): Observable<Post> {
    return this.http.put<Post>(`${this.baseURL}/api/posts/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.baseURL}/api/posts/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  likePost(id: string): Observable<Post> {
    return this.http.post<Post>(`${this.baseURL}/api/posts/${id}/like`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  unlikePost(id: string): Observable<Post> {
    return this.http.delete<Post>(`${this.baseURL}/api/posts/${id}/like`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ========================= USER METHODS =========================

  getUsers(params?: UserQueryParams): Observable<PaginatedResponse<User>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<User>>(`${this.baseURL}/api/users`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseURL}/api/users/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateProfile(data: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.baseURL}/api/users/profile`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.baseURL}/api/users/password`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  followUser(id: string): Observable<User> {
    return this.http.post<User>(`${this.baseURL}/api/users/${id}/follow`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  unfollowUser(id: string): Observable<User> {
    return this.http.delete<User>(`${this.baseURL}/api/users/${id}/follow`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ========================= SEARCH METHODS =========================

  searchPosts(query: string, filters?: any): Observable<PaginatedResponse<Post>> {
    let httpParams = new HttpParams().set('q', query);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Post>>(`${this.baseURL}/api/search/posts`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  searchUsers(query: string): Observable<PaginatedResponse<User>> {
    const httpParams = new HttpParams().set('q', query);
    return this.http.get<PaginatedResponse<User>>(`${this.baseURL}/api/search/users`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ========================= TAG METHODS =========================

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseURL}/api/tags`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getTag(slug: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.baseURL}/api/tags/${slug}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ========================= CATEGORY METHODS =========================

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseURL}/api/categories`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getCategory(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseURL}/api/categories/${slug}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ========================= COMMENT METHODS =========================

  getComments(postId: string, params?: CommentQueryParams): Observable<PaginatedResponse<Comment>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Comment>>(`${this.baseURL}/api/posts/${postId}/comments`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  createComment(postId: string, data: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseURL}/api/posts/${postId}/comments`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateComment(id: string, data: UpdateCommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseURL}/api/comments/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteComment(id: string): Observable<any> {
    return this.http.delete(`${this.baseURL}/api/comments/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
}
