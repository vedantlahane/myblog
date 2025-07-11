// HTTP Client for Blog API
// This file provides a type-safe HTTP client for interacting with the blog backend

import type {
  ApiClient,
  ApiConfig,
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Post,
  Comment,
  Tag,
  Category,
  Draft,
  Bookmark,
  Collection,
  Media,
  Notification,
  SearchRequest,
  SearchResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  CreateTagRequest,
  UpdateTagRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateDraftRequest,
  UpdateDraftRequest,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  AddPostToCollectionRequest,
  ReorderCollectionPostsRequest,
  UpdateMediaRequest,
  CreateNotificationRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  PostQueryParams,
  UserQueryParams,
  CommentQueryParams,
  BookmarkQueryParams,
  CollectionQueryParams,
  MediaQueryParams,
  NotificationQueryParams
} from '../types/api';

class BlogApiClient implements ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    // Safe localStorage access for SSR compatibility
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  private async upload<T = any>(
    endpoint: string,
    file: File | File[],
    additionalData?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const formData = new FormData();

    if (Array.isArray(file)) {
      file.forEach(f => formData.append('files', f));
    } else {
      formData.append('file', file);
    }

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  public setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  public clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // ========================= AUTH ENDPOINTS =========================

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  // ========================= USER ENDPOINTS =========================

  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<PaginatedResponse<User>>(`/api/users${queryString}`);
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/api/users/${id}`);
  }

  async updateUser(id: string, data: any): Promise<User> {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async followUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/users/${id}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/users/${id}/follow`, {
      method: 'DELETE',
    });
  }

  async getFollowers(id: string): Promise<User[]> {
    return this.request<User[]>(`/api/users/${id}/followers`);
  }

  async getFollowing(id: string): Promise<User[]> {
    return this.request<User[]>(`/api/users/${id}/following`);
  }

  async getUserPosts(id: string): Promise<Post[]> {
    return this.request<Post[]>(`/api/users/${id}/posts`);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return this.request<User>('/api/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    return this.upload<{ avatarUrl: string }>('/api/users/me/avatar', file);
  }

  async deleteAvatar(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/users/me/avatar', {
      method: 'DELETE',
    });
  }

  // ========================= POST ENDPOINTS =========================

  async getPosts(params?: PostQueryParams): Promise<any> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/posts${queryString}`);
  }

  async getPostById(id: string): Promise<Post> {
    return this.request<Post>(`/api/posts/${id}`);
  }

  async getPostBySlug(slug: string): Promise<Post> {
    return this.request<Post>(`/api/posts/slug/${slug}`);
  }

  async createPost(data: CreatePostRequest): Promise<Post> {
    return this.request<Post>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: string, data: UpdatePostRequest): Promise<Post> {
    return this.request<Post>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async likePost(id: string): Promise<{ message: string; likes: number }> {
    return this.request<{ message: string; likes: number }>(`/api/posts/${id}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(id: string): Promise<{ message: string; likes: number }> {
    return this.request<{ message: string; likes: number }>(`/api/posts/${id}/like`, {
      method: 'DELETE',
    });
  }

  async getTrendingPosts(): Promise<Post[]> {
    return this.request<Post[]>('/api/posts/trending');
  }

  async getRelatedPosts(id: string): Promise<Post[]> {
    return this.request<Post[]>(`/api/posts/${id}/related`);
  }

  // ========================= COMMENT ENDPOINTS =========================

  async getComments(params?: CommentQueryParams): Promise<Comment[]> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<Comment[]>(`/api/comments${queryString}`);
  }

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    return this.request<Comment>('/api/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComment(id: string, data: UpdateCommentRequest): Promise<Comment> {
    return this.request<Comment>(`/api/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteComment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/comments/${id}`, {
      method: 'DELETE',
    });
  }

  async likeComment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/comments/${id}/like`, {
      method: 'POST',
    });
  }

  async unlikeComment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/comments/${id}/like`, {
      method: 'DELETE',
    });
  }

  // ========================= TAG ENDPOINTS =========================

  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/api/tags');
  }

  async getTagById(id: string): Promise<Tag> {
    return this.request<Tag>(`/api/tags/${id}`);
  }

  async getTagBySlug(slug: string): Promise<Tag> {
    return this.request<Tag>(`/api/tags/slug/${slug}`);
  }

  async createTag(data: CreateTagRequest): Promise<Tag> {
    return this.request<Tag>('/api/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTag(id: string, data: UpdateTagRequest): Promise<Tag> {
    return this.request<Tag>(`/api/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/tags/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================= CATEGORY ENDPOINTS =========================

  async getCategories(params?: { isActive?: boolean; parentCategory?: string }): Promise<Category[]> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<Category[]>(`/api/categories${queryString}`);
  }

  async getCategoryTree(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories/tree');
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`);
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    return this.request<Category>(`/api/categories/slug/${slug}`);
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return this.request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================= DRAFT ENDPOINTS =========================

  async getDrafts(params?: any): Promise<any> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/drafts${queryString}`);
  }

  async getDraftById(id: string): Promise<Draft> {
    return this.request<Draft>(`/api/drafts/${id}`);
  }

  async createDraft(data: CreateDraftRequest): Promise<Draft> {
    return this.request<Draft>('/api/drafts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDraft(id: string, data: UpdateDraftRequest): Promise<Draft> {
    return this.request<Draft>(`/api/drafts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDraft(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/drafts/${id}`, {
      method: 'DELETE',
    });
  }

  async publishDraft(id: string): Promise<{ message: string; post: Post }> {
    return this.request<{ message: string; post: Post }>(`/api/drafts/${id}/publish`, {
      method: 'POST',
    });
  }

  async getDraftVersions(postId: string): Promise<Draft[]> {
    return this.request<Draft[]>(`/api/drafts/versions/${postId}`);
  }

  // ========================= BOOKMARK ENDPOINTS =========================

  async getBookmarks(params?: BookmarkQueryParams): Promise<any> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/bookmarks${queryString}`);
  }

  async getBookmarkById(id: string): Promise<Bookmark> {
    return this.request<Bookmark>(`/api/bookmarks/${id}`);
  }

  async createBookmark(data: CreateBookmarkRequest): Promise<Bookmark> {
    return this.request<Bookmark>('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBookmark(id: string, data: UpdateBookmarkRequest): Promise<Bookmark> {
    return this.request<Bookmark>(`/api/bookmarks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBookmark(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/bookmarks/${id}`, {
      method: 'DELETE',
    });
  }

  async removeBookmarkByPost(postId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/bookmarks/post/${postId}`, {
      method: 'DELETE',
    });
  }

  async getUserCollections(): Promise<any[]> {
    return this.request<any[]>('/api/bookmarks/collections');
  }

  async checkBookmarkStatus(postId: string): Promise<any> {
    return this.request(`/api/bookmarks/check/${postId}`);
  }

  // ========================= COLLECTION ENDPOINTS =========================

  async getCollections(params?: CollectionQueryParams): Promise<any> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/collections${queryString}`);
  }

  async getCollectionById(id: string): Promise<Collection> {
    return this.request<Collection>(`/api/collections/${id}`);
  }

  async getCollectionBySlug(slug: string): Promise<Collection> {
    return this.request<Collection>(`/api/collections/slug/${slug}`);
  }

  async createCollection(data: CreateCollectionRequest): Promise<Collection> {
    return this.request<Collection>('/api/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollection(id: string, data: UpdateCollectionRequest): Promise<Collection> {
    return this.request<Collection>(`/api/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCollection(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/collections/${id}`, {
      method: 'DELETE',
    });
  }

  async addPostToCollection(data: AddPostToCollectionRequest): Promise<Collection> {
    return this.request<Collection>('/api/collections/add-post', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removePostFromCollection(collectionId: string, postId: string): Promise<Collection> {
    return this.request<Collection>(`/api/collections/${collectionId}/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async reorderCollectionPosts(id: string, data: ReorderCollectionPostsRequest): Promise<Collection> {
    return this.request<Collection>(`/api/collections/${id}/reorder`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ========================= MEDIA ENDPOINTS =========================

  async uploadMedia(file: File, data?: { altText?: string; description?: string }): Promise<Media> {
    return this.upload<Media>('/api/media/upload', file, data);
  }

  async uploadMultipleMedia(files: File[]): Promise<Media[]> {
    return this.upload<Media[]>('/api/media/upload/multiple', files);
  }

  async getMedia(params?: MediaQueryParams): Promise<any> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/media${queryString}`);
  }

  async getMediaById(id: string): Promise<Media> {
    return this.request<Media>(`/api/media/${id}`);
  }

  async updateMedia(id: string, data: UpdateMediaRequest): Promise<Media> {
    return this.request<Media>(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMedia(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/media/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserMedia(params?: MediaQueryParams): Promise<any> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/media/my-media${queryString}`);
  }

  // ========================= NOTIFICATION ENDPOINTS =========================

  async getNotifications(params?: NotificationQueryParams): Promise<any> {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request(`/api/notifications${queryString}`);
  }

  async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    return this.request<Notification>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markAsRead(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllAsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================= SEARCH ENDPOINTS =========================

  async search(params: SearchRequest): Promise<SearchResponse> {
    return this.request<SearchResponse>('/api/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async searchPosts(query: string): Promise<Post[]> {
    return this.request<Post[]>(`/api/search/posts?q=${encodeURIComponent(query)}`);
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.request<User[]>(`/api/search/users?q=${encodeURIComponent(query)}`);
  }

  async searchTags(query: string): Promise<Tag[]> {
    return this.request<Tag[]>(`/api/search/tags?q=${encodeURIComponent(query)}`);
  }
}

// Create and export a singleton instance
export const apiClient = new BlogApiClient({
  baseURL: (typeof window !== 'undefined' && (window as any).ENV?.API_URL) || 
           (typeof process !== 'undefined' && process.env?.['VITE_API_URL']) || 
           'http://localhost:3000',
});

export default BlogApiClient;
