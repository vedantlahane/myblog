// API Types and Interfaces for Blog Frontend
// This file contains all TypeScript interfaces for API endpoints

// ========================= BASE TYPES =========================

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface ApiError {
  error: string;
  status?: number;
}

// ========================= USER TYPES =========================

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  isAdmin: boolean;
  isVerified: boolean;
  followers: string[] | User[];
  following: string[] | User[];
  followerCount?: number;
  followingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ========================= AUTH TYPES =========================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ========================= POST TYPES =========================

export interface Post {
id: any;
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: string | User;
  tags: string[] | Tag[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  likes: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  readingTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  status?: 'draft' | 'published';
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  status?: 'draft' | 'published';
}

export interface PostsResponse extends PaginatedResponse<Post> {
  posts: Post[];
  totalPosts: number;
}

// ========================= COMMENT TYPES =========================

export interface Comment {
  _id: string;
  content: string;
  author: string | User;
  post: string | Post;
  parent?: string | Comment;
  replies?: Comment[];
  likes: string[];
  likeCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  post: string;
  parent?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// ========================= TAG TYPES =========================

export interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateTagRequest {
  name?: string;
  description?: string;
  color?: string;
}

// ========================= CATEGORY TYPES =========================

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string | Category;
  icon?: string;
  isActive: boolean;
  order: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategory?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentCategory?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

// ========================= DRAFT TYPES =========================

export interface Draft {
  _id: string;
  post?: string | Post;
  author: string | User;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[] | Tag[];
  version: number;
  changes?: string;
  autoSave: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDraftRequest {
  postId?: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  changes?: string;
  autoSave?: boolean;
}

export interface UpdateDraftRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  changes?: string;
  autoSave?: boolean;
}

export interface DraftsResponse extends PaginatedResponse<Draft> {
  drafts: Draft[];
  totalDrafts: number;
}

// ========================= BOOKMARK TYPES =========================

export interface Bookmark {
  _id: string;
  user: string | User;
  post: string | Post;
  collections?: string[];
  notes?: string;
  progress?: number;
  bookmarkedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookmarkRequest {
  postId: string;
  collections?: string[];
  notes?: string;
  progress?: number;
}

export interface UpdateBookmarkRequest {
  collections?: string[];
  notes?: string;
  progress?: number;
}

export interface BookmarkStatusResponse {
  isBookmarked: boolean;
  bookmark: Bookmark | null;
}

export interface BookmarksResponse extends PaginatedResponse<Bookmark> {
  bookmarks: Bookmark[];
  totalBookmarks: number;
}

export interface UserCollection {
  _id: string;
  count: number;
  lastUpdated: string;
}

// ========================= COLLECTION TYPES =========================

export interface Collection {
  _id: string;
  title: string;
  slug: string;
  description: string;
  author: string | User;
  posts: CollectionPost[];
  coverImage?: string;
  isComplete: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionPost {
  post: string | Post;
  order: number;
}

export interface CreateCollectionRequest {
  title: string;
  description: string;
  coverImage?: string;
  isPublic?: boolean;
}

export interface UpdateCollectionRequest {
  title?: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
  isComplete?: boolean;
}

export interface AddPostToCollectionRequest {
  collectionId: string;
  postId: string;
  order?: number;
}

export interface ReorderCollectionPostsRequest {
  posts: Array<{
    postId: string;
    order: number;
  }>;
}

export interface CollectionsResponse extends PaginatedResponse<Collection> {
  collections: Collection[];
  totalCollections: number;
}

// ========================= MEDIA TYPES =========================

export interface Media {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string | User;
  usedIn: Array<{
    modelType: 'Post' | 'User' | 'Comment';
    modelId: string;
  }>;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
  altText?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMediaRequest {
  altText?: string;
  description?: string;
}

export interface MediaResponse extends PaginatedResponse<Media> {
  media: Media[];
  totalMedia: number;
}

// ========================= NOTIFICATION TYPES =========================

export interface Notification {
  _id: string;
  recipient: string | User;
  sender: string | User;
  type: 'like' | 'comment' | 'follow' | 'post' | 'mention';
  message: string;
  entityType: 'post' | 'comment' | 'user';
  entityId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  recipient: string;
  type: 'like' | 'comment' | 'follow' | 'post' | 'mention';
  message: string;
  entityType: 'post' | 'comment' | 'user';
  entityId: string;
}

export interface NotificationsResponse extends PaginatedResponse<Notification> {
  notifications: Notification[];
  totalNotifications: number;
  unreadCount: number;
}

// ========================= SEARCH TYPES =========================

export interface SearchRequest {
  query: string;
  type?: 'all' | 'posts' | 'users' | 'tags';
  filters?: {
    author?: string;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
  };
}

export interface SearchResult {
  type: 'post' | 'user' | 'tag';
  item: Post | User | Tag;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
}

// ========================= API QUERY PARAMS =========================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PostQueryParams extends PaginationParams {
  sort?: string;
  status?: 'draft' | 'published' | 'archived';
  author?: string;
  tags?: string[];
  search?: string;
}

export interface UserQueryParams extends PaginationParams {
  search?: string;
  isAdmin?: boolean;
}

export interface CommentQueryParams extends PaginationParams {
  post?: string;
  author?: string;
  parent?: string;
}

export interface BookmarkQueryParams extends PaginationParams {
  collection?: string;
  search?: string;
}

export interface CollectionQueryParams extends PaginationParams {
  author?: string;
  isPublic?: boolean;
  search?: string;
}

export interface MediaQueryParams extends PaginationParams {
  mimeType?: string;
  uploadedBy?: string;
}

export interface NotificationQueryParams extends PaginationParams {
  isRead?: boolean;
  type?: string;
}

// ========================= API CLIENT INTERFACE =========================

export interface ApiClient {
  // Auth endpoints
  login(data: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  getCurrentUser(): Promise<User>;
  logout(): Promise<{ message: string }>;

  // User endpoints
  createUser(data: any): Promise<User>;
  getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>>;
  getUserById(id: string): Promise<User>;
  updateUser(id: string, data: UpdateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<{ message: string }>;
  followUser(id: string): Promise<{ message: string }>;
  unfollowUser(id: string): Promise<{ message: string }>;
  getFollowers(id: string): Promise<User[]>;
  getFollowing(id: string): Promise<User[]>;
  getUserPosts(id: string): Promise<Post[]>;
  savePost(postId: string): Promise<{ message: string }>;
  unsavePost(postId: string): Promise<{ message: string }>;
  getSavedPosts(): Promise<Post[]>;
  updateProfile(data: UpdateProfileRequest): Promise<User>;
  changePassword(data: ChangePasswordRequest): Promise<{ message: string }>;
  uploadAvatar(file: File): Promise<{ avatarUrl: string }>;
  deleteAvatar(): Promise<{ message: string }>;

  // Post endpoints
  getPosts(params?: PostQueryParams): Promise<PostsResponse>;
  getPostById(id: string): Promise<Post>;
  getPostBySlug(slug: string): Promise<Post>;
  createPost(data: CreatePostRequest): Promise<Post>;
  updatePost(id: string, data: UpdatePostRequest): Promise<Post>;
  deletePost(id: string): Promise<{ message: string }>;
  likePost(id: string): Promise<{ message: string; likes: number }>;
  unlikePost(id: string): Promise<{ message: string; likes: number }>;
  getTrendingPosts(): Promise<Post[]>;
  getRelatedPosts(id: string): Promise<Post[]>;

  // Comment endpoints
  getCommentsByPost(postId: string): Promise<Comment[]>;
  getCommentReplies(commentId: string): Promise<Comment[]>;
  createComment(data: CreateCommentRequest): Promise<Comment>;
  updateComment(id: string, data: UpdateCommentRequest): Promise<Comment>;
  deleteComment(id: string): Promise<{ message: string }>;
  likeComment(id: string): Promise<{ message: string }>;
  unlikeComment(id: string): Promise<{ message: string }>;

  // Tag endpoints
  getTags(): Promise<Tag[]>;
  getPopularTags(): Promise<Tag[]>;
  getTagById(id: string): Promise<Tag>;
  getPostsByTag(id: string): Promise<Post[]>;
  getTagBySlug(slug: string): Promise<Tag>;
  createTag(data: CreateTagRequest): Promise<Tag>;
  updateTag(id: string, data: UpdateTagRequest): Promise<Tag>;
  deleteTag(id: string): Promise<{ message: string }>;

  // Category endpoints
  getCategories(params?: { isActive?: boolean; parentCategory?: string }): Promise<Category[]>;
  getCategoryTree(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category>;
  getCategoryBySlug(slug: string): Promise<Category>;
  createCategory(data: CreateCategoryRequest): Promise<Category>;
  updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category>;
  deleteCategory(id: string): Promise<{ message: string }>;

  // Draft endpoints
  getDrafts(params?: { postId?: string; autoSave?: boolean } & PaginationParams): Promise<DraftsResponse>;
  getDraftById(id: string): Promise<Draft>;
  createDraft(data: CreateDraftRequest): Promise<Draft>;
  updateDraft(id: string, data: UpdateDraftRequest): Promise<Draft>;
  deleteDraft(id: string): Promise<{ message: string }>;
  publishDraft(id: string): Promise<{ message: string; post: Post }>;
  getDraftVersions(postId: string): Promise<Draft[]>;

  // Bookmark endpoints
  getBookmarks(params?: BookmarkQueryParams): Promise<BookmarksResponse>;
  getBookmarkById(id: string): Promise<Bookmark>;
  createBookmark(data: CreateBookmarkRequest): Promise<Bookmark>;
  updateBookmark(id: string, data: UpdateBookmarkRequest): Promise<Bookmark>;
  deleteBookmark(id: string): Promise<{ message: string }>;
  removeBookmarkByPost(postId: string): Promise<{ message: string }>;
  getBookmarkCollections(): Promise<UserCollection[]>;
  checkBookmarkStatus(postId: string): Promise<BookmarkStatusResponse>;

  // Collection endpoints
  getCollections(params?: CollectionQueryParams): Promise<CollectionsResponse>;
  getCollectionById(id: string): Promise<Collection>;
  getCollectionBySlug(slug: string): Promise<Collection>;
  createCollection(data: CreateCollectionRequest): Promise<Collection>;
  updateCollection(id: string, data: UpdateCollectionRequest): Promise<Collection>;
  deleteCollection(id: string): Promise<{ message: string }>;
  addPostToCollection(data: AddPostToCollectionRequest): Promise<Collection>;
  removePostFromCollection(collectionId: string, postId: string): Promise<Collection>;
  reorderCollectionPosts(id: string, data: ReorderCollectionPostsRequest): Promise<Collection>;
  getUserCollections(): Promise<Collection[]>;

  // Media endpoints
  uploadMedia(file: File, data?: { altText?: string; description?: string }): Promise<Media>;
  uploadMultipleMedia(files: File[]): Promise<Media[]>;
  getMedia(params?: MediaQueryParams): Promise<MediaResponse>;
  getMediaById(id: string): Promise<Media>;
  updateMedia(id: string, data: UpdateMediaRequest): Promise<Media>;
  deleteMedia(id: string): Promise<{ message: string }>;
  getUserMedia(params?: MediaQueryParams): Promise<MediaResponse>;

  // Notification endpoints
  getNotifications(params?: NotificationQueryParams): Promise<NotificationsResponse>;
  createNotification(data: CreateNotificationRequest): Promise<Notification>;
  markAsRead(id: string): Promise<{ message: string }>;
  markAllAsRead(): Promise<{ message: string }>;
  deleteNotification(id: string): Promise<{ message: string }>;
  getUnreadCount(): Promise<{ count: number }>;

  // Search endpoints
  searchPosts(query: string): Promise<Post[]>;
  searchUsers(query: string): Promise<User[]>;
  searchTags(query: string): Promise<Tag[]>;
  globalSearch(query: string): Promise<any>;
}

// ========================= HTTP CLIENT CONFIG =========================

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// ========================= FORM VALIDATION TYPES =========================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}