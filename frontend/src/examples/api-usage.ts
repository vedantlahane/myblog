/**
 * Example usage of the Blog API Client
 * This file demonstrates how to use the type-safe API client
 */

import { apiClient } from '../lib/api-client';
import type { 
  LoginRequest, 
  CreatePostRequest, 
  Post, 
  User,
  PaginatedResponse 
} from '../types/api';

// ============= AUTHENTICATION EXAMPLES =============

export async function loginExample() {
  try {
    const loginData: LoginRequest = {
      email: 'user@example.com',
      password: 'password123'
    };

    const response = await apiClient.login(loginData);
    console.log('Login successful:', response.user);
    console.log('Token:', response.token);

    // Token is automatically set in the client
  } catch (error) {
    console.error('Login failed:', error);
  }
}

export async function getCurrentUserExample() {
  try {
    const user: User = await apiClient.getCurrentUser();
    console.log('Current user:', user);
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
}

// ============= POST EXAMPLES =============

export async function createPostExample() {
  try {
    const postData: CreatePostRequest = {
      title: 'My First Blog Post',
      content: 'This is the content of my blog post...',
      excerpt: 'A brief excerpt of the post',
      tags: ['react', 'typescript', 'web-development'],
      status: 'published'
    };

    const newPost: Post = await apiClient.createPost(postData);
    console.log('Post created:', newPost);
  } catch (error) {
    console.error('Failed to create post:', error);
  }
}

export async function getPostsExample() {
  try {
    const posts: PaginatedResponse<Post> = await apiClient.getPosts({
      page: 1,
      limit: 10,
      status: 'published',
      tags: ['react']
    });

    console.log('Posts:', posts.data);
    console.log('Total pages:', posts.totalPages);
    console.log('Current page:', posts.currentPage);
  } catch (error) {
    console.error('Failed to get posts:', error);
  }
}

export async function likePostExample(postId: string) {
  try {
    const result = await apiClient.likePost(postId);
    console.log('Post liked:', result);
  } catch (error) {
    console.error('Failed to like post:', error);
  }
}

// ============= MEDIA UPLOAD EXAMPLE =============

export async function uploadImageExample(file: File) {
  try {
    const media = await apiClient.uploadMedia(file, {
      altText: 'Blog post image',
      description: 'An image for my blog post'
    });

    console.log('Image uploaded:', media);
    console.log('Image URL:', media.url);
  } catch (error) {
    console.error('Failed to upload image:', error);
  }
}

// ============= COMMENT EXAMPLE =============

export async function addCommentExample(postId: string) {
  try {
    const comment = await apiClient.createComment({
      content: 'Great post! Thanks for sharing.',
      post: postId
    });

    console.log('Comment created:', comment);
  } catch (error) {
    console.error('Failed to create comment:', error);
  }
}

// ============= SEARCH EXAMPLE =============

export async function searchExample() {
  try {
    const searchResults = await apiClient.search({
      query: 'react hooks',
      type: 'posts'
    });

    console.log('Search results:', searchResults);
  } catch (error) {
    console.error('Search failed:', error);
  }
}

// ============= COLLECTION EXAMPLE =============

export async function createCollectionExample() {
  try {
    const collection = await apiClient.createCollection({
      title: 'React Best Practices',
      description: 'A collection of posts about React best practices',
      isPublic: true
    });

    console.log('Collection created:', collection);
  } catch (error) {
    console.error('Failed to create collection:', error);
  }
}

// ============= COMPLETE WORKFLOW EXAMPLE =============

export async function completeWorkflowExample() {
  try {
    // 1. Login
    await loginExample();

    // 2. Get current user
    const user = await apiClient.getCurrentUser();
    console.log('Logged in as:', user.name);

    // 3. Create a post
    const post = await apiClient.createPost({
      title: 'TypeScript API Client Tutorial',
      content: 'Learn how to use our type-safe API client...',
      tags: ['typescript', 'api', 'tutorial'],
      status: 'published'
    });

    // 4. Like the post
    await apiClient.likePost(post._id);

    // 5. Add a comment
    await apiClient.createComment({
      content: 'Excellent tutorial!',
      post: post._id
    });

    // 6. Create a bookmark
    await apiClient.createBookmark({
      postId: post._id
    });

    console.log('Workflow completed successfully!');
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

// ============= ERROR HANDLING UTILITY =============

export function handleApiError(error: any) {
  if (error.status === 401) {
    // Handle unauthorized - redirect to login
    console.log('Unauthorized - redirecting to login');
    apiClient.clearToken();
    // window.location.href = '/login';
  } else if (error.status === 403) {
    // Handle forbidden
    console.log('Forbidden - insufficient permissions');
  } else if (error.status === 404) {
    // Handle not found
    console.log('Resource not found');
  } else if (error.status >= 500) {
    // Handle server errors
    console.log('Server error - please try again later');
  } else {
    // Handle other errors
    console.log('Error:', error.message);
  }
}
