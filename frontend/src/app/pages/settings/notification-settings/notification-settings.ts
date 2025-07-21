import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { User, NotificationQueryParams } from '../../../../types/api';
import { async } from 'rxjs';

interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly' | 'never';
    comments: boolean;
    likes: boolean;
    follows: boolean;
    posts: boolean;
    mentions: boolean;
    newsletter: boolean;
  };
  push: {
    enabled: boolean;
    comments: boolean;
    likes: boolean;
    follows: boolean;
    posts: boolean;
    mentions: boolean;
  };
  inApp: {
    enabled: boolean;
    comments: boolean;
    likes: boolean;
    follows: boolean;
    posts: boolean;
    mentions: boolean;
    sound: boolean;
    desktop: boolean;
  };
}

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      <!-- Header -->
      <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
        <div class="text-center border-2 border-dotted border-amber-700 p-6">
          <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
            Notification Settings
          </div>
          
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-3">
            Manage Notifications
          </h1>
          <p class="text-amber-700 text-lg font-mono">
            Control when and how you receive notifications
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
                
                <a
                  routerLink="/settings/account"
                  class="px-4 py-3 font-mono text-sm uppercase tracking-wider border-2 transition-colors bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:border-amber-400"
                >
                  Account Settings
                </a>
                
                <button
                  class="px-4 py-3 font-mono text-sm uppercase tracking-wider border-2 transition-colors bg-amber-800 text-amber-100 border-amber-700"
                >
                  Notifications
                </button>
              </div>
            </nav>
          </div>
        </section>

        <!-- Notification Overview -->
        <section class="mb-12">
          <div class="bg-amber-50 border-4 border-amber-300 p-8">
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
              Notification Overview
            </h2>

            <div class="grid md:grid-cols-3 gap-6">
              <!-- Email Notifications -->
              <div class="text-center p-6 bg-amber-100 border-2 border-amber-400">
                <div class="w-16 h-16 bg-blue-100 border-4 border-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                </div>
                <h3 class="font-serif text-lg font-bold text-amber-900 mb-2">Email</h3>
                <p class="text-amber-700 text-sm mb-3">
                  Receive updates via email with customizable frequency
                </p>
                <div class="text-xs font-mono">
                  Status: {{ preferences().email.enabled ? 'Enabled' : 'Disabled' }}
                </div>
              </div>

              <!-- Push Notifications -->
              <div class="text-center p-6 bg-amber-100 border-2 border-amber-400">
                <div class="w-16 h-16 bg-green-100 border-4 border-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM8 18v-6h4v6H8z"></path>
                  </svg>
                </div>
                <h3 class="font-serif text-lg font-bold text-amber-900 mb-2">Push</h3>
                <p class="text-amber-700 text-sm mb-3">
                  Instant notifications on your devices
                </p>
                <div class="text-xs font-mono">
                  Status: {{ pushSupported() ? (preferences().push.enabled ? 'Enabled' : 'Disabled') : 'Not Supported' }}
                </div>
              </div>

              <!-- In-App Notifications -->
              <div class="text-center p-6 bg-amber-100 border-2 border-amber-400">
                <div class="w-16 h-16 bg-orange-100 border-4 border-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                  </svg>
                </div>
                <h3 class="font-serif text-lg font-bold text-amber-900 mb-2">In-App</h3>
                <p class="text-amber-700 text-sm mb-3">
                  Notifications within the MyBlog interface
                </p>
                <div class="text-xs font-mono">
                  Status: {{ preferences().inApp.enabled ? 'Enabled' : 'Disabled' }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Email Notification Settings -->
        <section class="mb-12">
          <div class="bg-amber-50 border-4 border-amber-300 p-8">
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
              Email Notifications
            </h2>

            <form [formGroup]="emailForm" (ngSubmit)="saveEmailSettings()">
              <!-- Master Email Toggle -->
              <div class="mb-8 p-6 bg-amber-100 border-2 border-amber-400">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-serif text-xl font-bold text-amber-900 mb-2">Email Notifications</h3>
                    <p class="text-amber-700 text-sm">
                      Receive notifications and updates via email
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      formControlName="enabled"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-amber-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              @if (emailForm.get('enabled')?.value) {
                <!-- Email Frequency -->
                <div class="mb-6">
                  <label class="block text-amber-900 font-mono text-sm font-bold mb-3">
                    Email Frequency
                  </label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    @for (freq of emailFrequencies; track freq.value) {
                      <label class="flex items-center p-3 bg-amber-100 border-2 border-amber-300 hover:border-amber-400 transition-colors cursor-pointer">
                        <input 
                          type="radio" 
                          formControlName="frequency"
                          [value]="freq.value"
                          class="mr-3 text-amber-600"
                        />
                        <div>
                          <div class="font-bold text-amber-900 text-sm">{{ freq.label }}</div>
                          <div class="text-amber-700 text-xs">{{ freq.description }}</div>
                        </div>
                      </label>
                    }
                  </div>
                </div>

                <!-- Email Notification Types -->
                <div class="space-y-4">
                  <h4 class="font-serif text-lg font-bold text-amber-900 mb-4">What would you like to be notified about?</h4>
                  
                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">Comments</h5>
                        <p class="text-amber-700 text-sm">When someone comments on your posts</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="comments"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">Likes</h5>
                        <p class="text-amber-700 text-sm">When someone likes your posts or comments</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="likes"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">New Followers</h5>
                        <p class="text-amber-700 text-sm">When someone starts following you</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="follows"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">New Posts</h5>
                        <p class="text-amber-700 text-sm">From people you follow</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="posts"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">Mentions</h5>
                        <p class="text-amber-700 text-sm">When someone mentions you in posts or comments</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="mentions"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">Newsletter</h5>
                        <p class="text-amber-700 text-sm">Weekly newsletter with highlights</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="newsletter"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                  </div>
                </div>
              }

              <div class="flex justify-end mt-8">
                <button
                  type="submit"
                  [disabled]="savingEmail()"
                  class="bg-amber-800 text-amber-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 disabled:opacity-50"
                >
                  {{ savingEmail() ? 'Saving...' : 'Save Email Settings' }}
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- Push Notification Settings -->
        <section class="mb-12">
          <div class="bg-amber-50 border-4 border-amber-300 p-8">
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
              Push Notifications
            </h2>

            @if (!pushSupported()) {
              <div class="p-6 bg-yellow-50 border-2 border-yellow-300 text-yellow-800 mb-6">
                <div class="flex items-center gap-3">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <div>
                    <h4 class="font-bold mb-1">Push Notifications Not Supported</h4>
                    <p class="text-sm">Your browser doesn't support push notifications or they are blocked.</p>
                  </div>
                </div>
              </div>
            } @else {
              <form [formGroup]="pushForm" (ngSubmit)="savePushSettings()">
                <!-- Master Push Toggle -->
                <div class="mb-8 p-6 bg-amber-100 border-2 border-amber-400">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-serif text-xl font-bold text-amber-900 mb-2">Push Notifications</h3>
                      <p class="text-amber-700 text-sm">
                        Receive instant notifications on your devices
                      </p>
                    </div>
                    <div class="flex items-center gap-3">
                      @if (!pushPermission()) {
                        <button
                          type="button"
                          (click)="requestPushPermission()"
                          class="bg-blue-100 text-blue-800 px-4 py-2 font-mono text-sm hover:bg-blue-200 transition-colors border-2 border-blue-300"
                        >
                          Enable Push
                        </button>
                      } @else {
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            formControlName="enabled"
                            class="sr-only peer"
                          />
                          <div class="w-11 h-6 bg-amber-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      }
                    </div>
                  </div>
                </div>

                @if (pushForm.get('enabled')?.value && pushPermission()) {
                  <!-- Push Notification Types -->
                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">Comments</h5>
                        <p class="text-amber-700 text-sm">Instant alerts for new comments</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="comments"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">Likes</h5>
                        <p class="text-amber-700 text-sm">When your content gets liked</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="likes"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">New Followers</h5>
                        <p class="text-amber-700 text-sm">Instant follow notifications</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="follows"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">New Posts</h5>
                        <p class="text-amber-700 text-sm">From your favorite authors</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="posts"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h5 class="font-bold text-amber-900">Mentions</h5>
                        <p class="text-amber-700 text-sm">When you're mentioned</p>
                      </div>
                      <input 
                        type="checkbox" 
                        formControlName="mentions"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </div>
                  </div>
                }

                <div class="flex justify-end mt-8">
                  <button
                    type="submit"
                    [disabled]="savingPush()"
                    class="bg-amber-800 text-amber-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 disabled:opacity-50"
                  >
                    {{ savingPush() ? 'Saving...' : 'Save Push Settings' }}
                  </button>
                </div>
              </form>
            }
          </div>
        </section>

        <!-- In-App Notification Settings -->
        <section class="mb-12">
          <div class="bg-amber-50 border-4 border-amber-300 p-8">
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
              In-App Notifications
            </h2>

            <form [formGroup]="inAppForm" (ngSubmit)="saveInAppSettings()">
              <!-- Master In-App Toggle -->
              <div class="mb-8 p-6 bg-amber-100 border-2 border-amber-400">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-serif text-xl font-bold text-amber-900 mb-2">In-App Notifications</h3>
                    <p class="text-amber-700 text-sm">
                      Show notifications within the MyBlog interface
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      formControlName="enabled"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-amber-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              @if (inAppForm.get('enabled')?.value) {
                <!-- In-App Settings -->
                <div class="space-y-6">
                  <!-- Notification Types -->
                  <div>
                    <h4 class="font-serif text-lg font-bold text-amber-900 mb-4">Notification Types</h4>
                    <div class="grid md:grid-cols-2 gap-4">
                      <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                        <div>
                          <h5 class="font-bold text-amber-900">Comments</h5>
                          <p class="text-amber-700 text-sm">Show comment notifications</p>
                        </div>
                        <input 
                          type="checkbox" 
                          formControlName="comments"
                          class="text-amber-600 border-2 border-amber-300"
                        />
                      </div>
                      
                      <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                        <div>
                          <h5 class="font-bold text-amber-900">Likes</h5>
                          <p class="text-amber-700 text-sm">Show like notifications</p>
                        </div>
                        <input 
                          type="checkbox" 
                          formControlName="likes"
                          class="text-amber-600 border-2 border-amber-300"
                        />
                      </div>
                      
                      <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                        <div>
                          <h5 class="font-bold text-amber-900">Follows</h5>
                          <p class="text-amber-700 text-sm">Show follow notifications</p>
                        </div>
                        <input 
                          type="checkbox" 
                          formControlName="follows"
                          class="text-amber-600 border-2 border-amber-300"
                        />
                      </div>
                      
                      <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                        <div>
                          <h5 class="font-bold text-amber-900">New Posts</h5>
                          <p class="text-amber-700 text-sm">Show new post notifications</p>
                        </div>
                        <input 
                          type="checkbox" 
                          formControlName="posts"
                          class="text-amber-600 border-2 border-amber-300"
                        />
                      </div>
                      
                      <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                        <div>
                          <h5 class="font-bold text-amber-900">Mentions</h5>
                          <p class="text-amber-700 text-sm">Show mention notifications</p>
                        </div>
                        <input 
                          type="checkbox" 
                          formControlName="mentions"
                          class="text-amber-600 border-2 border-amber-300"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Additional Settings -->
                  <div>
                    <h4 class="font-serif text-lg font-bold text-amber-900 mb-4">Additional Settings</h4>
                    <div class="grid md:grid-cols-2 gap-4">
                      <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                        <div>
                          <h5 class="font-bold text-amber-900">Sound Effects</h5>
                          <p class="text-amber-700 text-sm">Play sounds for notifications</p>
                        </div>
                        <input 
                          type="checkbox" 
                          formControlName="sound"
                          class="text-amber-600 border-2 border-amber-300"
                        />
                      </div>
                      
                      <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                        <div>
                          <h5 class="font-bold text-amber-900">Desktop Alerts</h5>
                          <p class="text-amber-700 text-sm">Show desktop notification badges</p>
                        </div>
                        <input 
                          type="checkbox" 
                          formControlName="desktop"
                          class="text-amber-600 border-2 border-amber-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              }

              <div class="flex justify-end mt-8">
                <button
                  type="submit"
                  [disabled]="savingInApp()"
                  class="bg-amber-800 text-amber-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 disabled:opacity-50"
                >
                  {{ savingInApp() ? 'Saving...' : 'Save In-App Settings' }}
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- Test Notifications -->
        <section class="mb-12">
          <div class="bg-amber-100 border-4 border-amber-800 p-6">
            <h3 class="font-serif text-xl font-bold text-amber-900 mb-4 text-center">Test Your Notifications</h3>
            
            <div class="flex justify-center gap-4">
              <button
                (click)="testEmailNotification()"
                [disabled]="!preferences().email.enabled || testing().includes('email')"
                class="bg-blue-100 text-blue-800 px-4 py-2 font-mono text-sm hover:bg-blue-200 transition-colors border-2 border-blue-300 disabled:opacity-50"
              >
                {{ testing().includes('email') ? 'Sending...' : 'Test Email' }}
              </button>
              
              <button
                (click)="testPushNotification()"
                [disabled]="!preferences().push.enabled || testing().includes('push')"
                class="bg-green-100 text-green-800 px-4 py-2 font-mono text-sm hover:bg-green-200 transition-colors border-2 border-green-300 disabled:opacity-50"
              >
                {{ testing().includes('push') ? 'Sending...' : 'Test Push' }}
              </button>
              
              <button
                (click)="testInAppNotification()"
                [disabled]="!preferences().inApp.enabled || testing().includes('inApp')"
                class="bg-orange-100 text-orange-800 px-4 py-2 font-mono text-sm hover:bg-orange-200 transition-colors border-2 border-orange-300 disabled:opacity-50"
              >
                {{ testing().includes('inApp') ? 'Showing...' : 'Test In-App' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Success Messages -->
        @if (successMessage()) {
          <div class="fixed top-4 right-4 bg-green-100 border-4 border-green-400 p-4 z-50 success-message">
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
  `,
  styles: [`
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

    /* Custom radio styling */
    input[type="radio"] {
      appearance: none;
      background-color: white;
      border: 2px solid #d97706;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      position: relative;
      cursor: pointer;
    }

    input[type="radio"]:checked {
      background-color: #d97706;
    }

    input[type="radio"]:checked::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      background-color: white;
      border-radius: 50%;
    }

    /* Toggle switch animation */
    .peer:checked + div {
      background-color: #16a34a;
    }

    .peer:checked + div:after {
      transform: translateX(100%);
      border-color: white;
    }

    /* Vintage paper texture */
    .bg-amber-50 {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Success message animation */
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
export class NotificationSettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Reactive Signals
  user = signal<User | null>(null);
  savingEmail = signal(false);
  savingPush = signal(false);
  savingInApp = signal(false);
  testing = signal<string[]>([]);
  pushSupported = signal(false);
  pushPermission = signal(false);
  successMessage = signal('');

  // Default preferences
  preferences = signal<NotificationPreferences>({
    email: {
      enabled: true,
      frequency: 'daily',
      comments: true,
      likes: false,
      follows: true,
      posts: true,
      mentions: true,
      newsletter: true,
    },
    push: {
      enabled: false,
      comments: true,
      likes: false,
      follows: true,
      posts: false,
      mentions: true,
    },
    inApp: {
      enabled: true,
      comments: true,
      likes: true,
      follows: true,
      posts: true,
      mentions: true,
      sound: true,
      desktop: false,
    }
  });

  // Email frequency options
  emailFrequencies = [
    { value: 'instant', label: 'Instant', description: 'As they happen' },
    { value: 'daily', label: 'Daily', description: 'Once per day' },
    { value: 'weekly', label: 'Weekly', description: 'Weekly digest' },
    { value: 'never', label: 'Never', description: 'Disable all' }
  ];

  // Forms
  emailForm = new FormGroup({
    enabled: new FormControl(this.preferences().email.enabled),
    frequency: new FormControl(this.preferences().email.frequency),
    comments: new FormControl(this.preferences().email.comments),
    likes: new FormControl(this.preferences().email.likes),
    follows: new FormControl(this.preferences().email.follows),
    posts: new FormControl(this.preferences().email.posts),
    mentions: new FormControl(this.preferences().email.mentions),
    newsletter: new FormControl(this.preferences().email.newsletter)
  });

  pushForm = new FormGroup({
    enabled: new FormControl(this.preferences().push.enabled),
    comments: new FormControl(this.preferences().push.comments),
    likes: new FormControl(this.preferences().push.likes),
    follows: new FormControl(this.preferences().push.follows),
    posts: new FormControl(this.preferences().push.posts),
    mentions: new FormControl(this.preferences().push.mentions)
  });

  inAppForm = new FormGroup({
    enabled: new FormControl(this.preferences().inApp.enabled),
    comments: new FormControl(this.preferences().inApp.comments),
    likes: new FormControl(this.preferences().inApp.likes),
    follows: new FormControl(this.preferences().inApp.follows),
    posts: new FormControl(this.preferences().inApp.posts),
    mentions: new FormControl(this.preferences().inApp.mentions),
    sound: new FormControl(this.preferences().inApp.sound),
    desktop: new FormControl(this.preferences().inApp.desktop)
  });

  async ngOnInit() {
    // Check authentication
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/settings/notifications' }
      });
      return;
    }

    await this.loadUserData();
    this.checkPushSupport();
    await this.loadNotificationPreferences();
  }

  private async loadUserData() {
    try {
      const user = await this.apiService.getCurrentUser();
      this.user.set(user);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  private checkPushSupport() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      this.pushSupported.set(true);
      
      // Check current permission
      if (Notification.permission === 'granted') {
        this.pushPermission.set(true);
      }
    }
  }

  private async loadNotificationPreferences() {
    try {
      // In a real implementation, load from API
      // const prefs = await this.apiService.getNotificationPreferences();
      // For now, use defaults or localStorage
      
      const savedPrefs = localStorage.getItem('notificationPreferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        this.preferences.set(prefs);
        this.updateForms(prefs);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  private updateForms(prefs: NotificationPreferences) {
    this.emailForm.patchValue(prefs.email);
    this.pushForm.patchValue(prefs.push);
    this.inAppForm.patchValue(prefs.inApp);
  }

  // Email Settings
  async saveEmailSettings() {
    try {
      this.savingEmail.set(true);

      const emailPrefs = this.emailForm.value;
      const sanitizedEmailPrefs = {
        enabled: emailPrefs.enabled ?? false,
        frequency: emailPrefs.frequency ?? 'daily',
        comments: emailPrefs.comments ?? false,
        likes: emailPrefs.likes ?? false,
        follows: emailPrefs.follows ?? false,
        posts: emailPrefs.posts ?? false,
        mentions: emailPrefs.mentions ?? false,
        newsletter: emailPrefs.newsletter ?? false
      };
      const updatedPrefs = {
        ...this.preferences(),
        email: sanitizedEmailPrefs
      };

      // Save to API
      // await this.apiService.updateNotificationPreferences(updatedPrefs);
      
      // For now, save to localStorage
      localStorage.setItem('notificationPreferences', JSON.stringify(updatedPrefs));
      this.preferences.set(updatedPrefs);
      
      this.showSuccessMessage('Email notification settings saved!');

    } catch (error) {
      console.error('Failed to save email settings:', error);
    } finally {
      this.savingEmail.set(false);
    }
  }

  // Push Settings
  async requestPushPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.pushPermission.set(true);
        this.showSuccessMessage('Push notifications enabled!');
      }
    } catch (error) {
      console.error('Failed to request push permission:', error);
    }
  }

  async savePushSettings() {
    try {
      this.savingPush.set(true);

      const pushPrefs = this.pushForm.value;
      const sanitizedPushPrefs = {
        enabled: pushPrefs.enabled ?? false,
        comments: pushPrefs.comments ?? false,
        likes: pushPrefs.likes ?? false,
        follows: pushPrefs.follows ?? false,
        posts: pushPrefs.posts ?? false,
        mentions: pushPrefs.mentions ?? false
      };
      const updatedPrefs = {
        ...this.preferences(),
        push: sanitizedPushPrefs
      };

      localStorage.setItem('notificationPreferences', JSON.stringify(updatedPrefs));
      this.preferences.set(updatedPrefs);
      
      this.showSuccessMessage('Push notification settings saved!');

    } catch (error) {
      console.error('Failed to save push settings:', error);
    } finally {
      this.savingPush.set(false);
    }
  }

  // In-App Settings
  async saveInAppSettings() {
    try {
      this.savingInApp.set(true);

      const inAppPrefs = this.inAppForm.value;
      const sanitizedInAppPrefs = {
        enabled: inAppPrefs.enabled ?? false,
        comments: inAppPrefs.comments ?? false,
        likes: inAppPrefs.likes ?? false,
        follows: inAppPrefs.follows ?? false,
        posts: inAppPrefs.posts ?? false,
        mentions: inAppPrefs.mentions ?? false,
        sound: inAppPrefs.sound ?? false,
        desktop: inAppPrefs.desktop ?? false
      };
      const updatedPrefs = {
        ...this.preferences(),
        inApp: sanitizedInAppPrefs
      };

      localStorage.setItem('notificationPreferences', JSON.stringify(updatedPrefs));
      this.preferences.set(updatedPrefs);
      
      this.showSuccessMessage('In-app notification settings saved!');

    } catch (error) {
      console.error('Failed to save in-app settings:', error);
    } finally {
      this.savingInApp.set(false);
    }
  }

  // Test Notifications
  async testEmailNotification() {
    try {
      this.testing.update(tests => [...tests, 'email']);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.showSuccessMessage('Test email sent! Check your inbox.');

    } catch (error) {
      console.error('Failed to send test email:', error);
    } finally {
      this.testing.update(tests => tests.filter(t => t !== 'email'));
    }
  }

  async testPushNotification() {
    try {
      this.testing.update(tests => [...tests, 'push']);
      
      if (this.pushPermission()) {
        new Notification('MyBlog Test', {
          body: 'This is a test push notification from MyBlog!',
          icon: '/assets/icons/icon-192x192.png'
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.showSuccessMessage('Test push notification sent!');

    } catch (error) {
      console.error('Failed to send test push:', error);
    } finally {
      this.testing.update(tests => tests.filter(t => t !== 'push'));
    }
  }

  async testInAppNotification() {
    try {
      this.testing.update(tests => [...tests, 'inApp']);
      
      // Simulate in-app notification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.showSuccessMessage('This is your test in-app notification!');

    } catch (error) {
      console.error('Failed to show test notification:', error);
    } finally {
      this.testing.update(tests => tests.filter(t => t !== 'inApp'));
    }
  }

  // Helper Methods
  showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  clearSuccessMessage() {
    this.successMessage.set('');
  }
}
function saveInAppSettings() {
  throw new Error('Function not implemented.');
}

