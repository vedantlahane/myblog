import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject, throwError, firstValueFrom } from 'rxjs';
import { tap, catchError, retry, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import type {
  // Auth Types
  LoginRequest, RegisterRequest, AuthResponse, User,
  
  // Post Types
  Post, PostQueryParams, PostsResponse, CreatePostRequest, UpdatePostRequest,
  
  // User Types  
  UpdateUserRequest, CreateUserRequest, UpdateProfileRequest, ChangePasswordRequest,
  UserQueryParams,
  
  // Comment Types
  Comment, CreateCommentRequest, UpdateCommentRequest, CommentQueryParams,
  
  // Tag Types
  Tag, CreateTagRequest, UpdateTagRequest,
  
  // Category Types
  Category, CreateCategoryRequest, UpdateCategoryRequest,
  
  // Draft Types
  Draft, CreateDraftRequest, UpdateDraftRequest, DraftsResponse,
  
  // Bookmark Types
  Bookmark, CreateBookmarkRequest, UpdateBookmarkRequest, BookmarkStatusResponse,
  BookmarksResponse, BookmarkQueryParams, UserCollection,
  
  // Collection Types
  Collection, CreateCollectionRequest, UpdateCollectionRequest, 
  AddPostToCollectionRequest, ReorderCollectionPostsRequest, CollectionsResponse,
  CollectionQueryParams,
  
  // Media Types
  Media, UpdateMediaRequest, MediaResponse, MediaQueryParams,
  
  // Notification Types
  Notification, CreateNotificationRequest, NotificationsResponse, NotificationQueryParams,
  
  // Search Types
  SearchRequest, SearchResult, SearchResponse,
  
  // Common Types
  PaginatedResponse, ApiClient
} from '../../types/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService implements ApiClient {
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

  private getFormHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    let headers = new HttpHeaders();
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

  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => httpParams = httpParams.append(key, v.toString()));
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }
    return httpParams;
  }

  // ========================= AUTH METHODS =========================
  
  async login(data: LoginRequest): Promise<AuthResponse> {
    const request$ = this.http.post<AuthResponse>(`${this.baseURL}/api/auth/login`, data)
      .pipe(
        tap(response => {
          if (response.token && this.isBrowser) {
            localStorage.setItem('authToken', response.token);
            this.tokenSubject.next(response.token);
          }
        }),
        catchError(this.handleError)
      );
    
    return firstValueFrom(request$);
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const request$ = this.http.post<AuthResponse>(`${this.baseURL}/api/auth/register`, data)
      .pipe(
        tap(response => {
          if (response.token && this.isBrowser) {
            localStorage.setItem('authToken', response.token);
            this.tokenSubject.next(response.token);
          }
        }),
        catchError(this.handleError)
      );
    
    return firstValueFrom(request$);
  }

  async getCurrentUser(): Promise<User> {
    const request$ = this.http.get<User>(`${this.baseURL}/api/auth/me`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async logout(): Promise<{ message: string }> {
    const request$ = this.http.post<{ message: string }>(`${this.baseURL}/api/auth/logout`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => this.clearToken()),
        catchError(this.handleError)
      );
    
    return firstValueFrom(request$);
  }

  // ========================= USER METHODS =========================

  async createUser(data: CreateUserRequest): Promise<User> {
    const request$ = this.http.post<User>(`${this.baseURL}/api/users`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const httpParams = this.buildParams(params);
    const request$ = this.http.get<PaginatedResponse<User>>(`${this.baseURL}/api/users`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getUserById(id: string): Promise<User> {
    const request$ = this.http.get<User>(`${this.baseURL}/api/users/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const request$ = this.http.put<User>(`${this.baseURL}/api/users/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/users/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async followUser(id: string): Promise<{ message: string }> {
    const request$ = this.http.post<{ message: string }>(`${this.baseURL}/api/users/${id}/follow`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async unfollowUser(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/users/${id}/follow`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getFollowers(id: string): Promise<User[]> {
    const request$ = this.http.get<User[]>(`${this.baseURL}/api/users/${id}/followers`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getFollowing(id: string): Promise<User[]> {
    const request$ = this.http.get<User[]>(`${this.baseURL}/api/users/${id}/following`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getUserPosts(id: string): Promise<Post[]> {
    const request$ = this.http.get<Post[]>(`${this.baseURL}/api/users/${id}/posts`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async savePost(postId: string): Promise<{ message: string }> {
    const request$ = this.http.post<{ message: string }>(`${this.baseURL}/api/posts/${postId}/save`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async unsavePost(postId: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/posts/${postId}/save`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getSavedPosts(): Promise<Post[]> {
    const request$ = this.http.get<Post[]>(`${this.baseURL}/api/users/saved-posts`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const request$ = this.http.put<User>(`${this.baseURL}/api/users/profile`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const request$ = this.http.put<{ message: string }>(`${this.baseURL}/api/users/password`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const request$ = this.http.post<{ avatarUrl: string }>(`${this.baseURL}/api/users/avatar`, formData, { headers: this.getFormHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deleteAvatar(): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/users/avatar`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  // ========================= POST METHODS =========================

  async getPosts(params?: PostQueryParams): Promise<PostsResponse> {
    const httpParams = this.buildParams(params);
    const request$ = this.http.get<PostsResponse>(`${this.baseURL}/api/posts`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getPostById(id: string): Promise<Post> {
    const request$ = this.http.get<Post>(`${this.baseURL}/api/posts/id/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const request$ = this.http.get<Post>(`${this.baseURL}/api/posts/${slug}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async createPost(data: CreatePostRequest): Promise<Post> {
    const request$ = this.http.post<Post>(`${this.baseURL}/api/posts`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async updatePost(id: string, data: UpdatePostRequest): Promise<Post> {
    const request$ = this.http.put<Post>(`${this.baseURL}/api/posts/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deletePost(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/posts/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async likePost(id: string): Promise<{ message: string; likes: number }> {
    const request$ = this.http.post<{ message: string; likes: number }>(`${this.baseURL}/api/posts/${id}/like`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async unlikePost(id: string): Promise<{ message: string; likes: number }> {
    const request$ = this.http.delete<{ message: string; likes: number }>(`${this.baseURL}/api/posts/${id}/like`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getTrendingPosts(): Promise<Post[]> {
    const request$ = this.http.get<Post[]>(`${this.baseURL}/api/posts/trending`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getRelatedPosts(id: string): Promise<Post[]> {
    const request$ = this.http.get<Post[]>(`${this.baseURL}/api/posts/${id}/related`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  // ========================= COMMENT METHODS =========================

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    const request$ = this.http.get<Comment[]>(`${this.baseURL}/api/posts/${postId}/comments`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getCommentReplies(commentId: string): Promise<Comment[]> {
    const request$ = this.http.get<Comment[]>(`${this.baseURL}/api/comments/${commentId}/replies`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const request$ = this.http.post<Comment>(`${this.baseURL}/api/posts/${data.post}/comments`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async updateComment(id: string, data: UpdateCommentRequest): Promise<Comment> {
    const request$ = this.http.put<Comment>(`${this.baseURL}/api/comments/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deleteComment(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/comments/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async likeComment(id: string): Promise<{ message: string }> {
    const request$ = this.http.post<{ message: string }>(`${this.baseURL}/api/comments/${id}/like`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async unlikeComment(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/comments/${id}/like`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  // ========================= TAG METHODS =========================

  async getTags(): Promise<Tag[]> {
    const request$ = this.http.get<Tag[]>(`${this.baseURL}/api/tags`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getPopularTags(): Promise<Tag[]> {
    const request$ = this.http.get<Tag[]>(`${this.baseURL}/api/tags/popular`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getTagById(id: string): Promise<Tag> {
    const request$ = this.http.get<Tag>(`${this.baseURL}/api/tags/id/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getPostsByTag(id: string): Promise<Post[]> {
    const request$ = this.http.get<Post[]>(`${this.baseURL}/api/tags/${id}/posts`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getTagBySlug(slug: string): Promise<Tag> {
    const request$ = this.http.get<Tag>(`${this.baseURL}/api/tags/${slug}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async createTag(data: CreateTagRequest): Promise<Tag> {
    const request$ = this.http.post<Tag>(`${this.baseURL}/api/tags`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async updateTag(id: string, data: UpdateTagRequest): Promise<Tag> {
    const request$ = this.http.put<Tag>(`${this.baseURL}/api/tags/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deleteTag(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/tags/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  // ========================= CATEGORY METHODS =========================

  async getCategories(params?: { isActive?: boolean; parentCategory?: string }): Promise<Category[]> {
    const httpParams = this.buildParams(params);
    const request$ = this.http.get<Category[]>(`${this.baseURL}/api/categories`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getCategoryTree(): Promise<Category[]> {
    const request$ = this.http.get<Category[]>(`${this.baseURL}/api/categories/tree`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getCategoryById(id: string): Promise<Category> {
    const request$ = this.http.get<Category>(`${this.baseURL}/api/categories/id/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const request$ = this.http.get<Category>(`${this.baseURL}/api/categories/${slug}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const request$ = this.http.post<Category>(`${this.baseURL}/api/categories`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const request$ = this.http.put<Category>(`${this.baseURL}/api/categories/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/categories/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  // ========================= DRAFT METHODS =========================

  async getDrafts(params?: { postId?: string; autoSave?: boolean } & PaginatedResponse<any>): Promise<DraftsResponse> {
    const httpParams = this.buildParams(params);
    const request$ = this.http.get<DraftsResponse>(`${this.baseURL}/api/drafts`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getDraftById(id: string): Promise<Draft> {
    const request$ = this.http.get<Draft>(`${this.baseURL}/api/drafts/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async createDraft(data: CreateDraftRequest): Promise<Draft> {
    const request$ = this.http.post<Draft>(`${this.baseURL}/api/drafts`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async updateDraft(id: string, data: UpdateDraftRequest): Promise<Draft> {
    const request$ = this.http.put<Draft>(`${this.baseURL}/api/drafts/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deleteDraft(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/drafts/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async publishDraft(id: string): Promise<{ message: string; post: Post }> {
    const request$ = this.http.post<{ message: string; post: Post }>(`${this.baseURL}/api/drafts/${id}/publish`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getDraftVersions(postId: string): Promise<Draft[]> {
    const request$ = this.http.get<Draft[]>(`${this.baseURL}/api/posts/${postId}/drafts`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  // ========================= BOOKMARK METHODS =========================

  async getBookmarks(params?: BookmarkQueryParams): Promise<BookmarksResponse> {
    const httpParams = this.buildParams(params);
    const request$ = this.http.get<BookmarksResponse>(`${this.baseURL}/api/bookmarks`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getBookmarkById(id: string): Promise<Bookmark> {
    const request$ = this.http.get<Bookmark>(`${this.baseURL}/api/bookmarks/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async createBookmark(data: CreateBookmarkRequest): Promise<Bookmark> {
    const request$ = this.http.post<Bookmark>(`${this.baseURL}/api/bookmarks`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async updateBookmark(id: string, data: UpdateBookmarkRequest): Promise<Bookmark> {
    const request$ = this.http.put<Bookmark>(`${this.baseURL}/api/bookmarks/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deleteBookmark(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/bookmarks/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async removeBookmarkByPost(postId: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/posts/${postId}/bookmark`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getBookmarkCollections(): Promise<UserCollection[]> {
  const request$ = this.http.get<UserCollection[]>(`${this.baseURL}/api/users/bookmark-collections`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
  
  return firstValueFrom(request$);
}

async checkBookmarkStatus(postId: string): Promise<BookmarkStatusResponse> {
  const request$ = this.http.get<BookmarkStatusResponse>(`${this.baseURL}/api/posts/${postId}/bookmark-status`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
  
  return firstValueFrom(request$);
}

  // ========================= COLLECTION METHODS =========================

  async getUserCollections(): Promise<Collection[]> {
  const request$ = this.http.get<Collection[]>(`${this.baseURL}/api/users/collections`, { headers: this.getHeaders() })
    .pipe(catchError(this.handleError));
  
  return firstValueFrom(request$);
}


  async getCollections(params?: CollectionQueryParams): Promise<CollectionsResponse> {
    const httpParams = this.buildParams(params);
    const request$ = this.http.get<CollectionsResponse>(`${this.baseURL}/api/collections`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getCollectionById(id: string): Promise<Collection> {
    const request$ = this.http.get<Collection>(`${this.baseURL}/api/collections/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getCollectionBySlug(slug: string): Promise<Collection> {
    const request$ = this.http.get<Collection>(`${this.baseURL}/api/collections/slug/${slug}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async createCollection(data: CreateCollectionRequest): Promise<Collection> {
    const request$ = this.http.post<Collection>(`${this.baseURL}/api/collections`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async updateCollection(id: string, data: UpdateCollectionRequest): Promise<Collection> {
    const request$ = this.http.put<Collection>(`${this.baseURL}/api/collections/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deleteCollection(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/collections/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async addPostToCollection(data: AddPostToCollectionRequest): Promise<Collection> {
    const request$ = this.http.post<Collection>(`${this.baseURL}/api/collections/${data.collectionId}/posts`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async removePostFromCollection(collectionId: string, postId: string): Promise<Collection> {
    const request$ = this.http.delete<Collection>(`${this.baseURL}/api/collections/${collectionId}/posts/${postId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async reorderCollectionPosts(id: string, data: ReorderCollectionPostsRequest): Promise<Collection> {
    const request$ = this.http.put<Collection>(`${this.baseURL}/api/collections/${id}/reorder`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  // ========================= MEDIA METHODS =========================

  async uploadMedia(file: File, data?: { altText?: string; description?: string }): Promise<Media> {
    const formData = new FormData();
    formData.append('file', file);
    if (data?.altText) formData.append('altText', data.altText);
    if (data?.description) formData.append('description', data.description);
    
    const request$ = this.http.post<Media>(`${this.baseURL}/api/media/upload`, formData, { headers: this.getFormHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async uploadMultipleMedia(files: File[]): Promise<Media[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const request$ = this.http.post<Media[]>(`${this.baseURL}/api/media/upload/multiple`, formData, { headers: this.getFormHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getMedia(params?: MediaQueryParams): Promise<MediaResponse> {
    const httpParams = this.buildParams(params);
    const request$ = this.http.get<MediaResponse>(`${this.baseURL}/api/media`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getMediaById(id: string): Promise<Media> {
    const request$ = this.http.get<Media>(`${this.baseURL}/api/media/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async updateMedia(id: string, data: UpdateMediaRequest): Promise<Media> {
    const request$ = this.http.put<Media>(`${this.baseURL}/api/media/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deleteMedia(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/media/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getUserMedia(params?: MediaQueryParams): Promise<MediaResponse> {
    const httpParams = this.buildParams(params);
    const request$ = this.http.get<MediaResponse>(`${this.baseURL}/api/users/media`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  // ========================= NOTIFICATION METHODS =========================

  async getNotifications(params?: NotificationQueryParams): Promise<NotificationsResponse> {
    const httpParams = this.buildParams(params);
    const request$ = this.http.get<NotificationsResponse>(`${this.baseURL}/api/notifications`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    const request$ = this.http.post<Notification>(`${this.baseURL}/api/notifications`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async markAsRead(id: string): Promise<{ message: string }> {
    const request$ = this.http.put<{ message: string }>(`${this.baseURL}/api/notifications/${id}/read`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async markAllAsRead(): Promise<{ message: string }> {
    const request$ = this.http.put<{ message: string }>(`${this.baseURL}/api/notifications/read-all`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    const request$ = this.http.delete<{ message: string }>(`${this.baseURL}/api/notifications/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const request$ = this.http.get<{ count: number }>(`${this.baseURL}/api/notifications/unread-count`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  // ========================= SEARCH METHODS =========================

  async searchPosts(query: string): Promise<Post[]> {
    const httpParams = new HttpParams().set('q', query);
    const request$ = this.http.get<Post[]>(`${this.baseURL}/api/search/posts`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async searchUsers(query: string): Promise<User[]> {
    const httpParams = new HttpParams().set('q', query);
    const request$ = this.http.get<User[]>(`${this.baseURL}/api/search/users`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async searchTags(query: string): Promise<Tag[]> {
    const httpParams = new HttpParams().set('q', query);
    const request$ = this.http.get<Tag[]>(`${this.baseURL}/api/search/tags`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  async globalSearch(query: string): Promise<any> {
    const httpParams = new HttpParams().set('q', query);
    const request$ = this.http.get<any>(`${this.baseURL}/api/search`, { 
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
    
    return firstValueFrom(request$);
  }

  // ========================= UTILITY METHODS =========================

  isAuthenticated(): boolean {
    return this.tokenSubject.value !== null;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }
}
