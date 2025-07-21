import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { User, UpdateProfileRequest, ChangePasswordRequest } from '../../../../types/api';

// Custom Validators
function passwordMatchValidator(form: FormGroup) {
  const newPassword = form.get('newPassword');
  const confirmPassword = form.get('confirmPassword');
  
  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
}

function strongPasswordValidator(control: any) {
  const value = control.value;
  if (!value) return null;
  
  const hasNumber = /[0-9]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasSpecial = /[#?!@$%^&*-]/.test(value);
  
  const valid = hasNumber && hasUpper && hasLower && hasSpecial;
  if (!valid) {
    return { strongPassword: true };
  }
  return null;
}

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      <!-- Header -->
      <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
        <div class="text-center border-2 border-dotted border-amber-700 p-6">
          <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
            Account Settings
          </div>
          
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-3">
            Profile & Account
          </h1>
          <p class="text-amber-700 text-lg font-mono">
            Manage your personal information and account security
          </p>
        </div>
      </header>

      <div class="max-w-4xl mx-auto px-4">
        <!-- Settings Navigation -->
        <section class="mb-8">
          <div class="bg-amber-50 border-4 border-amber-300 p-4">
            <nav class="flex justify-center">
              <div class="flex gap-6 flex-wrap">
                <button
                  (click)="setActiveTab('profile')"
                  [class]="getTabClass('profile')"
                >
                  Profile Information
                </button>
                
                <button
                  (click)="setActiveTab('security')"
                  [class]="getTabClass('security')"
                >
                  Security
                </button>
                
                <button
                  (click)="setActiveTab('preferences')"
                  [class]="getTabClass('preferences')"
                >
                  Preferences
                </button>
                
                <button
                  (click)="setActiveTab('account')"
                  [class]="getTabClass('account')"
                >
                  Account Management
                </button>
              </div>
            </nav>
          </div>
        </section>

        <!-- Tab Content -->
        @if (activeTab() === 'profile') {
          <!-- Profile Information -->
          <section class="mb-12">
            <div class="bg-amber-50 border-4 border-amber-300 p-8">
              <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
                Profile Information
              </h2>

              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                <div class="grid md:grid-cols-2 gap-8">
                  <!-- Avatar Section -->
                  <div class="md:col-span-2 text-center mb-8">
                    @if (user()?.avatarUrl) {
                      <img 
                        [src]="user()?.avatarUrl" 
                        [alt]="user()?.name"
                        class="w-32 h-32 rounded-full border-4 border-amber-600 shadow-lg mx-auto mb-4"
                      >
                    } @else {
                      <div class="w-32 h-32 bg-amber-200 border-4 border-amber-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                        <span class="text-4xl font-bold text-amber-800">{{ getUserInitials() }}</span>
                      </div>
                    }
                    
                    <div class="flex justify-center gap-3">
                      <input
                        #avatarInput
                        type="file"
                        accept="image/*"
                        (change)="onAvatarSelect($event)"
                        class="hidden"
                      />
                      <button
                        type="button"
                        (click)="avatarInput.click()"
                        [disabled]="uploadingAvatar()"
                        class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400 disabled:opacity-50"
                      >
                        @if (uploadingAvatar()) {
                          Uploading...
                        } @else {
                          Change Photo
                        }
                      </button>
                      
                      @if (user()?.avatarUrl) {
                        <button
                          type="button"
                          (click)="removeAvatar()"
                          class="text-red-600 hover:text-red-800 font-mono text-sm uppercase tracking-wider transition-colors px-4 py-2 border-2 border-red-300 hover:border-red-400"
                        >
                          Remove
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Name -->
                  <div>
                    <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      formControlName="name"
                      placeholder="Your display name"
                      class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white"
                      [class.border-red-400]="isFieldInvalid('name')"
                    />
                    @if (isFieldInvalid('name')) {
                      <p class="mt-1 text-red-600 text-xs font-mono">
                        @if (profileForm.get('name')?.errors?.['required']) {
                          Name is required
                        }
                        @if (profileForm.get('name')?.errors?.['minlength']) {
                          Name must be at least 2 characters long
                        }
                      </p>
                    }
                  </div>

                  <!-- Email (Read-only) -->
                  <div>
                    <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      [value]="user()?.email || ''"
                      readonly
                      class="w-full px-4 py-3 border-2 border-amber-200 bg-amber-50 text-amber-600 cursor-not-allowed"
                    />
                    <p class="mt-1 text-amber-600 text-xs font-mono">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <!-- Bio -->
                  <div class="md:col-span-2">
                    <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                      Bio
                    </label>
                    <textarea
                      formControlName="bio"
                      rows="4"
                      placeholder="Tell us about yourself..."
                      class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white resize-none"
                    ></textarea>
                    <div class="mt-1 text-xs font-mono text-amber-600">
                      {{ (profileForm.get('bio')?.value || '').length }}/300 characters
                    </div>
                  </div>
                </div>

                <!-- Profile Actions -->
                <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-amber-300">
                  <button
                    type="button"
                    (click)="resetProfileForm()"
                    class="bg-amber-200 text-amber-800 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400"
                  >
                    Reset
                  </button>
                  
                  <button
                    type="submit"
                    [disabled]="profileForm.invalid || savingProfile()"
                    class="bg-amber-800 text-amber-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 disabled:opacity-50"
                  >
                    @if (savingProfile()) {
                      Saving...
                    } @else {
                      Save Changes
                    }
                  </button>
                </div>
              </form>
            </div>
          </section>
        } @else if (activeTab() === 'security') {
          <!-- Security Settings -->
          <section class="mb-12">
            <div class="bg-amber-50 border-4 border-amber-300 p-8">
              <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
                Security Settings
              </h2>

              <!-- Password Change Form -->
              <div class="mb-8">
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Change Password</h3>
                
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                  <div class="space-y-6">
                    <!-- Current Password -->
                    <div>
                      <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                        Current Password
                      </label>
                      <div class="relative">
                        <input
                          [type]="showCurrentPassword() ? 'text' : 'password'"
                          formControlName="currentPassword"
                          placeholder="Enter your current password"
                          class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white pr-12"
                          [class.border-red-400]="isPasswordFieldInvalid('currentPassword')"
                        />
                        <button
                          type="button"
                          (click)="toggleCurrentPasswordVisibility()"
                          class="absolute inset-y-0 right-0 flex items-center px-3 text-amber-600 hover:text-amber-800"
                        >
                          @if (showCurrentPassword()) {
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.5 8.5m1.378 1.378L12 12m0 0l4.242 4.242M12 12L8.5 8.5m3.5 3.5l4.242 4.242"></path>
                            </svg>
                          } @else {
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          }
                        </button>
                      </div>
                      @if (isPasswordFieldInvalid('currentPassword')) {
                        <p class="mt-1 text-red-600 text-xs font-mono">Current password is required</p>
                      }
                    </div>

                    <!-- New Password -->
                    <div>
                      <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                        New Password
                      </label>
                      <div class="relative">
                        <input
                          [type]="showNewPassword() ? 'text' : 'password'"
                          formControlName="newPassword"
                          placeholder="Enter your new password"
                          class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white pr-12"
                          [class.border-red-400]="isPasswordFieldInvalid('newPassword')"
                        />
                        <button
                          type="button"
                          (click)="toggleNewPasswordVisibility()"
                          class="absolute inset-y-0 right-0 flex items-center px-3 text-amber-600 hover:text-amber-800"
                        >
                          @if (showNewPassword()) {
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.5 8.5m1.378 1.378L12 12m0 0l4.242 4.242M12 12L8.5 8.5m3.5 3.5l4.242 4.242"></path>
                            </svg>
                          } @else {
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          }
                        </button>
                      </div>
                      
                      @if (isPasswordFieldInvalid('newPassword')) {
                        <div class="mt-1 text-red-600 text-xs font-mono">
                          @if (passwordForm.get('newPassword')?.errors?.['required']) {
                            New password is required
                          }
                          @if (passwordForm.get('newPassword')?.errors?.['minlength']) {
                            Password must be at least 8 characters long
                          }
                          @if (passwordForm.get('newPassword')?.errors?.['strongPassword']) {
                            Password must contain uppercase, lowercase, number & special character
                          }
                        </div>
                      }
                      
                      <!-- Password Strength Indicator -->
                      <div class="mt-2">
                        <div class="flex gap-1">
                          @for (strength of passwordStrength(); track $index) {
                            <div 
                              class="h-1 flex-1 rounded transition-colors"
                              [class]="strength ? 'bg-green-500' : 'bg-amber-200'"
                            ></div>
                          }
                        </div>
                        <p class="text-xs font-mono mt-1" [class]="getPasswordStrengthColor()">
                          {{ getPasswordStrengthText() }}
                        </p>
                      </div>
                    </div>

                    <!-- Confirm New Password -->
                    <div>
                      <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                        Confirm New Password
                      </label>
                      <div class="relative">
                        <input
                          [type]="showConfirmPassword() ? 'text' : 'password'"
                          formControlName="confirmPassword"
                          placeholder="Confirm your new password"
                          class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white pr-12"
                          [class.border-red-400]="isPasswordFieldInvalid('confirmPassword')"
                        />
                        <button
                          type="button"
                          (click)="toggleConfirmPasswordVisibility()"
                          class="absolute inset-y-0 right-0 flex items-center px-3 text-amber-600 hover:text-amber-800"
                        >
                          @if (showConfirmPassword()) {
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.5 8.5m1.378 1.378L12 12m0 0l4.242 4.242M12 12L8.5 8.5m3.5 3.5l4.242 4.242"></path>
                            </svg>
                          } @else {
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          }
                        </button>
                      </div>
                      @if (isPasswordFieldInvalid('confirmPassword')) {
                        <div class="mt-1 text-red-600 text-xs font-mono">
                          @if (passwordForm.get('confirmPassword')?.errors?.['required']) {
                            Please confirm your password
                          }
                          @if (passwordForm.get('confirmPassword')?.errors?.['passwordMismatch']) {
                            Passwords do not match
                          }
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Password Actions -->
                  <div class="flex justify-end gap-3 mt-8">
                    <button
                      type="button"
                      (click)="resetPasswordForm()"
                      class="bg-amber-200 text-amber-800 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400"
                    >
                      Reset
                    </button>
                    
                    <button
                      type="submit"
                      [disabled]="passwordForm.invalid || changingPassword()"
                      class="bg-amber-800 text-amber-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 disabled:opacity-50"
                    >
                      @if (changingPassword()) {
                        Changing Password...
                      } @else {
                        Change Password
                      }
                    </button>
                  </div>
                </form>
              </div>

              <!-- Account Security Info -->
              <div class="border-t border-amber-300 pt-6">
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Account Security</h3>
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                    <div>
                      <h4 class="font-bold text-amber-900">Two-Factor Authentication</h4>
                      <p class="text-amber-700 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <button class="bg-blue-100 text-blue-800 px-4 py-2 font-mono text-sm hover:bg-blue-200 transition-colors border-2 border-blue-300">
                      Enable
                    </button>
                  </div>
                  
                  <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                    <div>
                      <h4 class="font-bold text-amber-900">Login Notifications</h4>
                      <p class="text-amber-700 text-sm">Get notified when someone logs into your account</p>
                    </div>
                    <label class="flex items-center">
                      <input type="checkbox" checked class="text-amber-600 border-2 border-amber-300" />
                      <span class="ml-2 text-amber-800 font-mono text-sm">Enabled</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        } @else if (activeTab() === 'preferences') {
          <!-- Preferences -->
          <section class="mb-12">
            <div class="bg-amber-50 border-4 border-amber-300 p-8">
              <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
                Preferences
              </h2>

              <div class="space-y-8">
                <!-- Notification Preferences -->
                <div>
                  <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Notifications</h3>
                  
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h4 class="font-bold text-amber-900">Email Notifications</h4>
                        <p class="text-amber-700 text-sm">Receive updates via email</p>
                      </div>
                      <label class="flex items-center">
                        <input type="checkbox" checked class="text-amber-600 border-2 border-amber-300" />
                        <span class="ml-2 text-amber-800 font-mono text-sm">Enabled</span>
                      </label>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h4 class="font-bold text-amber-900">Comment Notifications</h4>
                        <p class="text-amber-700 text-sm">Get notified when someone comments on your posts</p>
                      </div>
                      <label class="flex items-center">
                        <input type="checkbox" checked class="text-amber-600 border-2 border-amber-300" />
                        <span class="ml-2 text-amber-800 font-mono text-sm">Enabled</span>
                      </label>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h4 class="font-bold text-amber-900">Follow Notifications</h4>
                        <p class="text-amber-700 text-sm">Get notified when someone follows you</p>
                      </div>
                      <label class="flex items-center">
                        <input type="checkbox" class="text-amber-600 border-2 border-amber-300" />
                        <span class="ml-2 text-amber-800 font-mono text-sm">Disabled</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Privacy Settings -->
                <div class="border-t border-amber-300 pt-6">
                  <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Privacy</h3>
                  
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h4 class="font-bold text-amber-900">Profile Visibility</h4>
                        <p class="text-amber-700 text-sm">Control who can see your profile</p>
                      </div>
                      <select class="bg-white border-2 border-amber-300 px-4 py-2 font-mono text-sm">
                        <option>Public</option>
                        <option>Followers Only</option>
                        <option>Private</option>
                      </select>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h4 class="font-bold text-amber-900">Show Reading Activity</h4>
                        <p class="text-amber-700 text-sm">Let others see what you're reading</p>
                      </div>
                      <label class="flex items-center">
                        <input type="checkbox" checked class="text-amber-600 border-2 border-amber-300" />
                        <span class="ml-2 text-amber-800 font-mono text-sm">Enabled</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        } @else if (activeTab() === 'account') {
          <!-- Account Management -->
          <section class="mb-12">
            <div class="bg-amber-50 border-4 border-amber-300 p-8">
              <h2 class="font-serif text-2xl font-bold text-amber-900 mb-6 border-b-2 border-dotted border-amber-400 pb-2">
                Account Management
              </h2>

              <div class="space-y-8">
                <!-- Account Information -->
                <div>
                  <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Account Information</h3>
                  
                  <div class="grid md:grid-cols-2 gap-6">
                    <div class="p-4 bg-amber-100 border-2 border-amber-400">
                      <h4 class="font-bold text-amber-900 mb-2">Account Status</h4>
                      <div class="flex items-center gap-2">
                        <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span class="text-amber-700 font-mono text-sm">Active</span>
                        @if (user()?.isVerified) {
                          <svg class="w-4 h-4 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-blue-600 font-mono text-sm">Verified</span>
                        }
                      </div>
                    </div>
                    
                    <div class="p-4 bg-amber-100 border-2 border-amber-400">
                      <h4 class="font-bold text-amber-900 mb-2">Member Since</h4>
                      <p class="text-amber-700 font-mono text-sm">{{ formatJoinDate(user()?.createdAt || '') }}</p>
                    </div>
                  </div>
                </div>

                <!-- Data Export -->
                <div class="border-t border-amber-300 pt-6">
                  <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Data & Privacy</h3>
                  
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h4 class="font-bold text-amber-900">Export Data</h4>
                        <p class="text-amber-700 text-sm">Download a copy of your account data</p>
                      </div>
                      <button class="bg-blue-100 text-blue-800 px-4 py-2 font-mono text-sm hover:bg-blue-200 transition-colors border-2 border-blue-300">
                        Request Export
                      </button>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-amber-100 border-2 border-amber-400">
                      <div>
                        <h4 class="font-bold text-amber-900">Data Portability</h4>
                        <p class="text-amber-700 text-sm">Transfer your data to another service</p>
                      </div>
                      <button class="bg-blue-100 text-blue-800 px-4 py-2 font-mono text-sm hover:bg-blue-200 transition-colors border-2 border-blue-300">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Danger Zone -->
                <div class="border-t border-red-300 pt-6">
                  <h3 class="font-serif text-xl font-bold text-red-900 mb-4">Danger Zone</h3>
                  
                  <div class="space-y-4">
                    <div class="p-6 bg-red-50 border-4 border-red-300">
                      <h4 class="font-bold text-red-900 mb-2">Deactivate Account</h4>
                      <p class="text-red-700 text-sm mb-4">
                        Temporarily disable your account. You can reactivate it anytime by logging back in.
                      </p>
                      <button class="bg-orange-100 text-orange-800 px-4 py-2 font-mono text-sm hover:bg-orange-200 transition-colors border-2 border-orange-300">
                        Deactivate Account
                      </button>
                    </div>
                    
                    <div class="p-6 bg-red-50 border-4 border-red-400">
                      <h4 class="font-bold text-red-900 mb-2">Delete Account</h4>
                      <p class="text-red-700 text-sm mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button 
                        (click)="showDeleteConfirmation()"
                        class="bg-red-600 text-red-100 px-4 py-2 font-mono text-sm hover:bg-red-700 transition-colors border-2 border-red-700"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        }

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

    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="hideDeleteConfirmation()">
        <div class="bg-red-50 border-4 border-red-400 p-8 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          <h3 class="font-serif text-xl font-bold text-red-900 mb-4">Confirm Account Deletion</h3>
          
          <p class="text-red-800 mb-6">
            This will permanently delete your account and all associated data including posts, comments, and bookmarks. 
            This action cannot be undone.
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
              (click)="hideDeleteConfirmation()"
              class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors"
            >
              Cancel
            </button>
            
            <button
              (click)="deleteAccount()"
              [disabled]="deleteConfirmation !== 'DELETE' || deletingAccount()"
              class="bg-red-600 text-red-100 px-4 py-2 font-mono text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ deletingAccount() ? 'Deleting...' : 'Delete Account' }}
            </button>
          </div>
        </div>
      </div>
    }
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

    /* Focus styles */
    input:focus, textarea:focus, select:focus {
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }
  `]
})
export class ProfileSettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Reactive Signals
  user = signal<User | null>(null);
  activeTab = signal<'profile' | 'security' | 'preferences' | 'account'>('profile');
  
  uploadingAvatar = signal(false);
  savingProfile = signal(false);
  changingPassword = signal(false);
  deletingAccount = signal(false);
  
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  
  showDeleteModal = signal(false);
  deleteConfirmation = '';
  
  successMessage = signal('');
  passwordStrength = signal<boolean[]>([false, false, false, false]);

  // Forms
  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    bio: new FormControl('', [Validators.maxLength(300)])
  });

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8), strongPasswordValidator]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: passwordMatchValidator as import('@angular/forms').ValidatorFn });

  async ngOnInit() {
    // Check authentication
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/settings/profile' }
      });
      return;
    }

    await this.loadUserData();
    this.setupPasswordStrength();
  }

  private async loadUserData() {
    try {
      const user = await this.apiService.getCurrentUser();
      this.user.set(user);
      
      // Populate profile form
      this.profileForm.patchValue({
        name: user.name,
        bio: user.bio || ''
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  private setupPasswordStrength() {
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(value => {
      this.updatePasswordStrength(value || '');
    });
  }

  private updatePasswordStrength(password: string) {
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password) && /[0-9]/.test(password),
      /[#?!@$%^&*-]/.test(password)
    ];
    
    this.passwordStrength.set(checks);
  }

  // Tab Management
  setActiveTab(tab: 'profile' | 'security' | 'preferences' | 'account') {
    this.activeTab.set(tab);
  }

  getTabClass(tab: 'profile' | 'security' | 'preferences' | 'account'): string {
    const baseClass = "px-4 py-3 font-mono text-sm uppercase tracking-wider border-2 transition-colors";
    return this.activeTab() === tab
      ? `${baseClass} bg-amber-800 text-amber-100 border-amber-700`
      : `${baseClass} bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:border-amber-400`;
  }

  // Profile Management
  async saveProfile() {
    if (this.profileForm.invalid) return;

    try {
      this.savingProfile.set(true);

      const formValue = this.profileForm.value;
      const updateData: UpdateProfileRequest = {
        name: formValue.name!,
        bio: formValue.bio || undefined
      };

      const updatedUser = await this.apiService.updateProfile(updateData);
      this.user.set(updatedUser);
      this.showSuccessMessage('Profile updated successfully!');

    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      this.savingProfile.set(false);
    }
  }

  resetProfileForm() {
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        bio: user.bio || ''
      });
    }
  }

  // Avatar Management
  async onAvatarSelect(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      this.uploadingAvatar.set(true);
      
      const result = await this.apiService.uploadAvatar(file);
      
      // Update user avatar
      this.user.update(current => 
        current ? { ...current, avatarUrl: result.avatarUrl } : current
      );
      
      this.showSuccessMessage('Avatar updated successfully!');

    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      this.uploadingAvatar.set(false);
    }
  }

  async removeAvatar() {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;

    try {
      await this.apiService.deleteAvatar();
      
      // Update user avatar
      this.user.update(current => 
        current ? { ...current, avatarUrl: undefined } : current
      );
      
      this.showSuccessMessage('Avatar removed successfully!');

    } catch (error) {
      console.error('Failed to remove avatar:', error);
    }
  }

  // Password Management
  async changePassword() {
    if (this.passwordForm.invalid) return;

    try {
      this.changingPassword.set(true);

      const formValue = this.passwordForm.value;
      const changeData: ChangePasswordRequest = {
        currentPassword: formValue.currentPassword!,
        newPassword: formValue.newPassword!
      };

      await this.apiService.changePassword(changeData);
      this.showSuccessMessage('Password changed successfully!');
      this.resetPasswordForm();

    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      this.changingPassword.set(false);
    }
  }

  resetPasswordForm() {
    this.passwordForm.reset();
    this.passwordStrength.set([false, false, false, false]);
  }

  // Password Visibility
  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword.update(current => !current);
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword.update(current => !current);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(current => !current);
  }

  // Account Deletion
  showDeleteConfirmation() {
    this.showDeleteModal.set(true);
    this.deleteConfirmation = '';
  }

  hideDeleteConfirmation() {
    this.showDeleteModal.set(false);
    this.deleteConfirmation = '';
  }

  async deleteAccount() {
    if (this.deleteConfirmation !== 'DELETE') return;

    try {
      this.deletingAccount.set(true);
      
      // This would call a delete account API endpoint
      // await this.apiService.deleteAccount();
      
      // For now, just simulate
      console.log('Account deletion requested');
      
      // Redirect to home page
      this.router.navigate(['/']);

    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      this.deletingAccount.set(false);
    }
  }

  // Utility Methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isPasswordFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getUserInitials(): string {
    const user = this.user();
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatJoinDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  }

  getPasswordStrengthText(): string {
    const strength = this.passwordStrength().filter(Boolean).length;
    switch (strength) {
      case 0: return '';
      case 1: return 'Weak password';
      case 2: return 'Fair password';
      case 3: return 'Good password';
      case 4: return 'Strong password';
      default: return '';
    }
  }

  getPasswordStrengthColor(): string {
    const strength = this.passwordStrength().filter(Boolean).length;
    switch (strength) {
      case 0: return 'text-amber-600';
      case 1: return 'text-red-600';
      case 2: return 'text-orange-600';
      case 3: return 'text-blue-600';
      case 4: return 'text-green-600';
      default: return 'text-amber-600';
    }
  }

  showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 5000);
  }

  clearSuccessMessage() {
    this.successMessage.set('');
  }
}
