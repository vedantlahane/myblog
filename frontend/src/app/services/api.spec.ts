import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';

import { ApiService } from './api';
import { environment } from '../environments/environment';
import { AuthResponse, User } from '../../types/api';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),        // Must come first
        provideHttpClientTesting(), // Must come second
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    // Complete mock user object with all required properties
    const mockUser: User = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Test user bio',
      isAdmin: false,
      isVerified: true,
      followers: [],
      following: [],
      followerCount: 0,
      followingCount: 0,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    };

    const mockAuthResponse: AuthResponse = {
      user: mockUser,
      token: 'test-token'
    };

    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    service.login(loginData).subscribe(response => {
      expect(response).toEqual(mockAuthResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);
    req.flush(mockAuthResponse);
  });

  it('should handle logout properly', () => {
    // Set initial token
    service['tokenSubject'].next('test-token');

    service.logout().subscribe(() => {
      service.token$.subscribe(token => {
        expect(token).toBeNull();
      });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Logged out successfully' });
  });

  it('should get posts with parameters', () => {
    const mockPost = {
      _id: '1',
      id: '1',
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content',
      excerpt: 'Test excerpt',
      status: 'published' as 'published',
      author: {
        _id: '1',
        name: 'Test Author',
        email: 'author@test.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        bio: 'Author bio',
        isAdmin: false,
        isVerified: true,
        followers: [],
        following: [],
        followerCount: 0,
        followingCount: 0,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      },
      tags: [],
      likes: [],
      likeCount: 0,
      commentCount: 0,
      viewCount: 0,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    };

    const mockPosts = {
      data: [mockPost],
      currentPage: 1,
      totalPages: 1,
      totalItems: 1
    };

    const params = { page: 1, limit: 10, status: 'published' as 'published' };

    service.getPosts(params).subscribe(response => {
      expect(response).toEqual(mockPosts);
    });

    const req = httpMock.expectOne(request => 
      request.url === `${environment.apiUrl}/posts` && 
      request.method === 'GET'
    );
    req.flush(mockPosts);
  });
});
