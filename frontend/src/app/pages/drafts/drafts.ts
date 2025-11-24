import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';

import { RouterLink, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { Draft, DraftsResponse, Post } from '../../../types/api';

@Component({
  selector: 'app-drafts',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      <!-- Header -->
      <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
        <div class="text-center border-2 border-dotted border-amber-700 p-6">
          <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
            Draft Collection
          </div>
          
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-3">
            Your Work in Progress
          </h1>
          <p class="text-amber-700 text-lg font-mono">
            {{ totalDrafts() }} drafts • {{ autoSavedCount() }} auto-saved
          </p>
          
          <!-- Quick Actions -->
          <div class="flex items-center justify-center gap-4 mt-6">
            <a 
              routerLink="/write"
              class="inline-block bg-amber-800 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700"
            >
              New Article
            </a>
            
            @if (selectedDrafts().length > 0) {
              <button
                (click)="bulkDelete()"
                class="inline-block bg-red-600 text-red-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-red-700 transition-colors border-2 border-red-700"
              >
                Delete Selected ({{ selectedDrafts().length }})
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
                Search Drafts
              </label>
              <div class="relative">
                <input
                  [formControl]="searchControl"
                  type="text"
                  placeholder="Search by title or content..."
                  class="w-full px-4 py-3 pl-10 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
                />
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <!-- Type Filter -->
            <div>
              <label class="block text-amber-900 font-mono text-sm font-bold mb-2">
                Draft Type
              </label>
              <select 
                [formControl]="typeControl"
                class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
              >
                <option value="">All Drafts</option>
                <option value="manual">Manual Saves</option>
                <option value="auto">Auto-Saved</option>
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
                <option value="-updatedAt">Recently Modified</option>
                <option value="-createdAt">Recently Created</option>
                <option value="title">Title (A-Z)</option>
                <option value="-title">Title (Z-A)</option>
                <option value="version">Version Number</option>
              </select>
            </div>
          </div>

          <!-- Active Filters -->
          @if (hasActiveFilters()) {
            <div class="mt-6 pt-4 border-t-2 border-dotted border-amber-300">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-amber-700 font-mono text-sm font-bold">Filters:</span>
                
                @if (searchQuery()) {
                  <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                    Search: {{ searchQuery() }}
                    <button (click)="clearSearch()" class="hover:text-amber-900">×</button>
                  </span>
                }
                
                @if (typeFilter()) {
                  <span class="inline-flex items-center gap-1 bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono">
                    Type: {{ typeFilter() === 'auto' ? 'Auto-saved' : 'Manual' }}
                    <button (click)="clearTypeFilter()" class="hover:text-amber-900">×</button>
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

      <!-- Drafts List -->
      <section class="mb-12">
        @if (loading()) {
          <!-- Loading Skeleton -->
          <div class="space-y-4">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="bg-amber-50 border-2 border-amber-200 p-6 animate-pulse">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="h-6 bg-amber-200 rounded mb-2 w-3/4"></div>
                    <div class="h-4 bg-amber-200 rounded w-1/2"></div>
                  </div>
                  <div class="h-8 w-24 bg-amber-200 rounded"></div>
                </div>
                <div class="h-4 bg-amber-200 rounded mb-2"></div>
                <div class="h-4 bg-amber-200 rounded w-2/3"></div>
              </div>
            }
          </div>
        } @else if (filteredDrafts().length === 0) {
          <!-- Empty State -->
          <div class="text-center py-16">
            <div class="inline-block border-4 border-amber-300 p-12 bg-amber-100">
              @if (hasActiveFilters()) {
                <div class="text-amber-600 font-mono text-lg mb-4">📝 NO MATCHING DRAFTS</div>
                <p class="text-amber-700 mb-6">
                  No drafts match your current filters.
                </p>
                <button
                  (click)="clearAllFilters()"
                  class="bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors"
                >
                  Clear Filters
                </button>
              } @else {
                <div class="text-amber-600 font-mono text-lg mb-4">📝 NO DRAFTS YET</div>
                <p class="text-amber-700 mb-6">
                  Start writing to see your drafts appear here.
                </p>
                <a
                  routerLink="/write"
                  class="inline-block bg-amber-800 text-amber-100 px-8 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700"
                >
                  Write Your First Article
                </a>
              }
            </div>
          </div>
        } @else {
          <!-- Results Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="text-amber-700 font-mono text-sm">
              Showing {{ filteredDrafts().length }} of {{ totalDrafts() }} drafts
            </div>
            
            <!-- Bulk Actions -->
            <div class="flex items-center gap-4">
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

          <!-- Drafts Grid -->
          <div class="space-y-4">
            @for (draft of filteredDrafts(); track draft._id) {
              <article class="bg-amber-50 border-2 border-amber-200 hover:border-amber-400 transition-colors group">
                <div class="p-6">
                  <div class="flex items-start gap-4">
                    <!-- Selection Checkbox -->
                    <label class="flex items-center mt-2">
                      <input 
                        type="checkbox" 
                        [checked]="selectedDrafts().includes(draft._id)"
                        (change)="toggleDraftSelection(draft._id)"
                        class="text-amber-600 border-2 border-amber-300"
                      />
                    </label>

                    <!-- Draft Content -->
                    <div class="flex-1">
                      <div class="flex items-start justify-between mb-3">
                        <div>
                          <h3 class="font-serif text-xl font-bold text-amber-900 leading-tight mb-2">
                            {{ draft.title || 'Untitled Draft' }}
                          </h3>
                          
                          <!-- Draft Metadata -->
                          <div class="flex items-center gap-4 text-xs font-mono text-amber-600 mb-2">
                            <div class="flex items-center gap-1">
                              @if (draft.autoSave) {
                                <svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                </svg>
                                <span class="text-blue-600">Auto-saved</span>
                              } @else {
                                <svg class="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span class="text-green-600">Manual save</span>
                              }
                            </div>
                            
                            <span>Version {{ draft.version }}</span>
                            <span>{{ formatDate(draft.updatedAt) }}</span>
                            <span>{{ getWordCount(draft.content) }} words</span>
                            <span>{{ calculateReadingTime(draft.content) }} min read</span>
                          </div>

                          <!-- Excerpt/Content Preview -->
                          @if (draft.excerpt) {
                            <p class="text-amber-700 text-sm leading-relaxed mb-3 line-clamp-2">
                              {{ draft.excerpt }}
                            </p>
                          } @else if (draft.content) {
                            <p class="text-amber-700 text-sm leading-relaxed mb-3 line-clamp-2">
                              {{ getContentPreview(draft.content) }}
                            </p>
                          }

                          <!-- Tags -->
                          @if (getDraftTags(draft.tags).length > 0) {
                            <div class="flex flex-wrap gap-1 mb-3">
                              @for (tag of getDraftTags(draft.tags).slice(0, 3); track tag) {
                                <span class="inline-block bg-amber-200 text-amber-800 px-2 py-1 text-xs font-mono">
                                  {{ typeof tag === 'string' ? tag : tag.name }}
                                </span>
                              }
                              @if (getDraftTags(draft.tags).length > 3) {
                                <span class="text-amber-600 text-xs font-mono">
                                  +{{ getDraftTags(draft.tags).length - 3 }} more
                                </span>
                              }
                            </div>
                          }
                        </div>

                        <!-- Draft Status Badge -->
                        <div class="text-right">
                          @if (draft.autoSave) {
                            <div class="inline-block bg-blue-100 text-blue-800 px-3 py-1 text-xs font-mono uppercase mb-2">
                              Auto-saved
                            </div>
                          } @else {
                            <div class="inline-block bg-green-100 text-green-800 px-3 py-1 text-xs font-mono uppercase mb-2">
                              Draft
                            </div>
                          }
                        </div>
                      </div>

                      <!-- Action Buttons -->
                      <div class="flex items-center justify-between pt-3 border-t border-amber-200">
                        <div class="flex items-center gap-3">
                          <a 
                            [routerLink]="['/write/edit', draft._id]"
                            class="inline-flex items-center gap-2 bg-amber-800 text-amber-100 px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-amber-700 transition-colors"
                          >
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                            </svg>
                            Edit
                          </a>

                          @if (!draft.autoSave) {
                            <button
                              (click)="publishDraft(draft._id)"
                              [disabled]="publishing().includes(draft._id)"
                              class="inline-flex items-center gap-2 bg-green-600 text-green-100 px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              @if (publishing().includes(draft._id)) {
                                <div class="w-3 h-3 border border-green-100 border-t-transparent rounded-full animate-spin"></div>
                                Publishing...
                              } @else {
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path>
                                </svg>
                                Publish
                              }
                            </button>
                          }

                          <button
                            (click)="duplicateDraft(draft)"
                            class="inline-flex items-center gap-2 bg-amber-200 text-amber-800 px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors"
                          >
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                            </svg>
                            Duplicate
                          </button>
                        </div>

                        <button
                          (click)="deleteDraft(draft._id)"
                          [disabled]="deleting().includes(draft._id)"
                          class="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                          @if (deleting().includes(draft._id)) {
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
          <h3 class="font-serif text-xl font-bold mb-4 text-center">Draft Management Tips</h3>
          
          <div class="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 class="font-bold text-amber-200 mb-2">Auto-saved Drafts</h4>
              <ul class="space-y-1 text-amber-300">
                <li>• Automatically saved every 30 seconds while writing</li>
                <li>• Preserve your work if you accidentally close the browser</li>
                <li>• Convert to manual drafts to organize and publish</li>
              </ul>
            </div>
            
            <div>
              <h4 class="font-bold text-amber-200 mb-2">Draft Organization</h4>
              <ul class="space-y-1 text-amber-300">
                <li>• Use descriptive titles to easily find your drafts</li>
                <li>• Add excerpts and tags for better organization</li>
                <li>• Regularly clean up old auto-saved drafts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
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
export class DraftsComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Reactive Signals
  loading = signal(false);
  drafts = signal<Draft[]>([]);
  totalDrafts = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  
  selectedDrafts = signal<string[]>([]);
  publishing = signal<string[]>([]);
  deleting = signal<string[]>([]);

  // Form Controls
  searchControl = new FormControl('');
  typeControl = new FormControl('');
  sortControl = new FormControl('-updatedAt');

  // Filter states
  searchQuery = signal('');
  typeFilter = signal('');

  // Computed values
  filteredDrafts = computed(() => {
    let filtered = this.drafts();
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(draft => 
        draft.title.toLowerCase().includes(query) || 
        draft.content.toLowerCase().includes(query)
      );
    }
    
    if (this.typeFilter()) {
      filtered = filtered.filter(draft => 
        this.typeFilter() === 'auto' ? draft.autoSave : !draft.autoSave
      );
    }
    
    return filtered;
  });

  autoSavedCount = computed(() => 
    this.drafts().filter(draft => draft.autoSave).length
  );

  hasActiveFilters = computed(() => 
    !!(this.searchQuery() || this.typeFilter())
  );

  allSelected = computed(() => 
    this.filteredDrafts().length > 0 && 
    this.filteredDrafts().every(draft => this.selectedDrafts().includes(draft._id))
  );

  someSelected = computed(() => 
    this.selectedDrafts().length > 0 && 
    !this.allSelected()
  );

  async ngOnInit() {
    // Check authentication
    if (!this.apiService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/drafts' }
      });
      return;
    }

    await this.loadDrafts();
    this.setupFormSubscriptions();
  }

  private async loadDrafts() {
    try {
      this.loading.set(true);
      
      const response = await this.apiService.getDrafts();
      
      this.drafts.set(response.drafts || response.data || []);
      this.totalDrafts.set(response.totalDrafts || response.totalItems || 0);
      this.totalPages.set(response.totalPages || 1);
      
    } catch (error) {
      console.error('Failed to load drafts:', error);
      this.drafts.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private setupFormSubscriptions() {
    // Search with debounce
  const searchValueSignal: any = toSignal(this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()) as any, { initialValue: this.searchControl.value as any });
    effect(() => {
      const value = searchValueSignal();
      this.searchQuery.set(value || '');
    });

    // Type filter
  const typeSignal: any = toSignal(this.typeControl.valueChanges as any, { initialValue: this.typeControl.value as any });
    effect(() => {
      const value = typeSignal();
      this.typeFilter.set(value || '');
    });

    // Sort changes
  const sortSignal: any = toSignal(this.sortControl.valueChanges as any, { initialValue: this.sortControl.value as any });
    effect(() => {
      sortSignal();
      this.sortDrafts();
    });
  }

  private sortDrafts() {
    const sortBy = this.sortControl.value || '-updatedAt';
    const [direction, field] = sortBy.startsWith('-') 
      ? ['desc', sortBy.slice(1)] 
      : ['asc', sortBy];

    this.drafts.update(drafts => [...drafts].sort((a, b) => {
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
        case 'version':
          aVal = a.version;
          bVal = b.version;
          break;
        default:
          return 0;
      }
      
      if (direction === 'desc') {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    }));
  }

  // Selection Management
  toggleDraftSelection(draftId: string) {
    this.selectedDrafts.update(selected => {
      if (selected.includes(draftId)) {
        return selected.filter(id => id !== draftId);
      } else {
        return [...selected, draftId];
      }
    });
  }

  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedDrafts.set([]);
    } else {
      const allIds = this.filteredDrafts().map(draft => draft._id);
      this.selectedDrafts.set(allIds);
    }
  }

  // Draft Actions
  async publishDraft(draftId: string) {
    try {
      this.publishing.update(publishing => [...publishing, draftId]);
      
      const result = await this.apiService.publishDraft(draftId);
      
      // Remove from drafts list
      this.drafts.update(drafts => drafts.filter(d => d._id !== draftId));
      this.totalDrafts.update(count => count - 1);
      
      // Navigate to published post
      this.router.navigate(['/post', result.post.slug]);
      
    } catch (error) {
      console.error('Failed to publish draft:', error);
    } finally {
      this.publishing.update(publishing => publishing.filter(id => id !== draftId));
    }
  }

  async deleteDraft(draftId: string) {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }
    
    try {
      this.deleting.update(deleting => [...deleting, draftId]);
      
      await this.apiService.deleteDraft(draftId);
      
      // Remove from drafts list and selection
      this.drafts.update(drafts => drafts.filter(d => d._id !== draftId));
      this.selectedDrafts.update(selected => selected.filter(id => id !== draftId));
      this.totalDrafts.update(count => count - 1);
      
    } catch (error) {
      console.error('Failed to delete draft:', error);
    } finally {
      this.deleting.update(deleting => deleting.filter(id => id !== draftId));
    }
  }

  async bulkDelete() {
    const count = this.selectedDrafts().length;
    if (!confirm(`Are you sure you want to delete ${count} draft(s)? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const deletePromises = this.selectedDrafts().map(id => this.apiService.deleteDraft(id));
      await Promise.all(deletePromises);
      
      // Remove deleted drafts from list
      const deletedIds = this.selectedDrafts();
      this.drafts.update(drafts => drafts.filter(d => !deletedIds.includes(d._id)));
      this.totalDrafts.update(count => count - deletedIds.length);
      this.selectedDrafts.set([]);
      
    } catch (error) {
      console.error('Failed to delete drafts:', error);
    }
  }

  async duplicateDraft(draft: Draft) {
    try {
      const duplicateData = {
        title: `${draft.title} (Copy)`,
        content: draft.content,
        excerpt: draft.excerpt,
        coverImage: draft.coverImage,
        tags: Array.isArray(draft.tags) ? draft.tags.map(tag => 
          typeof tag === 'string' ? tag : tag.name
        ) : [],
        autoSave: false
      };
      
      const newDraft = await this.apiService.createDraft(duplicateData);
      
      // Add to drafts list
      this.drafts.update(drafts => [newDraft, ...drafts]);
      this.totalDrafts.update(count => count + 1);
      
    } catch (error) {
      console.error('Failed to duplicate draft:', error);
    }
  }

  // Filter Management
  clearSearch() {
    this.searchControl.setValue('');
  }

  clearTypeFilter() {
    this.typeControl.setValue('');
  }

  clearAllFilters() {
    this.searchControl.setValue('');
    this.typeControl.setValue('');
    this.sortControl.setValue('-updatedAt');
  }

  // Pagination
  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    
    this.currentPage.set(page);
    await this.loadDrafts();
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
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  getWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  calculateReadingTime(content: string): number {
    return Math.ceil(this.getWordCount(content) / 200);
  }

  getContentPreview(content: string): string {
    return content.replace(/[#*>`\-]/g, '').slice(0, 150) + '...';
  }

  getDraftTags(tags: string[] | any[]): any[] {
    return Array.isArray(tags) ? tags : [];
  }
}
