# Blog API Interface Documentation

This directory contains comprehensive TypeScript interfaces and a type-safe HTTP client for the Blog API.

## Files Overview

### 📁 `types/api.ts`
Complete TypeScript interface definitions for all API entities and operations.

### 📁 `lib/api-client.ts`
Type-safe HTTP client implementation with authentication handling.

### 📁 `examples/api-usage.ts`
Example code showing how to use the API client.

## Quick Start

### 1. Installation
The API client is already configured. Just import and use:

```typescript
import { apiClient } from '../lib/api-client';
```

### 2. Authentication
```typescript
// Login
const response = await apiClient.login({
  email: 'user@example.com',
  password: 'password123'
});

// Token is automatically stored and used for subsequent requests
console.log('User:', response.user);
```

### 3. Basic Usage
```typescript
// Get posts
const posts = await apiClient.getPosts({
  page: 1,
  limit: 10,
  status: 'published'
});

// Create a post
const newPost = await apiClient.createPost({
  title: 'My Blog Post',
  content: 'Post content...',
  tags: ['react', 'typescript'],
  status: 'published'
});

// Upload media
const formData = new FormData();
formData.append('file', imageFile);
const media = await apiClient.uploadMedia(imageFile);
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/stats` - Get user statistics

### Posts
- `GET /api/posts` - Get posts (paginated, filterable)
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/slug/:slug` - Get post by slug
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `DELETE /api/posts/:id/like` - Unlike post
- `GET /api/posts/trending` - Get trending posts
- `GET /api/posts/:id/related` - Get related posts

### Comments
- `GET /api/comments` - Get comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like comment
- `DELETE /api/comments/:id/like` - Unlike comment

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/:id` - Get tag by ID
- `GET /api/tags/slug/:slug` - Get tag by slug
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Categories
- `GET /api/categories` - Get categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/slug/:slug` - Get category by slug
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Media
- `GET /api/media` - Get media files
- `GET /api/media/:id` - Get media by ID
- `POST /api/media/upload` - Upload media
- `PUT /api/media/:id` - Update media metadata
- `DELETE /api/media/:id` - Delete media

### Drafts
- `GET /api/drafts` - Get drafts
- `GET /api/drafts/:id` - Get draft by ID
- `POST /api/drafts` - Create draft
- `PUT /api/drafts/:id` - Update draft
- `DELETE /api/drafts/:id` - Delete draft
- `POST /api/drafts/:id/publish` - Publish draft as post

### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Create bookmark
- `DELETE /api/bookmarks/:id` - Remove bookmark

### Collections
- `GET /api/collections` - Get collections
- `GET /api/collections/:id` - Get collection by ID
- `GET /api/collections/slug/:slug` - Get collection by slug
- `POST /api/collections` - Create collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection
- `POST /api/collections/:id/posts` - Add post to collection
- `DELETE /api/collections/:id/posts/:postId` - Remove post from collection

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/mark-read` - Mark notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

### Search
- `GET /api/search` - Global search across posts, users, tags

## TypeScript Benefits

### 1. Type Safety
All API calls are type-checked at compile time:
```typescript
// ✅ Valid
const post = await apiClient.createPost({
  title: 'Hello World',
  content: 'Post content',
  tags: ['typescript']
});

// ❌ TypeScript error - missing required fields
const invalidPost = await apiClient.createPost({
  title: 'Hello World'
  // Missing 'content' field
});
```

### 2. IntelliSense Support
Your IDE will provide auto-completion for:
- Method names
- Parameter types
- Response types
- Optional/required fields

### 3. Error Prevention
Catch errors at development time instead of runtime:
```typescript
// ❌ TypeScript error - wrong parameter type
await apiClient.getPosts({
  page: '1', // Should be number, not string
  status: 'invalid' // Should be 'draft' | 'published' | 'archived'
});
```

## Error Handling

The API client includes built-in error handling:

```typescript
try {
  const posts = await apiClient.getPosts();
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
    apiClient.clearToken();
    window.location.href = '/login';
  } else if (error.status === 404) {
    // Handle not found
    console.log('Posts not found');
  } else {
    // Handle other errors
    console.error('API Error:', error.message);
  }
}
```

## Configuration

### Environment Variables
Set the API base URL using environment variables:

```bash
# For Vite projects
VITE_API_URL=http://localhost:3000

# For Next.js projects
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Custom Configuration
Create a custom API client instance:

```typescript
import { BlogApiClient } from '../lib/api-client';

const customClient = new BlogApiClient({
  baseURL: 'https://my-api.com'
});
```

## Best Practices

### 1. Use Type Imports
```typescript
import type { Post, User, CreatePostRequest } from '../types/api';
```

### 2. Handle Authentication
```typescript
// Check if user is authenticated
const token = localStorage.getItem('authToken');
if (!token) {
  // Redirect to login
}

// Set token on app initialization
if (token) {
  apiClient.setToken(token);
}
```

### 3. Error Boundaries
Implement error boundaries in your React components to handle API errors gracefully.

### 4. Loading States
Always handle loading states in your UI:
```typescript
const [loading, setLoading] = useState(false);
const [posts, setPosts] = useState<Post[]>([]);

const loadPosts = async () => {
  setLoading(true);
  try {
    const response = await apiClient.getPosts();
    setPosts(response.data);
  } catch (error) {
    console.error('Failed to load posts:', error);
  } finally {
    setLoading(false);
  }
};
```

## Support

If you encounter any issues with the API interfaces or need additional endpoints, please check:

1. The backend route definitions in `/backend/src/routes/`
2. The controller implementations in `/backend/src/controllers/`
3. The model definitions in `/backend/src/models/`

The TypeScript interfaces are designed to match the backend implementation exactly.
