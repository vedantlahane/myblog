import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';

import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { Collection, CollectionsResponse, CreateCollectionRequest, UpdateCollectionRequest, CollectionQueryParams } from '../../../types/api';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      <!-- Header -->
      <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
        <div class="text-center border-2 border-dotted border-amber-700 p-6">
          <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
            My Collections
          </div>
          
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-3">
            Article Collections
          </h1>
          <p class="text-amber-700 text-lg font-mono">
            {{ totalCollections() }} collections • {{ getTotalPosts() }} articles organized
          </p>
          
          <!-- Quick Actions -->
          <div class="flex items-center justify-center gap-4 mt-6">
            <button
              (click)="showCreateModal()"
              class="inline-block bg-amber-800 text-amber-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700"
            >
              Create Collection
            </button>
            
            @if (selectedCollections().length > 0) {
              <button
                (click)="bulkDelete()"
                class="inline-block bg-red-600 text-red-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-red-700 transition-colors border-2 border-red-700"
              >
                Delete Selected ({{ selectedCollections().length }})
              </button>
            }
          </div>
        </div>
      </header>

      <!-- Filters & Search -->
      <section class="mb-8">
        <div class="bg-amber-50 border-4 border-amber-300 p-6">
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Search -->
            <div>
              <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                Search Collections
              </label>
              <div class="relative">
                <input
                  [formControl]="searchControl"
                  type="text"
                  placeholder="Search by title or description..."
                  class="w-full px-4 py-3 pl-10 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
                />
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <!-- Visibility Filter -->
            <div>
              <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                Visibility
              </label>
              <select 
                [formControl]="visibilityControl"
                class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              >
                <option value="">All Collections</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
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
                <option value="-updatedAt">Recently Updated</option>
                <option value="-createdAt">Recently Created</option>
                <option value="title">Title (A-Z)</option>
                <option value="-title">Title (Z-A)</option>
                <option value="-posts.length">Most Articles</option>
                <option value="posts.length">Least Articles</option>
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
                
                @if (visibilityFilter()) {
                  <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                    Visibility: {{ visibilityFilter() === 'public' ? 'Public' : 'Private' }}
                    <button (click)="clearVisibilityFilter()" class="hover:text-amber-900">×</button>
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
        </div>
      </section>

      <!-- Collections Grid -->
      <section class="mb-12">
        @if (loading()) {
          <!-- Loading Skeleton -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="bg-amber-50 border-2 border-amber-200 p-6 animate-pulse">
                <div class="h-32 bg-amber-200 rounded mb-4"></div>
                <div class="h-6 bg-amber-200 rounded mb-2"></div>
                <div class="h-4 bg-amber-200 rounded mb-2"></div>
                <div class="h-4 bg-amber-200 rounded w-2/3"></div>
              </div>
            }
          </div>
        } @else if (filteredCollections().length === 0) {
          <!-- Empty State -->
          <div class="text-center py-16">
            <div class="inline-block border-4 border-amber-300 p-12 bg-amber-100">
              @if (hasActiveFilters()) {
                <div class="text-amber-600 font-mono text-lg mb-4">🔍 NO MATCHING COLLECTIONS</div>
                <p class="text-amber-700 mb-6">
                  No collections match your current filters.
                </p>
                <button
                  (click)="clearAllFilters()"
                  class="bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors"
                >
                  Clear Filters
                </button>
              } @else {
                <div class="text-amber-600 font-mono text-lg mb-4">📚 NO COLLECTIONS YET</div>
                <p class="text-amber-700 mb-6">
                  Start organizing your articles by creating your first collection.
                </p>
                <button
                  (click)="showCreateModal()"
                  class="inline-block bg-amber-800 text-amber-100 px-8 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700"
                >
                  Create Your First Collection
                </button>
              }
            </div>
          </div>
        } @else {
          <!-- Results Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="text-amber-700 font-mono text-sm">
              Showing {{ filteredCollections().length }} of {{ totalCollections() }} collections
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

          <!-- Collections Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (collection of filteredCollections(); track collection._id) {
              <article class="bg-amber-50 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 group">
                <!-- Cover Image or Placeholder -->
                @if (collection.coverImage) {
                  <img 
                    [src]="collection.coverImage" 
                    [alt]="collection.title"
                    class="w-full h-48 object-cover border-b-2 border-amber-200 group-hover:sepia-[20%] transition-all"
                  >
                } @else {
                  <div class="w-full h-48 bg-amber-200 border-b-2 border-amber-300 flex items-center justify-center">
                    <div class="text-center">
                      <svg class="w-12 h-12 text-amber-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                      </svg>
                      <span class="text-amber-700 font-mono text-sm">{{ collection.posts.length || 0 }} Articles</span>
                    </div>
                  </div>
                }
                
                <div class="p-6">
                  <!-- Selection & Status -->
                  <div class="flex items-start justify-between mb-3">
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="selectedCollections().includes(collection._id)"
                        (change)="toggleCollectionSelection(collection._id)"
                        class="text-amber-600 border-2 border-amber-300 mr-3"
                      />
                    </label>
                    
                    <div class="flex gap-2">
                      @if (collection.isPublic) {
                        <div class="inline-block bg-green-100 text-green-800 px-2 py-1 text-xs font-mono uppercase">
                          Public
                        </div>
                      } @else {
                        <div class="inline-block bg-amber-200 text-amber-800 px-2 py-1 text-xs font-mono uppercase">
                          Private
                        </div>
                      }
                      
                      @if (collection.isComplete) {
                        <div class="inline-block bg-blue-100 text-blue-800 px-2 py-1 text-xs font-mono uppercase">
                          Complete
                        </div>
                      }
                    </div>
                  </div>

                  <h3 class="font-serif text-xl font-bold text-amber-900 mb-3 leading-tight">
                    <a 
                      [routerLink]="['/collection', collection.slug]"
                      class="hover:text-amber-700 transition-colors"
                    >
                      {{ collection.title }}
                    </a>
                  </h3>
                  
                  @if (collection.description) {
                    <p class="text-amber-700 text-sm mb-4 leading-relaxed line-clamp-3">
                      {{ collection.description }}
                    </p>
                  }
                  
                  <!-- Collection Stats -->
                  <div class="flex items-center justify-between text-xs font-mono text-amber-600 mb-4">
                    <div class="flex items-center gap-3">
                      <span>{{ collection.posts.length || 0 }} articles</span>
                      <span>•</span>
                      <span>Updated {{ formatDate(collection.updatedAt) }}</span>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-between pt-3 border-t border-amber-200">
                    <div class="flex items-center gap-2">
                      <a 
                        [routerLink]="['/collection', collection.slug]"
                        class="inline-flex items-center gap-1 bg-amber-800 text-amber-100 px-3 py-2 font-mono text-xs uppercase tracking-wider hover:bg-amber-700 transition-colors"
                      >
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                        </svg>
                        View
                      </a>

                      <button
                        (click)="editCollection(collection)"
                        class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-2 font-mono text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors"
                      >
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                        </svg>
                        Edit
                      </button>
                    </div>

                    <button
                      (click)="deleteCollection(collection._id)"
                      [disabled]="deleting().includes(collection._id)"
                      class="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      @if (deleting().includes(collection._id)) {
                        <div class="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      } @else {
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                        </svg>
                        Delete
                      }
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="mt-12 flex justify-center">
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
        }
      </section>

      <!-- Tips Section -->
      <section class="mb-12">
        <div class="bg-amber-900 text-amber-100 border-4 border-amber-700 p-6">
          <h3 class="font-serif text-xl font-bold mb-4 text-center">Collection Tips</h3>
          
          <div class="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 class="font-bold text-amber-200 mb-2">Organization</h4>
              <ul class="space-y-1 text-amber-300">
                <li>• Group related articles by theme or topic</li>
                <li>• Use descriptive titles and descriptions</li>
                <li>• Set collections as public to share with others</li>
              </ul>
            </div>
            
            <div>
              <h4 class="font-bold text-amber-200 mb-2">Best Practices</h4>
              <ul class="space-y-1 text-amber-300">
                <li>• Add cover images to make collections visually appealing</li>
                <li>• Mark collections as complete when finished</li>
                <li>• Regularly update and curate your collections</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModal()">
        <div class="bg-amber-50 border-4 border-amber-800 p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">
            {{ editingCollection() ? 'Edit Collection' : 'Create New Collection' }}
          </h3>
          
          <form [formGroup]="collectionForm" (ngSubmit)="saveCollection()">
            <div class="space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Title</label>
                <input
                  type="text"
                  formControlName="title"
                  placeholder="Enter collection title..."
                  class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white"
                  [class.border-red-400]="isFieldInvalid('title')"
                />
                @if (isFieldInvalid('title')) {
                  <p class="mt-1 text-red-600 text-xs font-mono">Title is required</p>
                }
              </div>
              
              <!-- Description -->
              <div>
                <label class="block text-amber-900 font-mono text-sm font-bold mb-2">Description</label>
                <textarea
                  formControlName="description"
                  rows="3"
                  placeholder="Describe what this collection is about..."
                  class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white resize-none"
                  [class.border-red-400]="isFieldInvalid('description')"
                ></textarea>
                @if (isFieldInvalid('description')) {
                  <p class="mt-1 text-red-600 text-xs font-mono">Description is required</p>
                }
              </div>
              
              <!-- Settings -->
              <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    formControlName="isPublic"
                    class="text-amber-600 border-2 border-amber-300 mr-2"
                  />
                  <span class="text-amber-800 font-mono text-sm">Make Public</span>
                </label>
                
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    formControlName="isComplete"
                    class="text-amber-600 border-2 border-amber-300 mr-2"
                  />
                  <span class="text-amber-800 font-mono text-sm">Mark Complete</span>
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
                [disabled]="collectionForm.invalid || saving()"
                class="bg-amber-800 text-amber-100 px-4 py-2 font-mono text-sm hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {{ saving() ? 'Saving...' : (editingCollection() ? 'Update Collection' : 'Create Collection') }}
              </button>
            </div>
          </form>
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

    /* Vintage paper texture */
    article {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }
  `]
})
export class CollectionsComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Reactive Signals
  loading = signal(false);
  saving = signal(false);
  collections = signal<Collection[]>([]);
  totalCollections = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  
  selectedCollections = signal<string[]>([]);
  deleting = signal<string[]>([]);
  
  showModal = signal(false);
  editingCollection = signal<Collection | null>(null);

  // Form Controls
  searchControl = new FormControl('');
  visibilityControl = new FormControl('');
  sortControl = new FormControl('-updatedAt');

  // Filter states
  searchQuery = signal('');
  visibilityFilter = signal('');

  // Collection Form
  collectionForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    isPublic: new FormControl(false),
    isComplete: new FormControl(false)
  });

  // Computed values
  filteredCollections = computed(() => {
    let filtered = this.collections();
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(collection => 
        collection.title.toLowerCase().includes(query) || 
        collection.description.toLowerCase().includes(query)
      );
    }
    
    if (this.visibilityFilter()) {
      const isPublic = this.visibilityFilter() === 'public';
      filtered = filtered.filter(collection => collection.isPublic === isPublic);
    }
    
    return this.sortCollections(filtered);
  });

  hasActiveFilters = computed(() => 
    !!(this.searchQuery() || this.visibilityFilter())
  );

  allSelected = computed(() => 
    this.filteredCollections().length > 0 && 
    this.filteredCollections().every(collection => this.selectedCollections().includes(collection._id))
  );

  someSelected = computed(() => 
    this.selectedCollections().length > 0 && 
    !this.allSelected()
  );

  async ngOnInit() {
    // Check authentication
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/collections' }
      });
      return;
    }

    await this.loadCollections();
    this.setupFormSubscriptions();
  }

  private async loadCollections() {
    try {
      this.loading.set(true);
      
      const response = await this.apiService.getCollections({
        page: this.currentPage(),
        limit: 20
      });
      
      this.collections.set(response.collections || response.data || []);
      this.totalCollections.set(response.totalCollections || response.totalItems || 0);
      this.totalPages.set(response.totalPages || 1);
      
    } catch (error) {
      console.error('Failed to load collections:', error);
      this.collections.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private setupFormSubscriptions() {
    // Search with debounce
    const searchSignal: any = toSignal(this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()) as any, { initialValue: this.searchControl.value as any });
    effect(() => {
      const value = searchSignal();
      this.searchQuery.set(value || '');
    });

    // Visibility filter
    const visibilitySignal: any = toSignal(this.visibilityControl.valueChanges as any, { initialValue: this.visibilityControl.value as any });
    effect(() => {
      const value = visibilitySignal();
      this.visibilityFilter.set(value || '');
    });

    // Sort changes
    const sortSignal: any = toSignal(this.sortControl.valueChanges as any, { initialValue: this.sortControl.value as any });
    effect(() => {
      sortSignal();
      // Trigger recomputation
      this.collections.set([...this.collections()]);
    });
  }

  private sortCollections(collections: Collection[]): Collection[] {
    const sortBy = this.sortControl.value || '-updatedAt';
    const [direction, field] = sortBy.startsWith('-') 
      ? ['desc', sortBy.slice(1)] 
      : ['asc', sortBy];

    return [...collections].sort((a, b) => {
      let aVal, bVal;
      
      switch (field) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'updatedAt':
        case 'createdAt':
          aVal = new Date(a[field]).getTime();
          bVal = new Date(b[field]).getTime();
          break;
        case 'posts.length':
          aVal = a.posts?.length || 0;
          bVal = b.posts?.length || 0;
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
  showCreateModal() {
    this.editingCollection.set(null);
    this.collectionForm.reset({
      title: '',
      description: '',
      isPublic: false,
      isComplete: false
    });
    this.showModal.set(true);
  }

  editCollection(collection: Collection) {
    this.editingCollection.set(collection);
    this.collectionForm.patchValue({
      title: collection.title,
      description: collection.description,
      isPublic: collection.isPublic,
      isComplete: collection.isComplete
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCollection.set(null);
    this.collectionForm.reset();
  }

  async saveCollection() {
    if (this.collectionForm.invalid) return;

    try {
      this.saving.set(true);

      const formValue = this.collectionForm.value;
      const collectionData = {
        title: formValue.title!,
        description: formValue.description!,
        isPublic: formValue.isPublic || false,
        isComplete: formValue.isComplete || false
      };

      let savedCollection: Collection;

      if (this.editingCollection()) {
        savedCollection = await this.apiService.updateCollection(
          this.editingCollection()!._id, 
          collectionData
        );
        
        // Update in list
        this.collections.update(collections => 
          collections.map(c => c._id === savedCollection._id ? savedCollection : c)
        );
      } else {
        savedCollection = await this.apiService.createCollection(collectionData);
        
        // Add to list
        this.collections.update(collections => [savedCollection, ...collections]);
        this.totalCollections.update(count => count + 1);
      }

      this.closeModal();

    } catch (error) {
      console.error('Failed to save collection:', error);
    } finally {
      this.saving.set(false);
    }
  }

  // Collection Actions
  async deleteCollection(collectionId: string) {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      this.deleting.update(deleting => [...deleting, collectionId]);
      
      await this.apiService.deleteCollection(collectionId);
      
      // Remove from collections list
      this.collections.update(collections => collections.filter(c => c._id !== collectionId));
      this.selectedCollections.update(selected => selected.filter(id => id !== collectionId));
      this.totalCollections.update(count => count - 1);
      
    } catch (error) {
      console.error('Failed to delete collection:', error);
    } finally {
      this.deleting.update(deleting => deleting.filter(id => id !== collectionId));
    }
  }

  async bulkDelete() {
    const count = this.selectedCollections().length;
    if (!confirm(`Are you sure you want to delete ${count} collection(s)? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const deletePromises = this.selectedCollections().map(id => this.apiService.deleteCollection(id));
      await Promise.all(deletePromises);
      
      // Remove from collections list
      const deletedIds = this.selectedCollections();
      this.collections.update(collections => collections.filter(c => !deletedIds.includes(c._id)));
      this.totalCollections.update(count => count - deletedIds.length);
      this.selectedCollections.set([]);
      
    } catch (error) {
      console.error('Failed to delete collections:', error);
    }
  }

  // Selection Management
  toggleCollectionSelection(collectionId: string) {
    this.selectedCollections.update(selected => {
      if (selected.includes(collectionId)) {
        return selected.filter(id => id !== collectionId);
      } else {
        return [...selected, collectionId];
      }
    });
  }

  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedCollections.set([]);
    } else {
      const allIds = this.filteredCollections().map(collection => collection._id);
      this.selectedCollections.set(allIds);
    }
  }

  // Filter Management
  clearSearch() {
    this.searchControl.setValue('');
  }

  clearVisibilityFilter() {
    this.visibilityControl.setValue('');
  }

  clearAllFilters() {
    this.searchControl.setValue('');
    this.visibilityControl.setValue('');
    this.sortControl.setValue('-updatedAt');
  }

  // Pagination
  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    
    this.currentPage.set(page);
    await this.loadCollections();
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
    const field = this.collectionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  getTotalPosts(): number {
    return this.collections().reduce((total, collection) => total + (collection.posts?.length || 0), 0);
  }
}
