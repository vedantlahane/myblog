import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../services/api.service';
import { Tag, CreateTagRequest, UpdateTagRequest, Post } from '../../../../types/api';

@Component({
  selector: 'app-admin-tags',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- Page Header -->
      <header class="bg-amber-100 border-4 border-amber-300 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl md:text-3xl font-bold text-amber-900 mb-2">
              Tags Management
            </h1>
            <p class="text-amber-700 font-mono text-sm">
              Organize and manage content tags and categories
            </p>
          </div>
          
          <button
            (click)="showCreateTagModal()"
            class="bg-green-600 text-green-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-green-700 transition-colors border-2 border-green-700"
          >
            Create New Tag
          </button>
        </div>
      </header>

      <!-- Filters & Search -->
      <section class="bg-amber-50 border-4 border-amber-300 p-6">
        <div class="grid md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Search Tags
            </label>
            <div class="relative">
              <input
                [formControl]="searchControl"
                type="text"
                placeholder="Search by name or description..."
                class="w-full px-4 py-3 pl-10 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Usage Filter -->
          <div>
            <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
              Usage
            </label>
            <select 
              [formControl]="usageControl"
              class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
            >
              <option value="">All Tags</option>
              <option value="popular">Popular (10+ posts)</option>
              <option value="moderate">Moderate (3-9 posts)</option>
              <option value="low">Low usage (1-2 posts)</option>
              <option value="unused">Unused (0 posts)</option>
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
              <option value="name">Name (A-Z)</option>
              <option value="-name">Name (Z-A)</option>
              <option value="-postCount">Most Used</option>
              <option value="postCount">Least Used</option>
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
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
              
              @if (usageFilter()) {
                <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                  Usage: {{ getUsageDisplayName(usageFilter()) }}
                  <button (click)="clearUsageFilter()" class="hover:text-amber-900">×</button>
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
      @if (selectedTags().length > 0) {
        <section class="bg-blue-50 border-4 border-blue-300 p-4">
          <div class="flex items-center justify-between">
            <div class="text-blue-900 font-mono text-sm">
              {{ selectedTags().length }} tag(s) selected
            </div>
            
            <div class="flex gap-3">
              <button
                (click)="bulkMerge()"
                [disabled]="selectedTags().length < 2 || bulkActionLoading()"
                class="bg-purple-100 text-purple-800 px-4 py-2 font-mono text-sm hover:bg-purple-200 transition-colors border-2 border-purple-300 disabled:opacity-50"
              >
                Merge Tags
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

      <!-- Tags Grid -->
      <section class="bg-amber-50 border-4 border-amber-300">
        @if (loading()) {
          <!-- Loading State -->
          <div class="p-8 text-center">
            <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-lg">
              <div class="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
              Loading tags...
            </div>
          </div>
        } @else if (filteredTags().length === 0) {
          <!-- Empty State -->
          <div class="p-8 text-center">
            <div class="inline-block border-4 border-amber-400 p-8 bg-amber-100">
              @if (hasActiveFilters()) {
                <div class="text-amber-600 font-mono text-lg mb-4">🔍 NO MATCHING TAGS</div>
                <p class="text-amber-700 mb-6">No tags match your current filters.</p>
                <button
                  (click)="clearAllFilters()"
                  class="bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors"
                >
                  Clear Filters
                </button>
              } @else {
                <div class="text-amber-600 font-mono text-lg mb-4">🏷️ NO TAGS YET</div>
                <p class="text-amber-700 mb-6">No tags have been created yet.</p>
                <button
                  (click)="showCreateTagModal()"
                  class="inline-block bg-green-600 text-green-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-green-700 transition-colors"
                >
                  Create First Tag
                </button>
              }
            </div>
          </div>
        } @else {
          <!-- Tags Grid -->
          <div class="p-6">
            <!-- Grid Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="text-amber-700 font-mono text-sm">
                Showing {{ filteredTags().length }} of {{ totalTags() }} tags
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

            <!-- Tags Grid Layout -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              @for (tag of filteredTags(); track tag._id) {
                <div class="bg-white border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 group">
                  <!-- Tag Header -->
                  <div class="p-4 border-b-2 border-amber-200"
                       [style.background-color]="tag.color ? tag.color + '20' : '#fef3cd'">
                    <div class="flex items-start justify-between">
                      <!-- Selection & Tag Name -->
                      <div class="flex items-start gap-3 flex-1">
                        <label class="flex items-center mt-1">
                          <input 
                            type="checkbox" 
                            [checked]="selectedTags().includes(tag._id)"
                            (change)="toggleTagSelection(tag._id)"
                            class="text-amber-600 border-2 border-amber-300"
                          />
                        </label>
                        
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-2">
                            <div 
                              class="w-4 h-4 rounded-full border-2 border-amber-400"
                              [style.background-color]="tag.color || '#fbbf24'"
                            ></div>
                            <h3 class="font-serif font-bold text-amber-900 leading-tight">
                              {{ tag.name }}
                            </h3>
                          </div>
                          
                          <div class="text-amber-600 text-xs font-mono">
                            #{{ tag.slug }}
                          </div>
                        </div>
                      </div>
                      
                      <!-- Usage Badge -->
                      <div class="flex-shrink-0">
                        <span [class]="getUsageBadgeClass(tag.postCount)" class="px-2 py-1 text-xs font-mono">
                          {{ tag.postCount }} post{{ tag.postCount === 1 ? '' : 's' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Tag Content -->
                  <div class="p-4">
                    @if (tag.description) {
                      <p class="text-amber-700 text-sm leading-relaxed mb-4 line-clamp-3">
                        {{ tag.description }}
                      </p>
                    } @else {
                      <p class="text-amber-500 text-sm italic mb-4">No description</p>
                    }
                    
                    <!-- Tag Meta -->
                    <div class="text-xs font-mono text-amber-600 mb-4">
                      Created {{ formatDate(tag.createdAt) }}
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex items-center justify-between">
                      <div class="flex gap-2">
                        <a 
                          [routerLink]="['/tag', tag.slug]"
                          class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          title="View Tag"
                        >
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                          </svg>
                        </a>
                        
                        <button
                          (click)="editTag(tag)"
                          class="inline-flex items-center justify-center w-8 h-8 bg-amber-200 text-amber-800 hover:bg-amber-300 transition-colors"
                          title="Edit"
                        >
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                          </svg>
                        </button>
                        
                        <button
                          (click)="deleteTag(tag._id)"
                          [disabled]="deleting().includes(tag._id)"
                          class="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          @if (deleting().includes(tag._id)) {
                            <div class="w-3 h-3 border border-red-800 border-t-transparent rounded-full animate-spin"></div>
                          } @else {
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                            </svg>
                          }
                        </button>
                      </div>
                      
                      @if (tag.postCount > 0) {
                        <button
                          (click)="viewTagPosts(tag)"
                          class="text-amber-600 hover:text-amber-800 font-mono text-xs underline"
                        >
                          View Posts →
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </section>

      <!-- Tag Statistics -->
      <section class="grid md:grid-cols-4 gap-6">
        <div class="bg-blue-100 border-4 border-blue-300 p-6 text-center">
          <div class="text-3xl font-bold text-blue-900 mb-2">{{ getTotalTags() }}</div>
          <div class="text-blue-700 font-mono text-sm">Total Tags</div>
        </div>
        
        <div class="bg-green-100 border-4 border-green-300 p-6 text-center">
          <div class="text-3xl font-bold text-green-900 mb-2">{{ getPopularTags() }}</div>
          <div class="text-green-700 font-mono text-sm">Popular Tags</div>
        </div>
        
        <div class="bg-yellow-100 border-4 border-yellow-300 p-6 text-center">
          <div class="text-3xl font-bold text-yellow-900 mb-2">{{ getUnusedTags() }}</div>
          <div class="text-yellow-700 font-mono text-sm">Unused Tags</div>
        </div>
        
        <div class="bg-purple-100 border-4 border-purple-300 p-6 text-center">
          <div class="text-3xl font-bold text-purple-900 mb-2">{{ getAverageUsage() }}</div>
          <div class="text-purple-700 font-mono text-sm">Avg Posts/Tag</div>
        </div>
      </section>
    </div>

    <!-- Create/Edit Tag Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModal()">
        <div class="bg-amber-50 border-4 border-amber-800 p-6 max-w-lg w-full mx-4" (click)="$event.stopPropagation()">
          <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">
            {{ editingTag() ? 'Edit Tag' : 'Create New Tag' }}
          </h3>
          
          <form [formGroup]="tagForm" (ngSubmit)="saveTag()">
            <div class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Tag Name</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="Enter tag name"
                  class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white"
                  [class.border-red-400]="isFieldInvalid('name')"
                />
                @if (isFieldInvalid('name')) {
                  <p class="mt-1 text-red-600 text-xs font-mono">Tag name is required</p>
                }
                <p class="mt-1 text-amber-600 text-xs font-mono">
                  Slug: {{ generateSlug(tagForm.get('name')?.value || '') }}
                </p>
              </div>
              
              <!-- Color -->
              <div>
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Color</label>
                <div class="flex items-center gap-4">
                  <input
                    type="color"
                    formControlName="color"
                    class="w-16 h-12 border-2 border-amber-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    formControlName="color"
                    placeholder="#fbbf24"
                    class="flex-1 px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
                  />
                </div>
                <p class="mt-1 text-amber-600 text-xs font-mono">Choose a color for the tag</p>
              </div>
              
              <!-- Description -->
              <div>
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Description</label>
                <textarea
                  formControlName="description"
                  rows="3"
                  placeholder="Describe what this tag represents..."
                  class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white resize-none"
                ></textarea>
                <p class="mt-1 text-amber-600 text-xs font-mono">
                  {{ (tagForm.get('description')?.value || '').length }}/200 characters
                </p>
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
                [disabled]="tagForm.invalid || saving()"
                class="bg-amber-800 text-amber-100 px-4 py-2 font-mono text-sm hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {{ saving() ? 'Saving...' : (editingTag() ? 'Update Tag' : 'Create Tag') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Merge Tags Modal -->
    @if (showMergeModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeMergeModal()">
        <div class="bg-amber-50 border-4 border-amber-800 p-6 max-w-lg w-full mx-4" (click)="$event.stopPropagation()">
          <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Merge Tags</h3>
          
          <div class="space-y-4">
            <p class="text-amber-700 text-sm">
              Select the target tag to merge all selected tags into. The other tags will be deleted and their posts will be transferred.
            </p>
            
            <div>
              <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Target Tag</label>
              <select 
                [formControl]="mergeTargetTagControl"
                class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              >
                <option value="">Select target tag...</option>
                @for (tag of getSelectedTagsForMerge(); track tag._id) {
                  <option [value]="tag._id">{{ tag.name }} ({{ tag.postCount }} posts)</option>
                }
              </select>
            </div>
            
            <div class="bg-yellow-50 border-2 border-yellow-300 p-4">
              <h4 class="font-bold text-yellow-900 text-sm mb-2">Warning</h4>
              <p class="text-yellow-800 text-sm">
                This action cannot be undone. {{ selectedTags().length - 1 }} tags will be deleted.
              </p>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <button
              (click)="closeMergeModal()"
              class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors"
            >
              Cancel
            </button>
            
            <button
              (click)="executeMerge()"
              [disabled]="!mergeTargetTagControl.value || bulkActionLoading()"
              class="bg-red-600 text-red-100 px-4 py-2 font-mono text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ bulkActionLoading() ? 'Merging...' : 'Merge Tags' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
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

    /* Color input styling */
    input[type="color"] {
      -webkit-appearance: none;
      border: none;
      cursor: pointer;
    }

    input[type="color"]::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    input[type="color"]::-webkit-color-swatch {
      border: none;
    }

    /* Vintage paper texture */
    .bg-amber-50 {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Card hover effects */
    .group:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class AdminTagsComponent implements OnInit {
  private apiService = inject(ApiService);

  // Reactive Signals
  loading = signal(false);
  saving = signal(false);
  bulkActionLoading = signal(false);
  tags = signal<Tag[]>([]);
  totalTags = signal(0);
  
  selectedTags = signal<string[]>([]);
  deleting = signal<string[]>([]);
  
  showModal = signal(false);
  showMergeModal = signal(false);
  editingTag = signal<Tag | null>(null);
  mergeTargetTagControl = new FormControl('');

  // Form Controls
  searchControl = new FormControl('');
  usageControl = new FormControl('');
  sortControl = new FormControl('name');

  // Filter states
  searchQuery = signal('');
  usageFilter = signal('');

  // Tag Form
  tagForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    description: new FormControl('', [Validators.maxLength(200)]),
    color: new FormControl('#fbbf24')
  });

  // Computed values
  filteredTags = computed(() => {
    let filtered = [...this.tags()];
    
    // Search filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(tag => 
        tag.name.toLowerCase().includes(query) || 
        tag.description?.toLowerCase().includes(query)
      );
    }
    
    // Usage filter
    if (this.usageFilter()) {
      const usage = this.usageFilter();
      filtered = filtered.filter(tag => {
        switch (usage) {
          case 'popular': return tag.postCount >= 10;
          case 'moderate': return tag.postCount >= 3 && tag.postCount <= 9;
          case 'low': return tag.postCount >= 1 && tag.postCount <= 2;
          case 'unused': return tag.postCount === 0;
          default: return true;
        }
      });
    }
    
    return this.sortTags(filtered);
  });

  hasActiveFilters = computed(() => 
    !!(this.searchQuery() || this.usageFilter())
  );

  allSelected = computed(() => 
    this.filteredTags().length > 0 && 
    this.filteredTags().every(tag => this.selectedTags().includes(tag._id))
  );

  someSelected = computed(() => 
    this.selectedTags().length > 0 && 
    !this.allSelected()
  );

  async ngOnInit() {
    await this.loadTags();
    this.setupFormSubscriptions();
  }

  private async loadTags() {
    try {
      this.loading.set(true);
      
      const tags = await this.apiService.getTags();
      this.tags.set(tags);
      this.totalTags.set(tags.length);
      
    } catch (error) {
      console.error('Failed to load tags:', error);
      this.tags.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private setupFormSubscriptions() {
    // Search with debounce (signal)
    const searchSignal: any = toSignal(
      this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()) as any,
      { initialValue: this.searchControl.value as any }
    );
    effect(() => {
      const value = searchSignal();
      this.searchQuery.set(value || '');
    });

    // Usage filter (signal)
    const usageSignal: any = toSignal(this.usageControl.valueChanges as any, { initialValue: this.usageControl.value as any });
    effect(() => {
      const value = usageSignal();
      this.usageFilter.set(value || '');
    });
  }

  private sortTags(tags: Tag[]): Tag[] {
    const sortBy = this.sortControl.value || 'name';
    const [direction, field] = sortBy.startsWith('-') 
      ? ['desc', sortBy.slice(1)] 
      : ['asc', sortBy];

    return [...tags].sort((a, b) => {
      let aVal, bVal;
      
      switch (field) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'postCount':
          aVal = a.postCount;
          bVal = b.postCount;
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

  // Modal Management
  showCreateTagModal() {
    this.editingTag.set(null);
    this.tagForm.reset({
      name: '',
      description: '',
      color: '#fbbf24'
    });
    this.showModal.set(true);
  }

  editTag(tag: Tag) {
    this.editingTag.set(tag);
    this.tagForm.patchValue({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#fbbf24'
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingTag.set(null);
    this.tagForm.reset();
  }

  async saveTag() {
    if (this.tagForm.invalid) return;

    try {
      this.saving.set(true);

      const formValue = this.tagForm.value;
      const tagData = {
        name: formValue.name!,
        description: formValue.description || undefined,
        color: formValue.color || '#fbbf24'
      };

      let savedTag: Tag;

      if (this.editingTag()) {
        savedTag = await this.apiService.updateTag(this.editingTag()!._id, tagData);
        
        // Update in list
        this.tags.update(tags => 
          tags.map(t => t._id === savedTag._id ? savedTag : t)
        );
      } else {
        savedTag = await this.apiService.createTag(tagData);
        
        // Add to list
        this.tags.update(tags => [savedTag, ...tags]);
        this.totalTags.update(count => count + 1);
      }

      this.closeModal();

    } catch (error) {
      console.error('Failed to save tag:', error);
    } finally {
      this.saving.set(false);
    }
  }

  // Selection Management
  toggleTagSelection(tagId: string) {
    this.selectedTags.update(selected => {
      if (selected.includes(tagId)) {
        return selected.filter(id => id !== tagId);
      } else {
        return [...selected, tagId];
      }
    });
  }

  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedTags.set([]);
    } else {
      const allIds = this.filteredTags().map(tag => tag._id);
      this.selectedTags.set(allIds);
    }
  }

  // Tag Actions
  async deleteTag(tagId: string) {
    const tag = this.tags().find(t => t._id === tagId);
    if (!tag) return;

    let confirmMessage = `Are you sure you want to delete the tag "${tag.name}"?`;
    if (tag.postCount > 0) {
      confirmMessage += ` This will remove the tag from ${tag.postCount} post(s).`;
    }
    confirmMessage += ' This action cannot be undone.';

    if (!confirm(confirmMessage)) return;

    try {
      this.deleting.update(deleting => [...deleting, tagId]);
      
      await this.apiService.deleteTag(tagId);
      
      // Remove from tags list
      this.tags.update(tags => tags.filter(t => t._id !== tagId));
      this.selectedTags.update(selected => selected.filter(id => id !== tagId));
      this.totalTags.update(count => count - 1);
      
    } catch (error) {
      console.error('Failed to delete tag:', error);
    } finally {
      this.deleting.update(deleting => deleting.filter(id => id !== tagId));
    }
  }

  viewTagPosts(tag: Tag) {
    window.open(`/tag/${tag.slug}`, '_blank');
  }

  // Bulk Actions
  bulkMerge() {
    if (this.selectedTags().length < 2) return;
    this.mergeTargetTagControl.setValue('');
    this.showMergeModal.set(true);
  }

  closeMergeModal() {
    this.showMergeModal.set(false);
    this.mergeTargetTagControl.setValue('');
  }

  getSelectedTagsForMerge(): Tag[] {
    return this.tags().filter(tag => this.selectedTags().includes(tag._id));
  }

  async executeMerge() {
    const mergeTargetTag = this.mergeTargetTagControl.value;
    if (!mergeTargetTag || this.selectedTags().length < 2) return;

    try {
      this.bulkActionLoading.set(true);
      
      // In a real implementation, you'd have a merge endpoint
      // For now, simulate the merge operation
      const sourceTagIds = this.selectedTags().filter(id => id !== mergeTargetTag);
      
      // Delete source tags (simulate merge)
      const deletePromises = sourceTagIds.map(id => this.apiService.deleteTag(id));
      await Promise.all(deletePromises);
      
      // Remove from tags list
      this.tags.update(tags => tags.filter(t => !sourceTagIds.includes(t._id)));
      this.totalTags.update(count => count - sourceTagIds.length);
      this.selectedTags.set([]);
      
      this.closeMergeModal();
      
    } catch (error) {
      console.error('Failed to merge tags:', error);
    } finally {
      this.bulkActionLoading.set(false);
    }
  }

  async bulkDelete() {
    const count = this.selectedTags().length;
    if (!confirm(`Delete ${count} selected tags? This action cannot be undone.`)) return;

    try {
      this.bulkActionLoading.set(true);
      
      const deletePromises = this.selectedTags().map(id => this.apiService.deleteTag(id));
      await Promise.all(deletePromises);
      
      // Remove from tags list
      const deletedIds = this.selectedTags();
      this.tags.update(tags => tags.filter(t => !deletedIds.includes(t._id)));
      this.totalTags.update(count => count - deletedIds.length);
      this.selectedTags.set([]);
      
    } catch (error) {
      console.error('Failed to bulk delete tags:', error);
    } finally {
      this.bulkActionLoading.set(false);
    }
  }

  // Filter Management
  clearSearch() {
    this.searchControl.setValue('');
  }

  clearUsageFilter() {
    this.usageControl.setValue('');
  }

  clearAllFilters() {
    this.searchControl.setValue('');
    this.usageControl.setValue('');
    this.sortControl.setValue('name');
  }

  // Helper Methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.tagForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  getUsageDisplayName(usage: string): string {
    switch (usage) {
      case 'popular': return 'Popular (10+ posts)';
      case 'moderate': return 'Moderate (3-9 posts)';
      case 'low': return 'Low usage (1-2 posts)';
      case 'unused': return 'Unused (0 posts)';
      default: return usage;
    }
  }

  getUsageBadgeClass(postCount: number): string {
    if (postCount >= 10) return 'bg-green-100 text-green-800';
    if (postCount >= 3) return 'bg-blue-100 text-blue-800';
    if (postCount >= 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Statistics
  getTotalTags(): number {
    return this.totalTags();
  }

  getPopularTags(): number {
    return this.tags().filter(tag => tag.postCount >= 10).length;
  }

  getUnusedTags(): number {
    return this.tags().filter(tag => tag.postCount === 0).length;
  }

  getAverageUsage(): string {
    const tags = this.tags();
    if (tags.length === 0) return '0';
    
    const totalUsage = tags.reduce((sum, tag) => sum + tag.postCount, 0);
    const average = totalUsage / tags.length;
    return average.toFixed(1);
  }
}
