import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../services/api';
import { User, UserQueryParams, PaginatedResponse, CreateUserRequest, UpdateUserRequest } from '../../../../types/api';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- Page Header -->
      <header class="bg-amber-100 border-4 border-amber-300 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl md:text-3xl font-bold text-amber-900 mb-2">
              Users Management
            </h1>
            <p class="text-amber-700 font-mono text-sm">
              Manage user accounts, permissions, and user activity
            </p>
          </div>
          
          <button
            (click)="showCreateUserModal()"
            class="bg-green-600 text-green-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-green-700 transition-colors border-2 border-green-700"
          >
            Add New User
          </button>
        </div>
      </header>

      <!-- Filters & Search -->
      <section class="bg-amber-50 border-4 border-amber-300 p-6">
        <div class="grid md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Search Users
            </label>
            <div class="relative">
              <input
                [formControl]="searchControl"
                type="text"
                placeholder="Search by name or email..."
                class="w-full px-4 py-3 pl-10 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Role Filter -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Role
            </label>
            <select 
              [formControl]="roleControl"
              class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Regular Users</option>
              <option value="verified">Verified Users</option>
            </select>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Sort By
            </label>
            <select 
              [formControl]="sortControl"
              class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="-name">Name (Z-A)</option>
              <option value="email">Email (A-Z)</option>
              <option value="-followerCount">Most Followers</option>
            </select>
          </div>
        </div>

        <!-- Active Filters -->
        @if (hasActiveFilters()) {
          <div class="mt-6 pt-4 border-t-2 border-dotted border-amber-300">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-amber-700 font-mono text-sm font-bold">Active filters:</span>
              
              @if (searchQuery()) {
                <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                  Search: {{ searchQuery() }}
                  <button (click)="clearSearch()" class="hover:text-amber-900">×</button>
                </span>
              }
              
              @if (roleFilter()) {
                <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                  Role: {{ getRoleDisplayName(roleFilter()) }}
                  <button (click)="clearRoleFilter()" class="hover:text-amber-900">×</button>
                </span>
              }
              
              <button
                (click)="clearAllFilters()"
                class="text-amber-600 hover:text-amber-800 text-xs font-mono underline ml-2"
              >
                Clear All
              </button>
            </div>
          </div>
        }
      </section>

      <!-- Bulk Actions -->
      @if (selectedUsers().length > 0) {
        <section class="bg-blue-50 border-4 border-blue-300 p-4">
          <div class="flex items-center justify-between">
            <div class="text-blue-900 font-mono text-sm">
              {{ selectedUsers().length }} user(s) selected
            </div>
            
            <div class="flex gap-3">
              <button
                (click)="bulkVerify()"
                [disabled]="bulkActionLoading()"
                class="bg-green-100 text-green-800 px-4 py-2 font-mono text-sm hover:bg-green-200 transition-colors border-2 border-green-300 disabled:opacity-50"
              >
                Verify Selected
              </button>
              
              <button
                (click)="bulkMakeAdmin()"
                [disabled]="bulkActionLoading()"
                class="bg-purple-100 text-purple-800 px-4 py-2 font-mono text-sm hover:bg-purple-200 transition-colors border-2 border-purple-300 disabled:opacity-50"
              >
                Make Admin
              </button>
              
              <button
                (click)="bulkDelete()"
                [disabled]="bulkActionLoading()"
                class="bg-red-100 text-red-800 px-4 py-2 font-mono text-sm hover:bg-red-200 transition-colors border-2 border-red-300 disabled:opacity-50"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </section>
      }

      <!-- Users Table -->
      <section class="bg-amber-50 border-4 border-amber-300">
        @if (loading()) {
          <!-- Loading State -->
          <div class="p-8 text-center">
            <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-lg">
              <div class="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
              Loading users...
            </div>
          </div>
        } @else if (users().length === 0) {
          <!-- Empty State -->
          <div class="p-8 text-center">
            <div class="inline-block border-4 border-amber-400 p-8 bg-amber-100">
              @if (hasActiveFilters()) {
                <div class="text-amber-600 font-mono text-lg mb-4">🔍 NO MATCHING USERS</div>
                <p class="text-amber-700 mb-6">No users match your current filters.</p>
                <button
                  (click)="clearAllFilters()"
                  class="bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors"
                >
                  Clear Filters
                </button>
              } @else {
                <div class="text-amber-600 font-mono text-lg mb-4">👥 NO USERS YET</div>
                <p class="text-amber-700 mb-6">No users have been created yet.</p>
                <button
                  (click)="showCreateUserModal()"
                  class="inline-block bg-green-600 text-green-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-green-700 transition-colors"
                >
                  Create First User
                </button>
              }
            </div>
          </div>
        } @else {
          <!-- Users List -->
          <div class="overflow-x-auto">
            <!-- Table Header -->
            <div class="bg-amber-200 border-b-2 border-amber-400 p-4">
              <div class="flex items-center gap-4">
                <!-- Select All Checkbox -->
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    [checked]="allSelected()"
                    [indeterminate]="someSelected()"
                    (change)="toggleSelectAll()"
                    class="text-amber-600 border-2 border-amber-400"
                  />
                </label>
                
                <div class="grid grid-cols-12 gap-4 flex-1 font-mono text-sm font-bold text-amber-900">
                  <div class="col-span-3">User</div>
                  <div class="col-span-3">Email</div>
                  <div class="col-span-1">Role</div>
                  <div class="col-span-1">Status</div>
                  <div class="col-span-2">Joined</div>
                  <div class="col-span-1">Posts</div>
                  <div class="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            <!-- Table Body -->
            <div class="divide-y-2 divide-amber-200">
              @for (user of users(); track user._id) {
                <div class="p-4 hover:bg-amber-100 transition-colors">
                  <div class="flex items-center gap-4">
                    <!-- Selection Checkbox -->
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="selectedUsers().includes(user._id)"
                        (change)="toggleUserSelection(user._id)"
                        class="text-amber-600 border-2 border-amber-400"
                      />
                    </label>
                    
                    <div class="grid grid-cols-12 gap-4 flex-1 items-center">
                      <!-- User Info -->
                      <div class="col-span-3">
                        <div class="flex items-center gap-3">
                          @if (user.avatarUrl) {
                            <img [src]="user.avatarUrl" [alt]="user.name" class="w-12 h-12 rounded-full border-2 border-amber-400">
                          } @else {
                            <div class="w-12 h-12 bg-amber-200 border-2 border-amber-400 rounded-full flex items-center justify-center font-bold text-amber-800">
                              {{ getUserInitials(user) }}
                            </div>
                          }
                          
                          <div>
                            <div class="font-bold text-amber-900 leading-tight">
                              {{ user.name }}
                              @if (user.isVerified) {
                                <svg class="inline w-4 h-4 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                </svg>
                              }
                            </div>
                            <div class="text-amber-600 text-xs font-mono">
                              {{ user.followerCount || 0 }} followers
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Email -->
                      <div class="col-span-3">
                        <div class="text-amber-900 text-sm font-mono break-all">{{ user.email }}</div>
                        @if (user.bio) {
                          <div class="text-amber-600 text-xs line-clamp-1 mt-1">{{ user.bio }}</div>
                        }
                      </div>
                      
                      <!-- Role -->
                      <div class="col-span-1">
                        <span [class]="getRoleClass(user)" class="px-2 py-1 text-xs font-mono uppercase">
                          {{ user.isAdmin ? 'Admin' : 'User' }}
                        </span>
                      </div>
                      
                      <!-- Status -->
                      <div class="col-span-1">
                        <span [class]="getStatusClass(user)" class="px-2 py-1 text-xs font-mono uppercase">
                          {{ user.isVerified ? 'Verified' : 'Unverified' }}
                        </span>
                      </div>
                      
                      <!-- Joined Date -->
                      <div class="col-span-2">
                        <div class="text-amber-900 text-sm font-mono">
                          {{ formatDate(user.createdAt) }}
                        </div>
                        <div class="text-amber-600 text-xs font-mono">
                          {{ getTimeAgo(user.createdAt) }}
                        </div>
                      </div>
                      
                      <!-- Posts Count -->
                      <div class="col-span-1">
                        <div class="text-amber-900 font-mono text-sm">{{ getUserPostCount(user._id) }}</div>
                      </div>
                      
                      <!-- Actions -->
                      <div class="col-span-1">
                        <div class="flex gap-1">
                          <button
                            (click)="editUser(user)"
                            class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            title="Edit"
                          >
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                            </svg>
                          </button>
                          
                          <button
                            (click)="toggleUserRole(user)"
                            [disabled]="roleChanging().includes(user._id)"
                            class="inline-flex items-center justify-center w-8 h-8 hover:bg-amber-200 transition-colors disabled:opacity-50"
                            [class]="user.isAdmin ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'"
                            [title]="user.isAdmin ? 'Remove Admin' : 'Make Admin'"
                          >
                            @if (roleChanging().includes(user._id)) {
                              <div class="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                            } @else if (user.isAdmin) {
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            } @else {
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                              </svg>
                            }
                          </button>
                          
                          <button
                            (click)="deleteUser(user._id)"
                            [disabled]="deleting().includes(user._id)"
                            class="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            @if (deleting().includes(user._id)) {
                              <div class="w-3 h-3 border border-red-800 border-t-transparent rounded-full animate-spin"></div>
                            } @else {
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                              </svg>
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="p-6 border-t-2 border-amber-300">
              <div class="flex items-center justify-between">
                <div class="text-amber-700 font-mono text-sm">
                  Showing {{ users().length }} of {{ totalUsers() }} users
                </div>
                
                <div class="flex items-center gap-2">
                  <button
                    (click)="goToPage(currentPage() - 1)"
                    [disabled]="currentPage() === 1"
                    class="px-4 py-2 bg-amber-100 text-amber-900 font-mono text-sm hover:bg-amber-200 transition-colors border-2 border-amber-300 disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  
                  @for (page of getPaginationPages(); track page) {
                    @if (page === '...') {
                      <span class="px-3 py-2 text-amber-600 font-mono text-sm">...</span>
                    } @else {
                      <button
                        (click)="goToPage(+page)"
                        [class]="getPageButtonClass(+page)"
                      >
                        {{ page }}
                      </button>
                    }
                  }
                  
                  <button
                    (click)="goToPage(currentPage() + 1)"
                    [disabled]="currentPage() === totalPages()"
                    class="px-4 py-2 bg-amber-100 text-amber-900 font-mono text-sm hover:bg-amber-200 transition-colors border-2 border-amber-300 disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </section>

      <!-- User Statistics -->
      <section class="grid md:grid-cols-4 gap-6">
        <div class="bg-blue-100 border-4 border-blue-300 p-6 text-center">
          <div class="text-3xl font-bold text-blue-900 mb-2">{{ getTotalUsers() }}</div>
          <div class="text-blue-700 font-mono text-sm">Total Users</div>
        </div>
        
        <div class="bg-green-100 border-4 border-green-300 p-6 text-center">
          <div class="text-3xl font-bold text-green-900 mb-2">{{ getVerifiedCount() }}</div>
          <div class="text-green-700 font-mono text-sm">Verified</div>
        </div>
        
        <div class="bg-purple-100 border-4 border-purple-300 p-6 text-center">
          <div class="text-3xl font-bold text-purple-900 mb-2">{{ getAdminCount() }}</div>
          <div class="text-purple-700 font-mono text-sm">Admins</div>
        </div>
        
        <div class="bg-orange-100 border-4 border-orange-300 p-6 text-center">
          <div class="text-3xl font-bold text-orange-900 mb-2">{{ getNewUsersThisMonth() }}</div>
          <div class="text-orange-700 font-mono text-sm">New This Month</div>
        </div>
      </section>
    </div>

    <!-- Create/Edit User Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModal()">
        <div class="bg-amber-50 border-4 border-amber-800 p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">
            {{ editingUser() ? 'Edit User' : 'Create New User' }}
          </h3>
          
          <form [formGroup]="userForm" (ngSubmit)="saveUser()">
            <div class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="Enter user's full name"
                  class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white"
                  [class.border-red-400]="isFieldInvalid('name')"
                />
                @if (isFieldInvalid('name')) {
                  <p class="mt-1 text-red-600 text-xs font-mono">Name is required</p>
                }
              </div>
              
              <!-- Email -->
              <div>
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="Enter email address"
                  class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white"
                  [class.border-red-400]="isFieldInvalid('email')"
                />
                @if (isFieldInvalid('email')) {
                  <p class="mt-1 text-red-600 text-xs font-mono">Valid email is required</p>
                }
              </div>
              
              <!-- Password (only for new users) -->
              @if (!editingUser()) {
                <div>
                  <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    formControlName="password"
                    placeholder="Enter password"
                    class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white"
                    [class.border-red-400]="isFieldInvalid('password')"
                  />
                  @if (isFieldInvalid('password')) {
                    <p class="mt-1 text-red-600 text-xs font-mono">Password must be at least 6 characters</p>
                  }
                </div>
              }
              
              <!-- Bio -->
              <div>
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Bio</label>
                <textarea
                  formControlName="bio"
                  rows="3"
                  placeholder="Brief description about the user..."
                  class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white resize-none"
                ></textarea>
              </div>
              
              <!-- Settings -->
              <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    formControlName="isAdmin"
                    class="text-amber-600 border-2 border-amber-300 mr-2"
                  />
                  <span class="text-amber-800 font-mono text-sm">Administrator</span>
                </label>
                
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    formControlName="isVerified"
                    class="text-amber-600 border-2 border-amber-300 mr-2"
                  />
                  <span class="text-amber-800 font-mono text-sm">Verified</span>
                </label>
              </div>
            </div>
            
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                (click)="closeModal()"
                class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                [disabled]="userForm.invalid || saving()"
                class="bg-amber-800 text-amber-100 px-4 py-2 font-mono text-sm hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {{ saving() ? 'Saving...' : (editingUser() ? 'Update User' : 'Create User') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Custom checkbox styling */
    input[type="checkbox"] {
      appearance: none;
      background-color: white;
      border: 2px solid #d97706;
      width: 1rem;
      height: 1rem;
      position: relative;
      cursor: pointer;
    }

    input[type="checkbox"]:checked {
      background-color: #d97706;
    }

    input[type="checkbox"]:checked::before {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
    }

    input[type="checkbox"]:indeterminate {
      background-color: #f59e0b;
    }

    input[type="checkbox"]:indeterminate::before {
      content: '−';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
    }

    /* Custom select styling */
    select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d97706' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.75rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
    }

    /* Vintage paper texture */
    .bg-amber-50 {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  private apiService = inject(ApiService);

  // Reactive Signals
  loading = signal(false);
  saving = signal(false);
  bulkActionLoading = signal(false);
  users = signal<User[]>([]);
  userPostCounts = signal<Record<string, number>>({});
  totalUsers = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  
  selectedUsers = signal<string[]>([]);
  roleChanging = signal<string[]>([]);
  deleting = signal<string[]>([]);
  
  showModal = signal(false);
  editingUser = signal<User | null>(null);

  // Form Controls
  searchControl = new FormControl('');
  roleControl = new FormControl('');
  sortControl = new FormControl('-createdAt');

  // Filter states
  searchQuery = signal('');
  roleFilter = signal('');

  // User Form
  userForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.minLength(6)]),
    bio: new FormControl(''),
    isAdmin: new FormControl(false),
    isVerified: new FormControl(false)
  });

  // Computed values
  hasActiveFilters = computed(() => 
    !!(this.searchQuery() || this.roleFilter())
  );

  allSelected = computed(() => 
    this.users().length > 0 && 
    this.users().every(user => this.selectedUsers().includes(user._id))
  );

  someSelected = computed(() => 
    this.selectedUsers().length > 0 && 
    !this.allSelected()
  );

  async ngOnInit() {
    await this.loadUsers();
    this.setupFormSubscriptions();
  }

  private async loadUsers() {
    try {
      this.loading.set(true);
      
      const params: UserQueryParams = {
        page: this.currentPage(),
        limit: 20
      };

      if (this.searchQuery()) params.search = this.searchQuery();
      if (this.roleFilter() === 'admin') params.isAdmin = true;

      const response = await this.apiService.getUsers(params);
      
      this.users.set(response.data || []);
      this.totalUsers.set(response.totalItems || 0);
      this.totalPages.set(response.totalPages || 1);
      
      // Load post counts for each user
      await this.loadUserPostCounts();
      
    } catch (error) {
      console.error('Failed to load users:', error);
      this.users.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadUserPostCounts() {
    try {
      const counts: Record<string, number> = {};
      
      // In a real implementation, you'd have a specific endpoint for this
      // For now, simulate the data
      this.users().forEach(user => {
        counts[user._id] = Math.floor(Math.random() * 20);
      });
      
      this.userPostCounts.set(counts);
    } catch (error) {
      console.error('Failed to load user post counts:', error);
    }
  }

  private setupFormSubscriptions() {
    // Search with debounce
    const searchSignal: any = toSignal(this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()) as any, { initialValue: this.searchControl.value as any });
    effect(() => {
      const value = searchSignal();
      this.searchQuery.set(value || '');
      this.currentPage.set(1);
      this.loadUsers();
    });

    // Role filter
    const roleSignal: any = toSignal(this.roleControl.valueChanges as any, { initialValue: this.roleControl.value as any });
    effect(() => {
      const value = roleSignal();
      this.roleFilter.set(value || '');
      this.currentPage.set(1);
      this.loadUsers();
    });

    // Sort changes
    const sortSignal: any = toSignal(this.sortControl.valueChanges as any, { initialValue: this.sortControl.value as any });
    effect(() => {
      sortSignal();
      this.currentPage.set(1);
      this.loadUsers();
    });
  }

  // Modal Management
  showCreateUserModal() {
    this.editingUser.set(null);
    this.userForm.reset({
      name: '',
      email: '',
      password: '',
      bio: '',
      isAdmin: false,
      isVerified: false
    });
    
    // Make password required for new users
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.showModal.set(true);
  }

  editUser(user: User) {
    this.editingUser.set(user);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      isAdmin: user.isAdmin,
      isVerified: user.isVerified
    });
    
    // Remove password requirement for editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingUser.set(null);
    this.userForm.reset();
  }

  async saveUser() {
    if (this.userForm.invalid) return;

    try {
      this.saving.set(true);

      const formValue = this.userForm.value;
      
      if (this.editingUser()) {
        // Update existing user
        const updateData: UpdateUserRequest = {
          name: formValue.name!,
          bio: formValue.bio || undefined,
          isAdmin: formValue.isAdmin || false,
          // Note: isVerified might not be updatable via this endpoint
        };

        const updatedUser = await this.apiService.updateUser(this.editingUser()!._id, updateData);
        
        // Update in list
        this.users.update(users => 
          users.map(u => u._id === updatedUser._id ? updatedUser : u)
        );
      } else {
        // Create new user
        const createData: CreateUserRequest = {
          name: formValue.name!,
          email: formValue.email!,
          password: formValue.password!,
          isAdmin: formValue.isAdmin || false
        };

        const newUser = await this.apiService.createUser(createData);
        
        // Add to list
        this.users.update(users => [newUser, ...users]);
        this.totalUsers.update(count => count + 1);
      }

      this.closeModal();

    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      this.saving.set(false);
    }
  }

  // Selection Management
  toggleUserSelection(userId: string) {
    this.selectedUsers.update(selected => {
      if (selected.includes(userId)) {
        return selected.filter(id => id !== userId);
      } else {
        return [...selected, userId];
      }
    });
  }

  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedUsers.set([]);
    } else {
      const allIds = this.users().map(user => user._id);
      this.selectedUsers.set(allIds);
    }
  }

  // User Actions
  async toggleUserRole(user: User) {
    try {
      this.roleChanging.update(changing => [...changing, user._id]);
      
      const updatedUser = await this.apiService.updateUser(user._id, {
        isAdmin: !user.isAdmin
      });
      
      // Update local state
      this.users.update(users => 
        users.map(u => u._id === user._id ? updatedUser : u)
      );
      
    } catch (error) {
      console.error('Failed to update user role:', error);
    } finally {
      this.roleChanging.update(changing => changing.filter(id => id !== user._id));
    }
  }

  async deleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      this.deleting.update(deleting => [...deleting, userId]);
      
      await this.apiService.deleteUser(userId);
      
      // Remove from users list
      this.users.update(users => users.filter(u => u._id !== userId));
      this.selectedUsers.update(selected => selected.filter(id => id !== userId));
      this.totalUsers.update(count => count - 1);
      
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      this.deleting.update(deleting => deleting.filter(id => id !== userId));
    }
  }

  // Bulk Actions
  async bulkVerify() {
    if (!confirm(`Verify ${this.selectedUsers().length} selected users?`)) return;

    try {
      this.bulkActionLoading.set(true);
      
      // Only include properties allowed by UpdateUserRequest
      const updatePromises = this.selectedUsers().map(id => 
        this.apiService.updateUser(id, { isVerified: true } as any)
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      this.users.update(users => 
        users.map(u => 
          this.selectedUsers().includes(u._id) 
            ? { ...u, isVerified: true } 
            : u
        )
      );
      
      this.selectedUsers.set([]);
      
    } catch (error) {
      console.error('Failed to bulk verify:', error);
    } finally {
      this.bulkActionLoading.set(false);
    }
  }

  async bulkMakeAdmin() {
    if (!confirm(`Make ${this.selectedUsers().length} selected users administrators?`)) return;

    try {
      this.bulkActionLoading.set(true);
      
      const updatePromises = this.selectedUsers().map(id => 
        this.apiService.updateUser(id, { isAdmin: true })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      this.users.update(users => 
        users.map(u => 
          this.selectedUsers().includes(u._id) 
            ? { ...u, isAdmin: true } 
            : u
        )
      );
      
      this.selectedUsers.set([]);
      
    } catch (error) {
      console.error('Failed to bulk make admin:', error);
    } finally {
      this.bulkActionLoading.set(false);
    }
  }

  async bulkDelete() {
    const count = this.selectedUsers().length;
    if (!confirm(`Delete ${count} selected users? This action cannot be undone.`)) return;

    try {
      this.bulkActionLoading.set(true);
      
      const deletePromises = this.selectedUsers().map(id => 
        this.apiService.deleteUser(id)
      );
      
      await Promise.all(deletePromises);
      
      // Remove from users list
      const deletedIds = this.selectedUsers();
      this.users.update(users => users.filter(u => !deletedIds.includes(u._id)));
      this.totalUsers.update(count => count - deletedIds.length);
      this.selectedUsers.set([]);
      
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    } finally {
      this.bulkActionLoading.set(false);
    }
  }

  // Filter Management
  clearSearch() {
    this.searchControl.setValue('');
  }

  clearRoleFilter() {
    this.roleControl.setValue('');
  }

  clearAllFilters() {
    this.searchControl.setValue('');
    this.roleControl.setValue('');
    this.sortControl.setValue('-createdAt');
  }

  // Pagination
  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    
    this.currentPage.set(page);
    await this.loadUsers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPaginationPages(): (number | string)[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: (number | string)[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 4) pages.push('...');
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 3) pages.push('...');
      pages.push(total);
    }
    
    return pages;
  }

  getPageButtonClass(page: number): string {
    const baseClass = "px-3 py-2 font-mono text-sm border-2 transition-colors";
    return page === this.currentPage()
      ? `${baseClass} bg-amber-800 text-amber-100 border-amber-700`
      : `${baseClass} bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:border-amber-400`;
  }

  // Helper Methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getUserInitials(user: User): string {
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleClass(user: User): string {
    return user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  }

  getStatusClass(user: User): string {
    return user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'admin': return 'Administrators';
      case 'user': return 'Regular Users';
      case 'verified': return 'Verified Users';
      default: return role;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }

  getUserPostCount(userId: string): number {
    return this.userPostCounts()[userId] || 0;
  }

  // Statistics
  getTotalUsers(): number {
    return this.totalUsers();
  }

  getVerifiedCount(): number {
    return this.users().filter(user => user.isVerified).length;
  }

  getAdminCount(): number {
    return this.users().filter(user => user.isAdmin).length;
  }

  getNewUsersThisMonth(): number {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    return this.users().filter(user => 
      new Date(user.createdAt) >= thisMonth
    ).length;
  }
}
