import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { User } from '../../../../types/api';

interface AccountStats {
  totalPosts: number;
  totalComments: number;
  totalBookmarks: number;
  totalCollections: number;
  followerCount: number;
  followingCount: number;
}

interface SessionInfo {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      <!-- Header -->
      <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
        <div class="text-center border-2 border-dotted border-amber-700 p-6">
          <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
            Account Settings
          </div>
          
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-3">
            Account Management
          </h1>
          <p class="text-amber-700 text-lg font-mono">
            Manage your account settings, privacy, and data
          </p>
        </div>
      </header>

      <div class="max-w-4xl mx-auto px-4">
        <!-- Settings Navigation -->
        <section class="mb-8">
          <div class="bg-amber-50 border-4 border-amber-300 p-4">
            <nav class="flex justify-center">
              <div class="flex gap-6 flex-wrap">
                <a
                  routerLink="/settings/profile"
                  class="px-4 py-3 font-mono text-sm uppercase tracking-wider border-2 transition-colors bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:border-amber-400"
                >
                  Profile Settings
                </a>
                
                <button
                  class="px-4 py-3 font-mono text-sm uppercase tracking-wider border-2 transition-colors bg-amber-800 text-amber-100 border-amber-700"
                >
                  Account Settings
                </button>
                
                <a
                  routerLink="/settings/notifications"
                  class="px-4 py-3 font-mono text-sm uppercase tracking-wider border-2 transition-colors bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:border-amber-400"
                >
                  Notifications
                </a>
              </div>
            </nav>
          </div>
        </section>

        <!-- Account Overview -->
        <section class="mb-12">
          <div class="bg-amber-50 border-4 border-amber-300 p-8">
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
              Account Overview
            </h2>

            <div class="grid md:grid-cols-2 gap-8">
              <!-- Account Information -->
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Account Information</h3>
                
                <div class="space-y-4">
                  <div class="flex justify-between items-center p-4 bg-amber-100 border-2 border-amber-400">
                    <div>
                      <h4 class="font-bold text-amber-900">Account ID</h4>
                      <p class="text-amber-700 text-sm font-mono">{{ user()?.id || user()?._id || 'Loading...' }}</p>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center p-4 bg-amber-100 border-2 border-amber-400">
                    <div>
                      <h4 class="font-bold text-amber-900">Account Status</h4>
                      <div class="flex items-center gap-2">
                        <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span class="text-amber-700 text-sm">Active</span>
                        @if (user()?.isVerified) {
                          <svg class="w-4 h-4 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-blue-600 text-sm">Verified</span>
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center p-4 bg-amber-100 border-2 border-amber-400">
                    <div>
                      <h4 class="font-bold text-amber-900">Member Since</h4>
                      <p class="text-amber-700 text-sm">{{ formatJoinDate(user()?.createdAt || '') }}</p>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center p-4 bg-amber-100 border-2 border-amber-400">
                    <div>
                      <h4 class="font-bold text-amber-900">Account Type</h4>
                      <p class="text-amber-700 text-sm">
                        {{ user()?.isAdmin ? 'Administrator' : 'Standard User' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Account Statistics -->
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Account Statistics</h3>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center p-4 bg-amber-100 border-2 border-amber-400">
                    <div class="text-2xl font-bold text-amber-900">{{ accountStats().totalPosts }}</div>
                    <div class="text-amber-700 font-mono text-sm">Articles</div>
                  </div>
                  
                  <div class="text-center p-4 bg-amber-100 border-2 border-amber-400">
                    <div class="text-2xl font-bold text-amber-900">{{ accountStats().totalComments }}</div>
                    <div class="text-amber-700 font-mono text-sm">Comments</div>
                  </div>
                  
                  <div class="text-center p-4 bg-amber-100 border-2 border-amber-400">
                    <div class="text-2xl font-bold text-amber-900">{{ accountStats().totalBookmarks }}</div>
                    <div class="text-amber-700 font-mono text-sm">Bookmarks</div>
                  </div>
                  
                  <div class="text-center p-4 bg-amber-100 border-2 border-amber-400">
                    <div class="text-2xl font-bold text-amber-900">{{ accountStats().totalCollections }}</div>
                    <div class="text-amber-700 font-mono text-sm">Collections</div>
                  </div>
                  
                  <div class="text-center p-4 bg-amber-100 border-2 border-amber-400">
                    <div class="text-2xl font-bold text-amber-900">{{ accountStats().followerCount }}</div>
                    <div class="text-amber-700 font-mono text-sm">Followers</div>
                  </div>
                  
                  <div class="text-center p-4 bg-amber-100 border-2 border-amber-400">
                    <div class="text-2xl font-bold text-amber-900">{{ accountStats().followingCount }}</div>
                    <div class="text-amber-700 font-mono text-sm">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Email Settings -->
        <section class="mb-12">
          <div class="bg-amber-50 border-4 border-amber-300 p-8">
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
              Email Settings
            </h2>

            <div class="space-y-6">
              <!-- Primary Email -->
              <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                <div>
                  <h4 class="font-bold text-amber-900">Primary Email</h4>
                  <p class="text-amber-700 text-sm">{{ user()?.email }}</p>
                </div>
                <div class="flex items-center gap-2">
                  @if (user()?.isVerified) {
                    <span class="bg-green-100 text-green-800 px-3 py-1 text-xs font-mono uppercase">Verified</span>
                  } @else {
                    <span class="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-mono uppercase">Unverified</span>
                    <button class="bg-blue-100 text-blue-800 px-3 py-1 text-xs font-mono uppercase hover:bg-blue-200 transition-colors">
                      Verify
                    </button>
                  }
                </div>
              </div>

              <!-- Change Email -->
              <div class="p-6 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-4">Change Email Address</h4>
                
                <form [formGroup]="emailForm" (ngSubmit)="changeEmail()" class="space-y-4">
                  <div>
                    <label class="block text-amber-900 font-mono text-sm font-bold mb-2">New Email Address</label>
                    <input
                      type="email"
                      formControlName="newEmail"
                      placeholder="Enter new email address"
                      class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white"
                      [class.border-red-400]="isEmailFieldInvalid('newEmail')"
                    />
                    @if (isEmailFieldInvalid('newEmail')) {
                      <p class="mt-1 text-red-600 text-xs font-mono">Please enter a valid email address</p>
                    }
                  </div>

                  <div>
                    <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Current Password</label>
                    <input
                      type="password"
                      formControlName="currentPassword"
                      placeholder="Enter your current password"
                      class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white"
                      [class.border-red-400]="isEmailFieldInvalid('currentPassword')"
                    />
                    @if (isEmailFieldInvalid('currentPassword')) {
                      <p class="mt-1 text-red-600 text-xs font-mono">Current password is required</p>
                    }
                  </div>

                  <div class="flex justify-end">
                    <button
                      type="submit"
                      [disabled]="emailForm.invalid || changingEmail()"
                      class="bg-amber-800 text-amber-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 disabled:opacity-50"
                    >
                      {{ changingEmail() ? 'Updating...' : 'Update Email' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <!-- Active Sessions -->
        <section class="mb-12">
          <div class="bg-amber-50 border-4 border-amber-300 p-8">
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
              Active Sessions
            </h2>

            <div class="space-y-4">
              @if (loadingSessions()) {
                <div class="text-center py-8">
                  <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-sm">
                    <div class="w-5 h-5 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                    Loading sessions...
                  </div>
                </div>
              } @else {
                @for (session of activeSessions(); track session.id) {
                  <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-amber-200 border-2 border-amber-500 flex items-center justify-center">
                        @if (session.device.includes('Mobile')) {
                          <svg class="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                          </svg>
                        } @else {
                          <svg class="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"></path>
                          </svg>
                        }
                      </div>
                      
                      <div>
                        <h4 class="font-bold text-amber-900">{{ session.device }}</h4>
                        <div class="text-amber-700 text-sm space-y-1">
                          <p>{{ session.location }}</p>
                          <p class="font-mono">{{ session.ipAddress }}</p>
                          <p>Last active: {{ formatLastActive(session.lastActive) }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                      @if (session.current) {
                        <span class="bg-green-100 text-green-800 px-3 py-1 text-xs font-mono uppercase">Current</span>
                      } @else {
                        <button
                          (click)="terminateSession(session.id)"
                          [disabled]="terminatingSession().includes(session.id)"
                          class="bg-red-100 text-red-800 px-3 py-1 text-xs font-mono uppercase hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          {{ terminatingSession().includes(session.id) ? 'Terminating...' : 'End Session' }}
                        </button>
                      }
                    </div>
                  </div>
                }
              }
              
              <div class="text-center pt-4">
                <button
                  (click)="terminateAllSessions()"
                  [disabled]="terminatingAllSessions()"
                  class="bg-red-600 text-red-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-red-700 transition-colors border-2 border-red-700 disabled:opacity-50"
                >
                  {{ terminatingAllSessions() ? 'Terminating...' : 'End All Other Sessions' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Data Management -->
        <section class="mb-12">
          <div class="bg-amber-50 border-4 border-amber-300 p-8">
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
              Data Management
            </h2>

            <div class="space-y-6">
              <!-- Data Export -->
              <div class="flex items-center justify-between p-6 bg-amber-100 border-2 border-amber-400">
                <div>
                  <h4 class="font-bold text-amber-900 mb-2">Export Your Data</h4>
                  <p class="text-amber-700 text-sm mb-2">
                    Download a copy of all your account data including posts, comments, and bookmarks.
                  </p>
                  <p class="text-amber-600 text-xs font-mono">
                    Export includes: Articles, Comments, Bookmarks, Collections, Profile Data
                  </p>
                </div>
                <button
                  (click)="requestDataExport()"
                  [disabled]="exportingData()"
                  class="bg-blue-100 text-blue-800 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-blue-200 transition-colors border-2 border-blue-300 disabled:opacity-50"
                >
                  {{ exportingData() ? 'Preparing...' : 'Request Export' }}
                </button>
              </div>

              <!-- Data Portability -->
              <div class="flex items-center justify-between p-6 bg-amber-100 border-2 border-amber-400">
                <div>
                  <h4 class="font-bold text-amber-900 mb-2">Data Portability</h4>
                  <p class="text-amber-700 text-sm mb-2">
                    Transfer your data to another platform or service that supports data import.
                  </p>
                  <p class="text-amber-600 text-xs font-mono">
                    Standard formats: JSON, XML, CSV
                  </p>
                </div>
                <button class="bg-blue-100 text-blue-800 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-blue-200 transition-colors border-2 border-blue-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Account Closure -->
        <section class="mb-12">
          <div class="bg-red-50 border-4 border-red-400 p-8">
            <h2 class="font-serif text-2xl font-bold text-red-900 mb-6 border-b-2 border-dotted border-red-500 pb-2">
              Account Closure
            </h2>

            <div class="space-y-6">
              <!-- Account Deactivation -->
              <div class="p-6 bg-red-100 border-2 border-red-300">
                <h3 class="font-serif text-xl font-bold text-red-900 mb-4">Temporarily Deactivate Account</h3>
                <p class="text-red-800 mb-4">
                  Your account will be hidden from public view, but your data will be preserved. 
                  You can reactivate your account at any time by logging back in.
                </p>
                
                <div class="flex items-center gap-4">
                  <button
                    (click)="showDeactivateModal()"
                    class="bg-orange-100 text-orange-800 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-orange-200 transition-colors border-2 border-orange-300"
                  >
                    Deactivate Account
                  </button>
                  
                  <span class="text-red-600 text-sm font-mono">Reversible</span>
                </div>
              </div>

              <!-- Account Deletion -->
              <div class="p-6 bg-red-100 border-2 border-red-400">
                <h3 class="font-serif text-xl font-bold text-red-900 mb-4">Permanently Delete Account</h3>
                <p class="text-red-800 mb-4">
                  Your account and all associated data will be permanently deleted. 
                  This action cannot be undone.
                </p>
                
                <div class="flex items-center gap-4">
                  <button
                    (click)="showDeleteModal()"
                    class="bg-red-600 text-red-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-red-700 transition-colors border-2 border-red-700"
                  >
                    Delete Account
                  </button>
                  
                  <span class="text-red-600 text-sm font-mono font-bold">Irreversible</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Success Messages -->
        @if (successMessage()) {
          <div class="fixed top-4 right-4 bg-green-100 border-4 border-green-400 p-4 z-50">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-green-800 font-mono text-sm">{{ successMessage() }}</span>
              <button (click)="clearSuccessMessage()" class="text-green-600 hover:text-green-800 ml-2">×</button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Deactivate Confirmation Modal -->
    @if (showDeactivateDialog()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="hideDeactivateModal()">
        <div class="bg-orange-50 border-4 border-orange-400 p-8 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          <h3 class="font-serif text-xl font-bold text-orange-900 mb-4">Deactivate Account</h3>
          
          <p class="text-orange-800 mb-6">
            Are you sure you want to deactivate your account? You can reactivate it anytime by logging back in.
          </p>
          
          <div class="flex justify-end gap-3">
            <button
              (click)="hideDeactivateModal()"
              class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors"
            >
              Cancel
            </button>
            
            <button
              (click)="deactivateAccount()"
              [disabled]="deactivating()"
              class="bg-orange-600 text-orange-100 px-4 py-2 font-mono text-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {{ deactivating() ? 'Deactivating...' : 'Deactivate Account' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (showDeleteDialog()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="hideDeleteModal()">
        <div class="bg-red-50 border-4 border-red-400 p-8 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          <h3 class="font-serif text-xl font-bold text-red-900 mb-4">Delete Account</h3>
          
          <p class="text-red-800 mb-6">
            This will permanently delete your account and all data. This action cannot be undone.
          </p>
          
          <div class="mb-6">
            <label class="block text-red-900 font-mono text-sm font-bold mb-2">
              Type "DELETE" to confirm:
            </label>
            <input
              [(ngModel)]="deleteConfirmation"
              type="text"
              placeholder="DELETE"
              class="w-full px-4 py-3 border-2 border-red-300 focus:border-red-600 focus:outline-none bg-white"
            />
          </div>
          
          <div class="flex justify-end gap-3">
            <button
              (click)="hideDeleteModal()"
              class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors"
            >
              Cancel
            </button>
            
            <button
              (click)="deleteAccount()"
              [disabled]="deleteConfirmation !== 'DELETE' || deleting()"
              class="bg-red-600 text-red-100 px-4 py-2 font-mono text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ deleting() ? 'Deleting...' : 'Delete Account' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* Vintage paper texture */
    .bg-amber-50 {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Focus styles */
    input:focus, textarea:focus, select:focus {
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }

    /* Animation for success message */
    .success-message {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class AccountSettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Reactive Signals
  user = signal<User | null>(null);
  accountStats = signal<AccountStats>({
    totalPosts: 0,
    totalComments: 0,
    totalBookmarks: 0,
    totalCollections: 0,
    followerCount: 0,
    followingCount: 0
  });
  
  activeSessions = signal<SessionInfo[]>([]);
  loadingSessions = signal(false);
  changingEmail = signal(false);
  exportingData = signal(false);
  deactivating = signal(false);
  deleting = signal(false);
  terminatingSession = signal<string[]>([]);
  terminatingAllSessions = signal(false);
  
  showDeactivateDialog = signal(false);
  showDeleteDialog = signal(false);
  deleteConfirmation = '';
  
  successMessage = signal('');

  // Email Form
  emailForm = new FormGroup({
    newEmail: new FormControl('', [Validators.required, Validators.email]),
    currentPassword: new FormControl('', [Validators.required])
  });

  async ngOnInit() {
    // Check authentication
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/settings/account' }
      });
      return;
    }

    await Promise.all([
      this.loadUserData(),
      this.loadAccountStats(),
      this.loadActiveSessions()
    ]);
  }

  private async loadUserData() {
    try {
      const user = await this.apiService.getCurrentUser();
      this.user.set(user);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  private async loadAccountStats() {
    try {
      // In a real implementation, you'd have specific endpoints for these stats
      // For now, we'll simulate the data
      const user = this.user();
      if (user) {
        this.accountStats.set({
          totalPosts: 0, // Would come from API
          totalComments: 0,
          totalBookmarks: 0,
          totalCollections: 0,
          followerCount: user.followerCount || 0,
          followingCount: user.followingCount || 0
        });
      }
    } catch (error) {
      console.error('Failed to load account stats:', error);
    }
  }

  private async loadActiveSessions() {
    try {
      this.loadingSessions.set(true);
      
      // Simulate session data - in real implementation, call API
      const mockSessions: SessionInfo[] = [
        {
          id: '1',
          device: 'Desktop - Chrome',
          location: 'New York, USA',
          ipAddress: '192.168.1.1',
          lastActive: new Date().toISOString(),
          current: true
        },
        {
          id: '2',
          device: 'Mobile - Safari',
          location: 'New York, USA',
          ipAddress: '192.168.1.2',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          current: false
        }
      ];
      
      this.activeSessions.set(mockSessions);
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    } finally {
      this.loadingSessions.set(false);
    }
  }

  // Email Management
  async changeEmail() {
    if (this.emailForm.invalid) return;

    try {
      this.changingEmail.set(true);

      // In real implementation, call API to change email
      // await this.apiService.changeEmail(this.emailForm.value);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.showSuccessMessage('Email change request sent. Check your new email for verification.');
      this.emailForm.reset();

    } catch (error) {
      console.error('Failed to change email:', error);
    } finally {
      this.changingEmail.set(false);
    }
  }

  // Session Management
  async terminateSession(sessionId: string) {
    try {
      this.terminatingSession.update(sessions => [...sessions, sessionId]);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.activeSessions.update(sessions => 
        sessions.filter(session => session.id !== sessionId)
      );
      
      this.showSuccessMessage('Session terminated successfully.');
      
    } catch (error) {
      console.error('Failed to terminate session:', error);
    } finally {
      this.terminatingSession.update(sessions => 
        sessions.filter(id => id !== sessionId)
      );
    }
  }

  async terminateAllSessions() {
    if (!confirm('End all other sessions? You will need to log in again on those devices.')) {
      return;
    }

    try {
      this.terminatingAllSessions.set(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Keep only current session
      this.activeSessions.update(sessions => 
        sessions.filter(session => session.current)
      );
      
      this.showSuccessMessage('All other sessions have been terminated.');

    } catch (error) {
      console.error('Failed to terminate sessions:', error);
    } finally {
      this.terminatingAllSessions.set(false);
    }
  }

  // Data Management
  async requestDataExport() {
    try {
      this.exportingData.set(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      this.showSuccessMessage('Data export requested. You will receive an email when ready.');

    } catch (error) {
      console.error('Failed to request data export:', error);
    } finally {
      this.exportingData.set(false);
    }
  }

  // Account Closure
  showDeactivateModal() {
    this.showDeactivateDialog.set(true);
  }

  hideDeactivateModal() {
    this.showDeactivateDialog.set(false);
  }

  async deactivateAccount() {
    try {
      this.deactivating.set(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, redirect to goodbye page
      this.router.navigate(['/']);

    } catch (error) {
      console.error('Failed to deactivate account:', error);
    } finally {
      this.deactivating.set(false);
    }
  }

  showDeleteModal() {
    this.showDeleteDialog.set(true);
    this.deleteConfirmation = '';
  }

  hideDeleteModal() {
    this.showDeleteDialog.set(false);
    this.deleteConfirmation = '';
  }

  async deleteAccount() {
    if (this.deleteConfirmation !== 'DELETE') return;

    try {
      this.deleting.set(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, call API and redirect
      this.router.navigate(['/']);

    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      this.deleting.set(false);
    }
  }

  // Helper Methods
  isEmailFieldInvalid(fieldName: string): boolean {
    const field = this.emailForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  formatJoinDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  }

  formatLastActive(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  }

  showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  clearSuccessMessage() {
    this.successMessage.set('');
  }
}
