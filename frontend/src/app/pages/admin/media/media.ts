import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../services/api';
import { Media, MediaQueryParams, MediaResponse, UpdateMediaRequest } from '../../../../types/api';

@Component({
  selector: 'app-admin-media',
  standalone: true,
  imports: [ ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- Page Header -->
      <header class="bg-amber-100 border-4 border-amber-300 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl md:text-3xl font-bold text-amber-900 mb-2">
              Media Library
            </h1>
            <p class="text-amber-700 font-mono text-sm">
              Manage images, videos, and other media files
            </p>
          </div>
          
          <div class="flex gap-3">
            <input
              #fileInput
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              (change)="onFilesSelected($event)"
              class="hidden"
            />
            <button
              (click)="fileInput.click()"
              [disabled]="uploading()"
              class="bg-green-600 text-green-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-green-700 transition-colors border-2 border-green-700 disabled:opacity-50"
            >
              {{ uploading() ? 'Uploading...' : 'Upload Files' }}
            </button>
          </div>
        </div>
      </header>

      <!-- Upload Progress -->
      @if (uploadProgress().length > 0) {
        <section class="bg-blue-50 border-4 border-blue-300 p-6">
          <h3 class="font-serif text-lg font-bold text-blue-900 mb-4">Upload Progress</h3>
          <div class="space-y-3">
            @for (progress of uploadProgress(); track progress.name) {
              <div class="flex items-center gap-4">
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-blue-900 font-mono text-sm">{{ progress.name }}</span>
                    <span class="text-blue-700 font-mono text-xs">{{ progress.progress }}%</span>
                  </div>
                  <div class="w-full bg-blue-200 h-2">
                    <div 
                      class="bg-blue-600 h-2 transition-all duration-300"
                      [style.width.%]="progress.progress"
                    ></div>
                  </div>
                  @if (progress.error) {
                    <p class="text-red-600 text-xs font-mono mt-1">{{ progress.error }}</p>
                  }
                </div>
                
                @if (progress.progress === 100 && !progress.error) {
                  <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                } @else if (progress.error) {
                  <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                  </svg>
                }
              </div>
            }
          </div>
        </section>
      }

      <!-- Filters & Search -->
      <section class="bg-amber-50 border-4 border-amber-300 p-6">
        <div class="grid md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Search Files
            </label>
            <div class="relative">
              <input
                [formControl]="searchControl"
                type="text"
                placeholder="Search by filename..."
                class="w-full px-4 py-3 pl-10 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- File Type Filter -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              File Type
            </label>
            <select 
              [formControl]="typeControl"
              class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
          </div>

          <!-- Uploader Filter -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Uploaded By
            </label>
            <select 
              [formControl]="uploaderControl"
              class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
            >
              <option value="">All Users</option>
              @for (uploader of uploaders(); track uploader._id) {
                <option [value]="uploader._id">{{ uploader.name }}</option>
              }
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
              <option value="filename">Filename (A-Z)</option>
              <option value="-filename">Filename (Z-A)</option>
              <option value="-size">Largest First</option>
              <option value="size">Smallest First</option>
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
              
              @if (typeFilter()) {
                <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                  Type: {{ getTypeDisplayName(typeFilter()) }}
                  <button (click)="clearTypeFilter()" class="hover:text-amber-900">×</button>
                </span>
              }
              
              @if (uploaderFilter()) {
                <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                  Uploader: {{ getUploaderName(uploaderFilter()) }}
                  <button (click)="clearUploaderFilter()" class="hover:text-amber-900">×</button>
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

      <!-- View Toggle -->
      <section class="bg-amber-50 border-4 border-amber-300 p-4">
        <div class="flex items-center justify-between">
          <div class="text-amber-700 font-mono text-sm">
            Showing {{ filteredMedia().length }} of {{ totalMedia() }} files
            @if (getSelectedSize() > 0) {
              • {{ selectedMedia().length }} selected ({{ formatFileSize(getSelectedSize()) }})
            }
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Bulk Actions -->
            @if (selectedMedia().length > 0) {
              <div class="flex gap-2">
                <button
                  (click)="bulkDelete()"
                  [disabled]="bulkActionLoading()"
                  class="bg-red-100 text-red-800 px-4 py-2 font-mono text-xs hover:bg-red-200 transition-colors border-2 border-red-300 disabled:opacity-50"
                >
                  Delete Selected
                </button>
              </div>
            }
            
            <!-- View Mode Toggle -->
            <div class="flex border-2 border-amber-300">
              <button
                (click)="setViewMode('grid')"
                [class]="viewMode() === 'grid' ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'"
                class="px-3 py-2 font-mono text-xs transition-colors"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button
                (click)="setViewMode('list')"
                [class]="viewMode() === 'list' ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'"
                class="px-3 py-2 font-mono text-xs transition-colors"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
            
            <!-- Bulk Select -->
            <label class="flex items-center gap-2 text-amber-700 font-mono text-sm">
              <input 
                type="checkbox" 
                [checked]="allSelected()"
                [indeterminate]="someSelected()"
                (change)="toggleSelectAll()"
                class="text-amber-600 border-2 border-amber-300"
              />
              Select All
            </label>
          </div>
        </div>
      </section>

      <!-- Media Display -->
      <section class="bg-amber-50 border-4 border-amber-300">
        @if (loading()) {
          <!-- Loading State -->
          <div class="p-8 text-center">
            <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-lg">
              <div class="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
              Loading media...
            </div>
          </div>
        } @else if (filteredMedia().length === 0) {
          <!-- Empty State -->
          <div class="p-8 text-center">
            <div class="inline-block border-4 border-amber-400 p-8 bg-amber-100">
              @if (hasActiveFilters()) {
                <div class="text-amber-600 font-mono text-lg mb-4">🔍 NO MATCHING FILES</div>
                <p class="text-amber-700 mb-6">No files match your current filters.</p>
                <button
                  (click)="clearAllFilters()"
                  class="bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors"
                >
                  Clear Filters
                </button>
              } @else {
                <div class="text-amber-600 font-mono text-lg mb-4">📁 NO FILES YET</div>
                <p class="text-amber-700 mb-6">No media files have been uploaded yet.</p>
                <button
                  (click)="fileInput.click()"
                  class="inline-block bg-green-600 text-green-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-green-700 transition-colors"
                >
                  Upload First File
                </button>
              }
            </div>
          </div>
        } @else {
          <!-- Media Grid/List -->
          <div class="p-6">
            @if (viewMode() === 'grid') {
              <!-- Grid View -->
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                @for (media of filteredMedia(); track media._id) {
                  <div class="bg-white border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 group cursor-pointer"
                       (click)="selectMediaItem(media)">
                    <!-- Selection Checkbox -->
                    <div class="absolute top-2 left-2 z-10">
                      <label class="flex items-center" (click)="$event.stopPropagation()">
                        <input 
                          type="checkbox" 
                          [checked]="selectedMedia().includes(media._id)"
                          (change)="toggleMediaSelection(media._id)"
                          class="text-amber-600 border-2 border-amber-300"
                        />
                      </label>
                    </div>
                    
                    <!-- Media Preview -->
                    <div class="aspect-square bg-amber-100 flex items-center justify-center relative overflow-hidden">
                      @if (isImage(media.mimeType)) {
                        <img 
                          [src]="media.thumbnailUrl || media.url" 
                          [alt]="media.altText || media.filename"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      } @else {
                        <div class="text-center">
                          <div class="w-12 h-12 mx-auto mb-2 text-amber-600">
                            @if (isVideo(media.mimeType)) {
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                              </svg>
                            } @else if (isAudio(media.mimeType)) {
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.414A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd"></path>
                              </svg>
                            } @else {
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                              </svg>
                            }
                          </div>
                          <div class="text-xs font-mono text-amber-700 px-2">
                            {{ getFileExtension(media.filename) }}
                          </div>
                        </div>
                      }
                    </div>
                    
                    <!-- Media Info -->
                    <div class="p-3">
                      <h4 class="font-mono text-xs font-bold text-amber-900 truncate mb-1">
                        {{ media.filename }}
                      </h4>
                      <div class="text-xs text-amber-600 font-mono">
                        {{ formatFileSize(media.size) }}
                      </div>
                      <div class="text-xs text-amber-500 font-mono">
                        {{ formatDate(media.createdAt) }}
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <!-- List View -->
              <div class="space-y-2">
                @for (media of filteredMedia(); track media._id) {
                  <div class="bg-white border-2 border-amber-200 hover:border-amber-400 transition-colors p-4">
                    <div class="flex items-center gap-4">
                      <!-- Selection Checkbox -->
                      <label class="flex items-center">
                        <input 
                          type="checkbox" 
                          [checked]="selectedMedia().includes(media._id)"
                          (change)="toggleMediaSelection(media._id)"
                          class="text-amber-600 border-2 border-amber-300"
                        />
                      </label>
                      
                      <!-- Thumbnail -->
                      <div class="w-12 h-12 bg-amber-100 flex items-center justify-center flex-shrink-0">
                        @if (isImage(media.mimeType)) {
                          <img 
                            [src]="media.thumbnailUrl || media.url" 
                            [alt]="media.altText || media.filename"
                            class="w-full h-full object-cover"
                            loading="lazy"
                          />
                        } @else {
                          <div class="w-6 h-6 text-amber-600">
                            @if (isVideo(media.mimeType)) {
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                              </svg>
                            } @else if (isAudio(media.mimeType)) {
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clip-rule="evenodd"></path>
                              </svg>
                            } @else {
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
                              </svg>
                            }
                          </div>
                        }
                      </div>
                      
                      <!-- File Info -->
                      <div class="flex-1 min-w-0">
                        <h4 class="font-mono text-sm font-bold text-amber-900 truncate">
                          {{ media.filename }}
                        </h4>
                        @if (media.altText) {
                          <p class="text-amber-700 text-xs truncate">{{ media.altText }}</p>
                        }
                        <div class="flex items-center gap-2 text-xs font-mono text-amber-600 mt-1">
                          <span>{{ formatFileSize(media.size) }}</span>
                          <span>•</span>
                          <span>{{ media.mimeType }}</span>
                          <span>•</span>
                          <span>{{ formatDate(media.createdAt) }}</span>
                        </div>
                      </div>
                      
                      <!-- Usage Info -->
                      <div class="text-xs font-mono text-amber-600 text-right">
                        @if (media.usedIn && media.usedIn.length > 0) {
                          <div>Used in {{ media.usedIn.length }} place(s)</div>
                        } @else {
                          <div>Unused</div>
                        }
                        <div>{{ getUploaderName(getUploaderId(media)) }}</div>
                      </div>
                      
                      <!-- Actions -->
                      <div class="flex gap-2">
                        <button
                          (click)="viewMedia(media)"
                          class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          title="View"
                        >
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                          </svg>
                        </button>
                        
                        <button
                          (click)="editMedia(media)"
                          class="inline-flex items-center justify-center w-8 h-8 bg-amber-200 text-amber-800 hover:bg-amber-300 transition-colors"
                          title="Edit"
                        >
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                          </svg>
                        </button>
                        
                        <button
                          (click)="deleteMedia(media._id)"
                          [disabled]="deleting().includes(media._id)"
                          class="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          @if (deleting().includes(media._id)) {
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
                }
              </div>
            }

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="mt-8 flex items-center justify-between">
                <div class="text-amber-700 font-mono text-sm">
                  Page {{ currentPage() }} of {{ totalPages() }}
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
            }
          </div>
        }
      </section>

      <!-- Media Statistics -->
      <section class="grid md:grid-cols-4 gap-6">
        <div class="bg-blue-100 border-4 border-blue-300 p-6 text-center">
          <div class="text-3xl font-bold text-blue-900 mb-2">{{ getTotalFiles() }}</div>
          <div class="text-blue-700 font-mono text-sm">Total Files</div>
        </div>
        
        <div class="bg-green-100 border-4 border-green-300 p-6 text-center">
          <div class="text-3xl font-bold text-green-900 mb-2">{{ formatFileSize(getTotalSize()) }}</div>
          <div class="text-green-700 font-mono text-sm">Total Size</div>
        </div>
        
        <div class="bg-purple-100 border-4 border-purple-300 p-6 text-center">
          <div class="text-3xl font-bold text-purple-900 mb-2">{{ getImageCount() }}</div>
          <div class="text-purple-700 font-mono text-sm">Images</div>
        </div>
        
        <div class="bg-orange-100 border-4 border-orange-300 p-6 text-center">
          <div class="text-3xl font-bold text-orange-900 mb-2">{{ getUnusedCount() }}</div>
          <div class="text-orange-700 font-mono text-sm">Unused Files</div>
        </div>
      </section>
    </div>

    <!-- Edit Media Modal -->
    @if (showEditModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeEditModal()">
        <div class="bg-amber-50 border-4 border-amber-800 p-6 max-w-lg w-full mx-4" (click)="$event.stopPropagation()">
          <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Edit Media</h3>
          
          @if (editingMedia()) {
            <form [formGroup]="mediaForm" (ngSubmit)="saveMedia()">
              <div class="space-y-4">
                <!-- Preview -->
                <div class="text-center mb-4">
                  @if (isImage(editingMedia()!.mimeType)) {
                    <img 
                      [src]="editingMedia()!.url" 
                      [alt]="editingMedia()!.filename"
                      class="max-w-full max-h-48 mx-auto border-2 border-amber-300"
                    />
                  } @else {
                    <div class="w-24 h-24 bg-amber-200 border-2 border-amber-400 flex items-center justify-center mx-auto">
                      <svg class="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  }
                  <p class="text-amber-700 font-mono text-sm mt-2">{{ editingMedia()!.filename }}</p>
                </div>
                
                <!-- Alt Text -->
                <div>
                  <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Alt Text</label>
                  <input
                    type="text"
                    formControlName="altText"
                    placeholder="Describe the image for accessibility..."
                    class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white"
                  />
                  <p class="mt-1 text-amber-600 text-xs font-mono">
                    Used for accessibility and SEO
                  </p>
                </div>
                
                <!-- Description -->
                <div>
                  <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Description</label>
                  <textarea
                    formControlName="description"
                    rows="3"
                    placeholder="Add a description for this file..."
                    class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white resize-none"
                  ></textarea>
                </div>
              </div>
              
              <div class="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  (click)="closeEditModal()"
                  class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  [disabled]="saving()"
                  class="bg-amber-800 text-amber-100 px-4 py-2 font-mono text-sm hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {{ saving() ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    }

    <!-- View Media Modal -->
    @if (showViewModal() && viewingMedia()) {
      <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" (click)="closeViewModal()">
        <div class="max-w-4xl max-h-[90vh] w-full mx-4" (click)="$event.stopPropagation()">
          <div class="bg-amber-50 border-4 border-amber-800 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-serif text-xl font-bold text-amber-900">{{ viewingMedia()!.filename }}</h3>
              <button
                (click)="closeViewModal()"
                class="text-amber-600 hover:text-amber-800 transition-colors"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
            
            <div class="text-center mb-4">
              @if (isImage(viewingMedia()!.mimeType)) {
                <img 
                  [src]="viewingMedia()!.url" 
                  [alt]="viewingMedia()!.altText || viewingMedia()!.filename"
                  class="max-w-full max-h-96 mx-auto"
                />
              } @else if (isVideo(viewingMedia()!.mimeType)) {
                <video 
                  [src]="viewingMedia()!.url" 
                  controls
                  class="max-w-full max-h-96 mx-auto"
                >
                  Your browser does not support the video tag.
                </video>
              } @else if (isAudio(viewingMedia()!.mimeType)) {
                <audio 
                  [src]="viewingMedia()!.url" 
                  controls
                  class="w-full"
                >
                  Your browser does not support the audio tag.
                </audio>
              } @else {
                <div class="text-center py-8">
                  <svg class="w-24 h-24 text-amber-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
                  </svg>
                  <p class="text-amber-700 font-mono">{{ viewingMedia()!.mimeType }}</p>
                </div>
              }
            </div>
            
            <div class="grid md:grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <strong class="text-amber-900">Size:</strong> {{ formatFileSize(viewingMedia()!.size) }}
              </div>
              <div>
                <strong class="text-amber-900">Type:</strong> {{ viewingMedia()!.mimeType }}
              </div>
              <div>
                <strong class="text-amber-900">Uploaded:</strong> {{ formatDate(viewingMedia()!.createdAt) }}
              </div>
              <div>
                <strong class="text-amber-900">By:</strong> {{ getUploaderName(getUploaderId(viewingMedia()!)) }}
              </div>
            </div>
            
            @if (viewingMedia()!.description) {
              <div class="mt-4">
                <strong class="text-amber-900 text-sm font-mono">Description:</strong>
                <p class="text-amber-700 text-sm mt-1">{{ viewingMedia()!.description }}</p>
              </div>
            }
            
            <div class="flex justify-center gap-3 mt-6">
              <a
                [href]="viewingMedia()!.url"
                target="_blank"
                class="bg-blue-100 text-blue-800 px-4 py-2 font-mono text-sm hover:bg-blue-200 transition-colors border-2 border-blue-300"
              >
                Open Original
              </a>
              
              <button
                (click)="copyUrl(viewingMedia()!.url)"
                class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors border-2 border-amber-400"
              >
                Copy URL
              </button>
            </div>
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

    /* Hover effects for media items */
    .group:hover img {
      transform: scale(1.05);
    }

    /* Upload progress animation */
    @keyframes upload-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .upload-progress {
      animation: upload-pulse 2s infinite;
    }
  `]
})
export class AdminMediaComponent implements OnInit {
  private apiService = inject(ApiService);

  // Reactive Signals
  loading = signal(false);
  uploading = signal(false);
  saving = signal(false);
  bulkActionLoading = signal(false);
  
  media = signal<Media[]>([]);
  uploaders = signal<any[]>([]);
  totalMedia = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  
  selectedMedia = signal<string[]>([]);
  deleting = signal<string[]>([]);
  
  viewMode = signal<'grid' | 'list'>('grid');
  showEditModal = signal(false);
  showViewModal = signal(false);
  editingMedia = signal<Media | null>(null);
  viewingMedia = signal<Media | null>(null);
  
  uploadProgress = signal<Array<{
    name: string;
    progress: number;
    error?: string;
  }>>([]);

  // Form Controls
  searchControl = new FormControl('');
  typeControl = new FormControl('');
  uploaderControl = new FormControl('');
  sortControl = new FormControl('-createdAt');

  // Filter states
  searchQuery = signal('');
  typeFilter = signal('');
  uploaderFilter = signal('');

  // Media Form
  mediaForm = new FormGroup({
    altText: new FormControl(''),
    description: new FormControl('')
  });

  // Computed values
  filteredMedia = computed(() => {
    let filtered = [...this.media()];
    
    // Search filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(media => 
        media.filename.toLowerCase().includes(query) ||
        media.originalName.toLowerCase().includes(query) ||
        media.altText?.toLowerCase().includes(query) ||
        media.description?.toLowerCase().includes(query)
      );
    }
    
    // Type filter
    if (this.typeFilter()) {
      const type = this.typeFilter();
      filtered = filtered.filter(media => {
        switch (type) {
          case 'image': return this.isImage(media.mimeType);
          case 'video': return this.isVideo(media.mimeType);
          case 'audio': return this.isAudio(media.mimeType);
          case 'document': return this.isDocument(media.mimeType);
          default: return true;
        }
      });
    }
    
    // Uploader filter
    if (this.uploaderFilter()) {
      filtered = filtered.filter(media => 
        this.getUploaderId(media) === this.uploaderFilter()
      );
    }
    
    return this.sortMedia(filtered);
  });

  hasActiveFilters = computed(() => 
    !!(this.searchQuery() || this.typeFilter() || this.uploaderFilter())
  );

  allSelected = computed(() => 
    this.filteredMedia().length > 0 && 
    this.filteredMedia().every(media => this.selectedMedia().includes(media._id))
  );

  someSelected = computed(() => 
    this.selectedMedia().length > 0 && 
    !this.allSelected()
  );

  async ngOnInit() {
    await this.loadMedia();
    this.setupFormSubscriptions();
    this.loadUploaders();
  }

  private async loadMedia() {
    try {
      this.loading.set(true);
      
      const params: MediaQueryParams = {
        page: this.currentPage(),
        limit: 24
      };

      if (this.uploaderFilter()) params.uploadedBy = this.uploaderFilter();

      const response = await this.apiService.getMedia(params);
      
      this.media.set(response.media || response.data || []);
      this.totalMedia.set(response.totalMedia || response.totalItems || 0);
      this.totalPages.set(response.totalPages || 1);
      
    } catch (error) {
      console.error('Failed to load media:', error);
      this.media.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadUploaders() {
    try {
      // Get unique uploaders from media
      const uploaders = new Map();
      this.media().forEach(media => {
        const uploader = media.uploadedBy;
        if (typeof uploader === 'object' && uploader._id) {
          uploaders.set(uploader._id, uploader);
        }
      });
      this.uploaders.set(Array.from(uploaders.values()));
    } catch (error) {
      console.error('Failed to load uploaders:', error);
    }
  }

  private setupFormSubscriptions() {
    const searchSignal: any = toSignal(this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()) as any, { initialValue: this.searchControl.value as any });
    effect(() => {
      const value = searchSignal();
      this.searchQuery.set(value || '');
    });

    const typeSignal: any = toSignal(this.typeControl.valueChanges as any, { initialValue: this.typeControl.value as any });
    effect(() => {
      const value = typeSignal();
      this.typeFilter.set(value || '');
    });

    const uploaderSignal: any = toSignal(this.uploaderControl.valueChanges as any, { initialValue: this.uploaderControl.value as any });
    effect(() => {
      const value = uploaderSignal();
      this.uploaderFilter.set(value || '');
    });
  }

  private sortMedia(media: Media[]): Media[] {
    const sortBy = this.sortControl.value || '-createdAt';
    const [direction, field] = sortBy.startsWith('-') 
      ? ['desc', sortBy.slice(1)] 
      : ['asc', sortBy];

    return [...media].sort((a, b) => {
      let aVal, bVal;
      
      switch (field) {
        case 'filename':
          aVal = a.filename.toLowerCase();
          bVal = b.filename.toLowerCase();
          break;
        case 'size':
          aVal = a.size;
          bVal = b.size;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (direction === 'desc') {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });
  }

  // File Upload
  async onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    if (files.length === 0) return;

    try {
      this.uploading.set(true);
      
      // Initialize progress tracking
      const progressMap = files.map(file => ({
        name: file.name,
        progress: 0,
        error: undefined
      }));
      this.uploadProgress.set(progressMap);

      // Upload files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Update progress
          this.uploadProgress.update(progress => 
            progress.map((p, index) => 
              index === i ? { ...p, progress: 50 } : p
            )
          );

          const uploadedMedia = await this.apiService.uploadMedia(file);
          
          // Complete progress
          this.uploadProgress.update(progress => 
            progress.map((p, index) => 
              index === i ? { ...p, progress: 100 } : p
            )
          );

          // Add to media list
          this.media.update(media => [uploadedMedia, ...media]);
          this.totalMedia.update(count => count + 1);

        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          
          // Mark as error
          this.uploadProgress.update(progress => 
            progress.map((p, index) => 
              index === i ? { ...p, progress: 0, error: 'Upload failed' } : p
            )
          );
        }
      }

      // Clear progress after delay
      setTimeout(() => {
        this.uploadProgress.set([]);
      }, 3000);

      // Clear file input
      event.target.value = '';

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      this.uploading.set(false);
    }
  }

  // View Management
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  selectMediaItem(media: Media) {
    if (this.selectedMedia().includes(media._id)) {
      this.viewMedia(media);
    } else {
      this.toggleMediaSelection(media._id);
    }
  }

  // Selection Management
  toggleMediaSelection(mediaId: string) {
    this.selectedMedia.update(selected => {
      if (selected.includes(mediaId)) {
        return selected.filter(id => id !== mediaId);
      } else {
        return [...selected, mediaId];
      }
    });
  }

  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedMedia.set([]);
    } else {
      const allIds = this.filteredMedia().map(media => media._id);
      this.selectedMedia.set(allIds);
    }
  }

  // Media Actions
  viewMedia(media: Media) {
    this.viewingMedia.set(media);
    this.showViewModal.set(true);
  }

  closeViewModal() {
    this.showViewModal.set(false);
    this.viewingMedia.set(null);
  }

  editMedia(media: Media) {
    this.editingMedia.set(media);
    this.mediaForm.patchValue({
      altText: media.altText || '',
      description: media.description || ''
    });
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingMedia.set(null);
    this.mediaForm.reset();
  }

  async saveMedia() {
    if (!this.editingMedia()) return;

    try {
      this.saving.set(true);

      const formValue = this.mediaForm.value;
      const updateData: UpdateMediaRequest = {
        altText: formValue.altText || undefined,
        description: formValue.description || undefined
      };

      const updatedMedia = await this.apiService.updateMedia(
        this.editingMedia()!._id, 
        updateData
      );

      // Update in list
      this.media.update(media => 
        media.map(m => m._id === updatedMedia._id ? updatedMedia : m)
      );

      this.closeEditModal();

    } catch (error) {
      console.error('Failed to update media:', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteMedia(mediaId: string) {
    const media = this.media().find(m => m._id === mediaId);
    if (!media) return;

    let confirmMessage = `Are you sure you want to delete "${media.filename}"?`;
    if (media.usedIn && media.usedIn.length > 0) {
      confirmMessage += ` This file is used in ${media.usedIn.length} place(s).`;
    }
    confirmMessage += ' This action cannot be undone.';

    if (!confirm(confirmMessage)) return;

    try {
      this.deleting.update(deleting => [...deleting, mediaId]);
      
      await this.apiService.deleteMedia(mediaId);
      
      // Remove from media list
      this.media.update(media => media.filter(m => m._id !== mediaId));
      this.selectedMedia.update(selected => selected.filter(id => id !== mediaId));
      this.totalMedia.update(count => count - 1);
      
    } catch (error) {
      console.error('Failed to delete media:', error);
    } finally {
      this.deleting.update(deleting => deleting.filter(id => id !== mediaId));
    }
  }

  // Bulk Actions
  async bulkDelete() {
    const count = this.selectedMedia().length;
    if (!confirm(`Delete ${count} selected files? This action cannot be undone.`)) return;

    try {
      this.bulkActionLoading.set(true);
      
      const deletePromises = this.selectedMedia().map(id => this.apiService.deleteMedia(id));
      await Promise.all(deletePromises);
      
      // Remove from media list
      const deletedIds = this.selectedMedia();
      this.media.update(media => media.filter(m => !deletedIds.includes(m._id)));
      this.totalMedia.update(count => count - deletedIds.length);
      this.selectedMedia.set([]);
      
    } catch (error) {
      console.error('Failed to bulk delete media:', error);
    } finally {
      this.bulkActionLoading.set(false);
    }
  }

  // Filter Management
  clearSearch() {
    this.searchControl.setValue('');
  }

  clearTypeFilter() {
    this.typeControl.setValue('');
  }

  clearUploaderFilter() {
    this.uploaderControl.setValue('');
  }

  clearAllFilters() {
    this.searchControl.setValue('');
    this.typeControl.setValue('');
    this.uploaderControl.setValue('');
    this.sortControl.setValue('-createdAt');
  }

  // Pagination
  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    
    this.currentPage.set(page);
    await this.loadMedia();
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

  // Utility Methods
  copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
  }

  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  isVideo(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  isAudio(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }

  isDocument(mimeType: string): boolean {
    return mimeType.includes('pdf') || 
           mimeType.includes('document') || 
           mimeType.includes('text/') ||
           mimeType.includes('application/');
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTypeDisplayName(type: string): string {
    switch (type) {
      case 'image': return 'Images';
      case 'video': return 'Videos';
      case 'audio': return 'Audio';
      case 'document': return 'Documents';
      default: return type;
    }
  }

  getUploaderId(media: Media): string {
    const uploader = media.uploadedBy;
    return typeof uploader === 'object' ? uploader._id : uploader;
  }

  getUploaderName(uploaderId: string): string {
    const uploader = this.uploaders().find(u => u._id === uploaderId);
    return uploader ? uploader.name : 'Unknown';
  }

  getSelectedSize(): number {
    const selectedFiles = this.media().filter(m => this.selectedMedia().includes(m._id));
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  }

  // Statistics
  getTotalFiles(): number {
    return this.totalMedia();
  }

  getTotalSize(): number {
    return this.media().reduce((total, media) => total + media.size, 0);
  }

  getImageCount(): number {
    return this.media().filter(media => this.isImage(media.mimeType)).length;
  }

  getUnusedCount(): number {
    return this.media().filter(media => !media.usedIn || media.usedIn.length === 0).length;
  }
}
