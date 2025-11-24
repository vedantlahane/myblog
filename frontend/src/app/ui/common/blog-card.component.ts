import {  } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post, Tag } from '../../../types/api';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [, RouterLink],
  host: {
    class: 'block h-full',
  },
  template: `
    <article
      class="group flex h-full flex-col overflow-hidden rounded-[12px] border border-border-default bg-surface shadow-card transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-violet/20 dark:border-border-dark dark:bg-surface-dark"
    >
      @if (post.coverImage) {
        <div class="relative aspect-[16/9] w-full overflow-hidden">
          <img
            [src]="post.coverImage"
            [alt]="post.title"
            [attr.loading]="priorityImage ? 'eager' : 'lazy'"
            [attr.decoding]="priorityImage ? 'sync' : 'async'"
            class="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 group-focus-within:scale-105"
          >
        </div>
      }

      <div
        [ngClass]="compact ? 'flex flex-1 flex-col gap-3 p-5' : 'flex flex-1 flex-col gap-4 p-6 sm:gap-5'"
      >
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-mono uppercase tracking-[0.2em] text-text-subtle dark:text-slate-400">
          <span>{{ authorName }}</span>
          <span aria-hidden="true">•</span>
          <span>{{ formattedDate }}</span>
          @if (!compact) {
            <ng-container>
              <span aria-hidden="true">•</span>
              <span>{{ readingTime }} min read</span>
            </ng-container>
          }
        </div>

        <h3
          class="text-xl font-semibold text-text-primary transition-colors duration-200 ease-out group-hover:text-brand-blue dark:text-white"
          [class.text-lg]="compact"
          [class.md\:text-2xl]="!compact"
        >
          <a [routerLink]="['/post', post.slug]" class="focus:outline-none">
            {{ post.title }}
          </a>
        </h3>

        @if (showExcerpt && post.excerpt) {
          <p class="line-clamp-3 text-sm leading-relaxed text-text-secondary dark:text-slate-300">
            {{ post.excerpt }}
          </p>
        }

        @if (showTags && displayTags.length > 0) {
          <div class="flex flex-wrap gap-2">
            @for (tag of displayTags; track trackTag(tag, $index)) {
                <a
                [routerLink]="['/tag', toSlug(tag)]"
                class="inline-flex items-center gap-1 rounded-full tag-pill-sci px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-brand-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-violet/30 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-brand-accent"
              >
                {{ toName(tag) }}
              </a>
            }
          </div>
        }

        @if (showEngagement) {
          <div class="mt-auto flex items-center justify-between text-[0.7rem] font-mono uppercase tracking-[0.25em] text-text-subtle dark:text-slate-400">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 text-brand-blue">
                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ post.likeCount || 0 }}</span>
              </div>

              <div class="flex items-center gap-1 text-text-secondary dark:text-slate-400">
                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ post.commentCount || 0 }}</span>
              </div>
            </div>

            <div class="flex items-center gap-1 text-text-secondary dark:text-slate-400">
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
              </svg>
              <span>{{ post.viewCount || 0 }}</span>
            </div>
          </div>
        }
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogCardComponent {
  @Input({ required: true }) post!: Post;
  @Input() showExcerpt = true;
  @Input() showTags = true;
  @Input() showEngagement = true;
  @Input() maxTags = 3;
  @Input() compact = false;
  @Input() priorityImage = false;

  get displayTags(): Array<string | Tag> {
    const tags = Array.isArray(this.post?.tags) ? this.post.tags : [];
    return tags.slice(0, this.maxTags);
  }

  get authorName(): string {
    const author = this.post?.author;
    if (!author) {
      return 'Anonymous';
    }
    if (typeof author === 'string') {
      return author;
    }
    return author.name || 'Anonymous';
  }

  get formattedDate(): string {
    const value = this.post?.publishedAt || this.post?.createdAt;
    if (!value) {
      return '';
    }
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  get readingTime(): number {
    const content = this.post?.content;
    if (!content) {
      return this.post?.readingTime ?? 1;
    }
    const words = content.split(/\s+/).filter(Boolean).length;
    return this.post?.readingTime ?? Math.max(1, Math.ceil(words / 200));
  }

  toName(tag: string | Tag): string {
    if (typeof tag === 'string') {
      return tag;
    }
    return tag?.name || '';
  }

  toSlug(tag: string | Tag): string {
    if (typeof tag === 'string') {
      return tag.toLowerCase().replace(/\s+/g, '-');
    }
    return tag?.slug || tag?.name?.toLowerCase().replace(/\s+/g, '-') || '';
  }

  trackTag(tag: string | Tag, index: number): string {
    if (typeof tag === 'string') {
      return `${index}-${tag}`;
    }
    return tag?._id || tag?.slug || `${index}-${tag?.name ?? 'tag'}`;
  }
}
