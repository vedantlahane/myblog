import { Component, OnInit, inject, signal, computed } from '@angular/core';
import {  } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '../../services/api.service';
import { Collection, Post, CollectionPost, ReorderCollectionPostsRequest, AddPostToCollectionRequest } from '../../../types/api';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [, RouterLink, ReactiveFormsModule, DragDropModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      @if (loading()) {
        <div class="flex justify-center items-center py-16">
          <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-lg">
            <div class="w-8 h-8 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
            Loading collection...
          </div>
        </div>
      } @else if (error()) {
        <div class="text-center py-16">
          <div class="inline-block border-4 border-red-300 p-8 bg-red-50">
            <div class="text-red-600 font-mono text-sm mb-2">COLLECTION NOT FOUND</div>
            <p class="text-red-700 mb-4">{{ error() }}</p>
            <a routerLink="/collections" class="inline-block bg-amber-600 text-amber-100 px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-amber-500 transition-colors">
              Back to Collections
            </a>
          </div>
        </div>
      } @else if (collection()) {
        <!-- Collection Header -->
        <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
          <div class="max-w-6xl mx-auto">
            <!-- Breadcrumb -->
            <nav class="mb-6">
              <div class="flex items-center gap-2 text-sm font-mono text-amber-600">
                <a routerLink="/collections" class="hover:text-amber-800 transition-colors">My Collections</a>
                <span>•</span>
                <span class="text-amber-800">{{ collection()?.title }}</span>
              </div>
            </nav>

            <div class="grid lg:grid-cols-3 gap-8">
              <!-- Cover Image -->
              <div class="lg:col-span-1">
                @if (collection()?.coverImage) {
                  <img 
                    [src]="collection()?.coverImage" 
                    [alt]="collection()?.title"
                    class="w-full h-64 object-cover border-4 border-amber-600 shadow-lg"
                  >
                } @else {
                  <div class="w-full h-64 bg-amber-200 border-4 border-amber-600 flex items-center justify-center shadow-lg">
                    <div class="text-center">
                      <svg class="w-16 h-16 text-amber-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                      </svg>
                      <span class="text-amber-700 font-mono text-lg">{{ getPostsCount() }} Articles</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Collection Info -->
              <div class="lg:col-span-2">
                <div class="border-2 border-dotted border-amber-700 p-6">
                  <!-- Status Badges -->
                  <div class="flex items-center gap-3 mb-4">
                    @if (collection()?.isPublic) {
                      <div class="inline-block bg-green-100 text-green-800 px-3 py-1 text-xs font-mono uppercase">
                        Public Collection
                      </div>
                    } @else {
                      <div class="inline-block bg-amber-200 text-amber-800 px-3 py-1 text-xs font-mono uppercase">
                        Private Collection
                      </div>
                    }
                    
                    @if (collection()?.isComplete) {
                      <div class="inline-block bg-blue-100 text-blue-800 px-3 py-1 text-xs font-mono uppercase">
                        Complete
                      </div>
                    } @else {
                      <div class="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-mono uppercase">
                        In Progress
                      </div>
                    }
                  </div>

                  <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-4 leading-tight">
                    {{ collection()?.title }}
                  </h1>
                  
                  <p class="text-amber-800 text-lg leading-relaxed mb-6">
                    {{ collection()?.description }}
                  </p>

                  <!-- Collection Stats -->
                  <div class="flex items-center gap-8 text-sm font-mono text-amber-600 mb-6">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-amber-900">{{ getPostsCount() }}</div>
                      <div>Articles</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-amber-900">{{ getTotalReadingTime() }}</div>
                      <div>Min Read</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-amber-900">{{ formatDate(collection()?.updatedAt || '') }}</div>
                      <div>Updated</div>
                    </div>
                  </div>

                  <!-- Author Info -->
                  <div class="flex items-center gap-3 mb-6">
                    <span class="text-amber-700 font-mono text-sm">Curated by:</span>
                    <div class="flex items-center gap-2">
                      @if (getAuthor()?.avatarUrl) {
                        <img 
                          [src]="getAuthor()?.avatarUrl" 
                          [alt]="getAuthor()?.name"
                          class="w-8 h-8 rounded-full border-2 border-amber-400"
                        >
                      } @else {
                        <div class="w-8 h-8 bg-amber-200 border-2 border-amber-400 rounded-full flex items-center justify-center font-bold text-amber-800 text-sm">
                          {{ getAuthorInitials() }}
                        </div>
                      }
                      <span class="font-bold text-amber-900">{{ getAuthor()?.name || 'Anonymous' }}</span>
                    </div>
                  </div>

                  <!-- Actions -->
                  @if (isOwner()) {
                    <div class="flex items-center gap-4">
                      <button
                        (click)="showAddPostModal()"
                        class="bg-amber-800 text-amber-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700"
                      >
                        Add Articles
                      </button>
                      
                      <a
                        [routerLink]="['/collections']"
                        class="bg-amber-200 text-amber-800 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400"
                      >
                        Edit Collection
                      </a>
                      
                      <button
                        (click)="toggleReorderMode()"
                        [class]="getReorderButtonClass()"
                      >
                        {{ reorderMode() ? 'Save Order' : 'Reorder Articles' }}
                      </button>
                    </div>
                  } @else {
                    <div class="flex items-center gap-4">
                      <button
                        (click)="toggleFollow()"
                        [disabled]="followLoading()"
                        class="bg-blue-100 text-blue-800 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-blue-200 transition-colors border-2 border-blue-300 disabled:opacity-50"
                      >
                        {{ isFollowing() ? 'Following' : 'Follow' }}
                      </button>
                      
                      <button
                        (click)="shareCollection()"
                        class="bg-amber-200 text-amber-800 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400"
                      >
                        Share Collection
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Collection Articles -->
        <section class="max-w-6xl mx-auto px-4 mb-12">
          @if (reorderMode()) {
            <!-- Reorder Mode Header -->
            <div class="bg-blue-100 border-4 border-blue-400 p-4 mb-8">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-serif text-lg font-bold text-blue-900 mb-1">Reorder Mode</h3>
                  <p class="text-blue-700 text-sm font-mono">Drag and drop articles to change their order</p>
                </div>
                <div class="flex gap-3">
                  <button
                    (click)="cancelReorder()"
                    class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    (click)="saveOrder()"
                    [disabled]="savingOrder()"
                    class="bg-blue-600 text-blue-100 px-4 py-2 font-mono text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {{ savingOrder() ? 'Saving...' : 'Save Order' }}
                  </button>
                </div>
              </div>
            </div>
          }

          @if (sortedPosts().length === 0) {
            <!-- Empty Collection -->
            <div class="text-center py-16">
              <div class="inline-block border-4 border-amber-300 p-12 bg-amber-100">
                <div class="text-amber-600 font-mono text-lg mb-4">📝 NO ARTICLES YET</div>
                <p class="text-amber-700 mb-6">
                  This collection is empty. 
                  @if (isOwner()) {
                    Start adding articles to build your curated collection.
                  } @else {
                    Check back later for new content.
                  }
                </p>
                @if (isOwner()) {
                  <button
                    (click)="showAddPostModal()"
                    class="inline-block bg-amber-800 text-amber-100 px-8 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700"
                  >
                    Add First Article
                  </button>
                }
              </div>
            </div>
          } @else {
            <!-- Articles List -->
            <div 
              cdkDropList 
              [cdkDropListDisabled]="!reorderMode()"
              (cdkDropListDropped)="onDrop($event)"
              class="space-y-6"
            >
              @for (collectionPost of sortedPosts(); track collectionPost.post; let index = $index) {
                <article 
                  cdkDrag
                  [cdkDragDisabled]="!reorderMode()"
                  class="bg-amber-50 border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 group"
                  [class.cursor-move]="reorderMode()"
                  [class.shadow-lg]="reorderMode()"
                >
                  <div class="flex items-start gap-6 p-6">
                    <!-- Order Number & Drag Handle -->
                    <div class="flex items-center gap-3">
                      @if (reorderMode()) {
                        <div class="flex flex-col items-center text-blue-600">
                          <svg class="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                          </svg>
                          <span class="text-xs font-mono">{{ index + 1 }}</span>
                        </div>
                      } @else {
                        <div class="w-12 h-12 bg-amber-200 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-800">
                          {{ index + 1 }}
                        </div>
                      }
                    </div>

                    <!-- Article Content -->
                    <div class="flex-1">
                      <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                          <h3 class="font-serif text-xl font-bold text-amber-900 leading-tight mb-2">
                            <a 
                              [routerLink]="['/post', getPostSlug(collectionPost.post)]"
                              class="hover:text-amber-700 transition-colors"
                            >
                              {{ getPostTitle(collectionPost.post) }}
                            </a>
                          </h3>
                          
                          @if (getPostExcerpt(collectionPost.post)) {
                            <p class="text-amber-700 text-sm leading-relaxed mb-4 line-clamp-2">
                              {{ getPostExcerpt(collectionPost.post) }}
                            </p>
                          }

                          <!-- Post Meta -->
                          <div class="flex items-center gap-4 text-xs font-mono text-amber-600">
                            <span>{{ getPostAuthor(collectionPost.post) }}</span>
                            <span>•</span>
                            <span>{{ formatDate(getPostDate(collectionPost.post)) }}</span>
                            <span>•</span>
                            <span>{{ getPostReadingTime(collectionPost.post) }} min read</span>
                            <span>•</span>
                            <div class="flex items-center gap-1">
                              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                              </svg>
                              <span>{{ getPostLikes(collectionPost.post) }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-2 ml-4">
                          <a 
                            [routerLink]="['/post', getPostSlug(collectionPost.post)]"
                            class="bg-amber-200 text-amber-800 px-3 py-2 font-mono text-xs uppercase hover:bg-amber-300 transition-colors"
                          >
                            Read
                          </a>
                          
                          @if (isOwner() && !reorderMode()) {
                            <button
                              (click)="removePost(collectionPost.post)"
                              [disabled]="removing().includes(getPostId(collectionPost.post))"
                              class="text-red-600 hover:text-red-800 px-3 py-2 font-mono text-xs uppercase transition-colors disabled:opacity-50"
                            >
                              {{ removing().includes(getPostId(collectionPost.post)) ? 'Removing...' : 'Remove' }}
                            </button>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Cover Image -->
                    @if (getPostCoverImage(collectionPost.post)) {
                      <div class="w-32 h-24 flex-shrink-0">
                        <img 
                          [src]="getPostCoverImage(collectionPost.post)" 
                          [alt]="getPostTitle(collectionPost.post)"
                          class="w-full h-full object-cover border-2 border-amber-300 group-hover:sepia-[20%] transition-all"
                        >
                      </div>
                    }
                  </div>
                </article>
              }
            </div>
          }
        </section>

        <!-- Related Collections -->
        @if (relatedCollections().length > 0) {
          <section class="max-w-6xl mx-auto px-4 mb-12">
            <div class="bg-amber-100 border-4 border-amber-800 p-6">
              <h3 class="font-serif text-xl font-bold text-amber-900 mb-4 text-center">Related Collections</h3>
              
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (related of relatedCollections(); track related._id) {
                  <div class="bg-amber-50 border-2 border-amber-200 p-4 hover:border-amber-400 transition-colors">
                    <h4 class="font-serif font-bold text-amber-900 mb-2">
                      <a [routerLink]="['/collection', related.slug]" class="hover:text-amber-700">
                        {{ related.title }}
                      </a>
                    </h4>
                    
                    <p class="text-amber-700 text-sm mb-3 line-clamp-2">
                      {{ related.description }}
                    </p>
                    
                    <div class="text-xs font-mono text-amber-600">
                      {{ related.posts?.length || 0 }} articles
                    </div>
                  </div>
                }
              </div>
            </div>
          </section>
        }
      }
    </div>

    <!-- Add Posts Modal -->
    @if (showAddModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeAddModal()">
        <div class="bg-amber-50 border-4 border-amber-800 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h3 class="font-serif text-xl font-bold text-amber-900 mb-4">Add Articles to Collection</h3>
          
          <!-- Search Posts -->
          <div class="mb-4">
            <input
              [formControl]="searchPostsControl"
              type="text"
              placeholder="Search your articles..."
              class="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-600 focus:outline-none bg-white font-mono text-sm"
            />
          </div>

          <!-- Available Posts -->
          @if (loadingPosts()) {
            <div class="text-center py-8">
              <div class="inline-flex items-center gap-3 text-amber-700 font-mono text-sm">
                <div class="w-5 h-5 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                Loading articles...
              </div>
            </div>
          } @else if (availablePosts().length === 0) {
            <div class="text-center py-8">
              <p class="text-amber-700">No articles available to add.</p>
            </div>
          } @else {
            <div class="max-h-60 overflow-y-auto space-y-2 mb-4">
              @for (post of availablePosts(); track post._id) {
                <div class="flex items-center justify-between p-3 bg-amber-100 border border-amber-300">
                  <div class="flex-1">
                    <h4 class="font-bold text-amber-900 text-sm">{{ post.title }}</h4>
                    <p class="text-amber-700 text-xs">{{ formatDate(post.publishedAt || post.createdAt) }}</p>
                  </div>
                  <button
                    (click)="addPostToCollection(post._id)"
                    [disabled]="addingPosts().includes(post._id)"
                    class="bg-amber-800 text-amber-100 px-3 py-1 font-mono text-xs hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    {{ addingPosts().includes(post._id) ? 'Adding...' : 'Add' }}
                  </button>
                </div>
              }
            </div>
          }
          
          <div class="flex justify-end">
            <button
              (click)="closeAddModal()"
              class="bg-amber-200 text-amber-800 px-4 py-2 font-mono text-sm hover:bg-amber-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Vintage paper texture */
    article {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Drag and drop styles */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class CollectionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Reactive Signals
  loading = signal(false);
  loadingPosts = signal(false);
  savingOrder = signal(false);
  followLoading = signal(false);
  error = signal('');
  
  collection = signal<Collection | null>(null);
  collectionPosts = signal<CollectionPost[]>([]);
  availablePosts = signal<Post[]>([]);
  relatedCollections = signal<Collection[]>([]);
  
  reorderMode = signal(false);
  showAddModal = signal(false);
  isFollowing = signal(false);
  
  removing = signal<string[]>([]);
  addingPosts = signal<string[]>([]);

  // Form Controls
  searchPostsControl = new FormControl('');

  // Computed values
  sortedPosts = computed(() => {
    return [...this.collectionPosts()].sort((a, b) => a.order - b.order);
  });

  isOwner = computed(() => {
    // In a real app, check if current user is the author
    return this.apiService.isAuthenticated();
  });

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      await this.loadCollection(slug);
    }
  }

  private async loadCollection(slug: string) {
    try {
      this.loading.set(true);
      this.error.set('');

      const collection = await this.apiService.getCollectionBySlug(slug);
      this.collection.set(collection);
      this.collectionPosts.set(collection.posts || []);

      // Load related collections if public
      if (collection.isPublic) {
        await this.loadRelatedCollections();
      }

    } catch (error) {
      console.error('Failed to load collection:', error);
      this.error.set('Collection not found or failed to load');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadRelatedCollections() {
    try {
      const response = await this.apiService.getCollections({
        isPublic: true,
        limit: 6
      });
      
      // Filter out current collection
      const related = (response.collections || [])
        .filter(c => c._id !== this.collection()?._id)
        .slice(0, 3);
      
      this.relatedCollections.set(related);
    } catch (error) {
      console.error('Failed to load related collections:', error);
    }
  }

  // Reorder Mode
  toggleReorderMode() {
    if (this.reorderMode()) {
      this.saveOrder();
    } else {
      this.reorderMode.set(true);
    }
  }

  cancelReorder() {
    // Reset to original order
    const collection = this.collection();
    if (collection) {
      this.collectionPosts.set(collection.posts || []);
    }
    this.reorderMode.set(false);
  }

  async saveOrder() {
    if (!this.collection()) return;

    try {
      this.savingOrder.set(true);
      
      const reorderData: ReorderCollectionPostsRequest = {
        posts: this.sortedPosts().map((cp, index) => ({
          postId: this.getPostId(cp.post),
          order: index + 1
        }))
      };

      const updatedCollection = await this.apiService.reorderCollectionPosts(
        this.collection()!._id, 
        reorderData
      );
      
      this.collection.set(updatedCollection);
      this.collectionPosts.set(updatedCollection.posts || []);
      this.reorderMode.set(false);

    } catch (error) {
      console.error('Failed to save order:', error);
    } finally {
      this.savingOrder.set(false);
    }
  }

  onDrop(event: CdkDragDrop<CollectionPost[]>) {
    const posts = [...this.collectionPosts()];
    moveItemInArray(posts, event.previousIndex, event.currentIndex);
    
    // Update order values
    const updatedPosts = posts.map((post, index) => ({
      ...post,
      order: index + 1
    }));
    
    this.collectionPosts.set(updatedPosts);
  }

  // Add Posts Modal
  showAddPostModal() {
    this.showAddModal.set(true);
    this.loadAvailablePosts();
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.availablePosts.set([]);
    this.searchPostsControl.setValue('');
  }

  private async loadAvailablePosts() {
    try {
      this.loadingPosts.set(true);
      
      // Get user's published posts
      const response = await this.apiService.getPosts({
          status: 'published',
          limit: 50,
          dateTo: '',
          dateFrom: ''
      });
      
      // Filter out posts already in collection
      const existingPostIds = this.collectionPosts().map(cp => this.getPostId(cp.post));
      const available = (response.posts || [])
        .filter(post => !existingPostIds.includes(post._id));
      
      this.availablePosts.set(available);

    } catch (error) {
      console.error('Failed to load available posts:', error);
    } finally {
      this.loadingPosts.set(false);
    }
  }

  async addPostToCollection(postId: string) {
    if (!this.collection()) return;

    try {
      this.addingPosts.update(adding => [...adding, postId]);
      
      const addData: AddPostToCollectionRequest = {
        collectionId: this.collection()!._id,
        postId,
        order: this.collectionPosts().length + 1
      };

      const updatedCollection = await this.apiService.addPostToCollection(addData);
      
      this.collection.set(updatedCollection);
      this.collectionPosts.set(updatedCollection.posts || []);
      
      // Remove from available posts
      this.availablePosts.update(posts => posts.filter(p => p._id !== postId));

    } catch (error) {
      console.error('Failed to add post to collection:', error);
    } finally {
      this.addingPosts.update(adding => adding.filter(id => id !== postId));
    }
  }

  async removePost(post: string | Post) {
    if (!this.collection()) return;
    
    const postId = this.getPostId(post);
    if (!confirm('Remove this article from the collection?')) return;

    try {
      this.removing.update(removing => [...removing, postId]);
      
      const updatedCollection = await this.apiService.removePostFromCollection(
        this.collection()!._id, 
        postId
      );
      
      this.collection.set(updatedCollection);
      this.collectionPosts.set(updatedCollection.posts || []);

    } catch (error) {
      console.error('Failed to remove post from collection:', error);
    } finally {
      this.removing.update(removing => removing.filter(id => id !== postId));
    }
  }

  // Social Actions
  async toggleFollow() {
    // Implementation for following collection author
    this.followLoading.set(true);
    
    try {
      // Toggle follow logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      this.isFollowing.update(current => !current);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      this.followLoading.set(false);
    }
  }

  shareCollection() {
    if (navigator.share && this.collection()) {
      navigator.share({
        title: this.collection()!.title,
        text: this.collection()!.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }

  // Helper Methods
  getReorderButtonClass(): string {
    const baseClass = "px-6 py-3 font-mono text-sm uppercase tracking-wider transition-colors border-2";
    return this.reorderMode()
      ? `${baseClass} bg-blue-600 text-blue-100 border-blue-700 hover:bg-blue-700`
      : `${baseClass} bg-amber-200 text-amber-800 border-amber-400 hover:bg-amber-300`;
  }

  getPostsCount(): number {
    return this.collectionPosts().length;
  }

  getTotalReadingTime(): number {
    return this.collectionPosts().reduce((total, cp) => {
      return total + this.getPostReadingTime(cp.post);
    }, 0);
  }

  getAuthor(): any {
    const author = this.collection()?.author;
    return typeof author === 'object' ? author : null;
  }

  getAuthorInitials(): string {
    const author = this.getAuthor();
    if (!author?.name) return 'A';
    return author.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Post Helper Methods
  getPostId(post: string | Post): string {
    return typeof post === 'object' ? post._id : post;
  }

  getPostTitle(post: string | Post): string {
    return typeof post === 'object' ? post.title : 'Untitled';
  }

  getPostSlug(post: string | Post): string {
    return typeof post === 'object' ? post.slug : '';
  }

  getPostExcerpt(post: string | Post): string {
    return typeof post === 'object' ? (post.excerpt || '') : '';
  }

  getPostAuthor(post: string | Post): string {
    if (typeof post === 'object') {
      const author = post.author;
      return typeof author === 'object' ? author.name : 'Anonymous';
    }
    return 'Anonymous';
  }

  getPostDate(post: string | Post): string {
    return typeof post === 'object' ? (post.publishedAt || post.createdAt) : '';
  }

  getPostReadingTime(post: string | Post): number {
    if (typeof post === 'object') {
      return post.readingTime || Math.ceil((post.content?.split(' ').length || 0) / 200);
    }
    return 1;
  }

  getPostLikes(post: string | Post): number {
    return typeof post === 'object' ? (post.likeCount || 0) : 0;
  }

  getPostCoverImage(post: string | Post): string {
    return typeof post === 'object' ? (post.coverImage || '') : '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
