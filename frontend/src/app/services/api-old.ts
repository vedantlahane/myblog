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

  getTrendingPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseURL}/api/posts/trending`, { headers: this.getHeaders() })
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
  createUser(data: any): Observable<User> {
    return this.http.post<User>(`${this.baseURL}/api/users`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUsers(params?: UserQueryParams): Observable<PaginatedResponse<User>> {
    return this.http.get<any>(`${this.baseURL}/api/users`, {
      params: params as any,
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      map(response => ({
        data: response.users || response.data || [],
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalUsers || response.totalItems || 0
      })),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseURL}/api/users/${id}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  updateUser(id: string, data: any): Observable<User> {
    return this.http.put<User>(`${this.baseURL}/api/users/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/users/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  followUser(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseURL}/api/users/${id}/follow`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  unfollowUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/users/${id}/follow`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getFollowers(id: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseURL}/api/users/${id}/followers`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getFollowing(id: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseURL}/api/users/${id}/following`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getUserPosts(id: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseURL}/api/users/${id}/posts`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  savePost(postId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseURL}/api/users/posts/${postId}/save`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  unsavePost(postId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/users/posts/${postId}/save`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSavedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseURL}/api/users/me/saved-posts`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = new HttpHeaders();
    const token = this.tokenSubject.value;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<{ avatarUrl: string }>(`${this.baseURL}/api/users/me/avatar`, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteAvatar(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/users/me/avatar`, { headers: this.getHeaders() })
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

  getPopularTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseURL}/api/tags/popular`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getTagById(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.baseURL}/api/tags/${id}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getPostsByTag(id: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseURL}/api/tags/${id}/posts`, { headers: this.getHeaders() })
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

  createTag(data: CreateTagRequest): Observable<Tag> {
    return this.http.post<Tag>(`${this.baseURL}/api/tags`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateTag(id: string, data: UpdateTagRequest): Observable<Tag> {
    return this.http.put<Tag>(`${this.baseURL}/api/tags/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteTag(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/tags/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Comment Methods
  getCommentsByPost(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseURL}/api/comments/post/${postId}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCommentReplies(commentId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseURL}/api/comments/${commentId}/replies`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createComment(data: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseURL}/api/comments`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateComment(id: string, data: UpdateCommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseURL}/api/comments/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteComment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/comments/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  likeComment(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseURL}/api/comments/${id}/like`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  unlikeComment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/comments/${id}/like`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Bookmark Methods
  getBookmarks(params?: BookmarkQueryParams): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/api/bookmarks`, {
      params: params as any,
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getBookmarkById(id: string): Observable<Bookmark> {
    return this.http.get<Bookmark>(`${this.baseURL}/api/bookmarks/${id}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createBookmark(data: CreateBookmarkRequest): Observable<Bookmark> {
    return this.http.post<Bookmark>(`${this.baseURL}/api/bookmarks`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateBookmark(id: string, data: UpdateBookmarkRequest): Observable<Bookmark> {
    return this.http.put<Bookmark>(`${this.baseURL}/api/bookmarks/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteBookmark(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/bookmarks/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  removeBookmarkByPost(postId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/bookmarks/post/${postId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserCollections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/api/collections/user/my-collections`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  checkBookmarkStatus(postId: string): Observable<BookmarkStatusResponse> {
    return this.http.get<BookmarkStatusResponse>(`${this.baseURL}/api/bookmarks/check/${postId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Category Methods
  getCategories(params?: { isActive?: boolean; parentCategory?: string }): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseURL}/api/categories`, {
      params: params as any,
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getCategoryTree(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseURL}/api/categories/tree`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseURL}/api/categories/${id}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseURL}/api/categories/slug/${slug}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createCategory(data: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.baseURL}/api/categories`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateCategory(id: string, data: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.baseURL}/api/categories/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/categories/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Draft Methods
  getDrafts(params?: any): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/api/drafts`, {
      params: params as any,
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getDraftById(id: string): Observable<Draft> {
    return this.http.get<Draft>(`${this.baseURL}/api/drafts/${id}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createDraft(data: CreateDraftRequest): Observable<Draft> {
    return this.http.post<Draft>(`${this.baseURL}/api/drafts`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateDraft(id: string, data: UpdateDraftRequest): Observable<Draft> {
    return this.http.put<Draft>(`${this.baseURL}/api/drafts/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteDraft(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/drafts/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  publishDraft(id: string): Observable<{ message: string; post: Post }> {
    return this.http.post<{ message: string; post: Post }>(`${this.baseURL}/api/drafts/${id}/publish`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getDraftVersions(postId: string): Observable<Draft[]> {
    return this.http.get<Draft[]>(`${this.baseURL}/api/drafts/versions/${postId}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Collection Methods
  getCollections(params?: CollectionQueryParams): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/api/collections`, {
      params: params as any,
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getCollectionById(id: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.baseURL}/api/collections/${id}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCollectionBySlug(slug: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.baseURL}/api/collections/slug/${slug}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createCollection(data: CreateCollectionRequest): Observable<Collection> {
    return this.http.post<Collection>(`${this.baseURL}/api/collections`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateCollection(id: string, data: UpdateCollectionRequest): Observable<Collection> {
    return this.http.put<Collection>(`${this.baseURL}/api/collections/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteCollection(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/collections/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  addPostToCollection(data: AddPostToCollectionRequest): Observable<Collection> {
    return this.http.post<Collection>(`${this.baseURL}/api/collections/add-post`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  removePostFromCollection(collectionId: string, postId: string): Observable<Collection> {
    return this.http.delete<Collection>(`${this.baseURL}/api/collections/${collectionId}/posts/${postId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  reorderCollectionPosts(id: string, data: ReorderCollectionPostsRequest): Observable<Collection> {
    return this.http.put<Collection>(`${this.baseURL}/api/collections/${id}/reorder`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Media Methods
  uploadMedia(file: File, data?: { altText?: string; description?: string }): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);
    if (data?.altText) formData.append('altText', data.altText);
    if (data?.description) formData.append('description', data.description);
    
    const headers = new HttpHeaders();
    const token = this.tokenSubject.value;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<Media>(`${this.baseURL}/api/media/upload`, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  uploadMultipleMedia(files: File[]): Observable<Media[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const headers = new HttpHeaders();
    const token = this.tokenSubject.value;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<Media[]>(`${this.baseURL}/api/media/upload/multiple`, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  getMedia(params?: MediaQueryParams): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/api/media`, {
      params: params as any,
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  getMediaById(id: string): Observable<Media> {
    return this.http.get<Media>(`${this.baseURL}/api/media/${id}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  updateMedia(id: string, data: UpdateMediaRequest): Observable<Media> {
    return this.http.put<Media>(`${this.baseURL}/api/media/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteMedia(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/media/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserMedia(params?: MediaQueryParams): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/api/media/my-media`, {
      params: params as any,
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Notification Methods
  getNotifications(params?: NotificationQueryParams): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/api/notifications`, {
      params: params as any,
      headers: this.getHeaders()
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  createNotification(data: CreateNotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(`${this.baseURL}/api/notifications`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  markAsRead(id: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseURL}/api/notifications/${id}/read`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  markAllAsRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseURL}/api/notifications/mark-all-read`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteNotification(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseURL}/api/notifications/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseURL}/api/notifications/unread-count`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
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

  searchTags(query: string): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseURL}/api/search/tags?q=${encodeURIComponent(query)}`, { headers: this.getHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  globalSearch(query: string): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/api/search/all?q=${encodeURIComponent(query)}`, { headers: this.getHeaders() })
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
