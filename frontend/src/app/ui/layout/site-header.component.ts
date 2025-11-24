import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../../../types/api';

type ThemeMode = 'light' | 'dark';

export interface NavLink {
  label: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  host: {
    class: 'relative z-50 block',
  },
  template: `
    <header class="sticky top-0 border-b border-border-default/80 bg-surface/90 backdrop-blur-md transition-colors duration-200 ease-out dark:border-border-dark dark:bg-surface-dark/90">
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:h-20 md:px-6">
        <div class="flex items-center gap-3 md:gap-8">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-default/70 bg-transparent text-text-secondary transition-colors duration-200 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 md:hidden dark:border-white/10 dark:text-slate-200 dark:hover:text-white"
            (click)="menuToggle.emit()"
            aria-label="Toggle navigation"
            [attr.aria-expanded]="mobileNavOpen"
          >
            @if (mobileNavOpen) {
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else {
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            }
          </button>

          <a routerLink="/" class="inline-flex items-center gap-3 rounded-xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-sm font-bold tracking-tight text-white shadow-card" aria-hidden="true">MB</span>
            <span class="hidden flex-col leading-tight sm:flex">
              <span class="text-base font-semibold tracking-tight text-text-primary transition-colors duration-200 dark:text-white md:text-lg">{{ blogTitle }}</span>
              <span class="text-xs font-medium text-text-secondary dark:text-slate-300">{{ blogSubtitle }}</span>
            </span>
          </a>

          <nav class="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Primary">
            @for (item of primaryNav; track item.path) {
              <a
                class="border-b-2 border-transparent pb-1 text-text-secondary transition-colors duration-200 hover:border-brand-blue/70 hover:text-text-primary dark:text-slate-300 dark:hover:border-brand-accent/60 dark:hover:text-white"
                [routerLink]="item.path"
                [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                routerLinkActive="border-brand-blue text-text-primary dark:border-brand-accent"
                #rla="routerLinkActive"
                [attr.aria-current]="rla.isActive ? 'page' : null"
              >
                {{ item.label }}
              </a>
            }
          </nav>
        </div>

        <div class="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-default/70 text-text-secondary transition-colors duration-200 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10 dark:text-slate-200 dark:hover:text-white"
            (click)="themeToggle.emit()"
            aria-label="Toggle color theme"
            [attr.aria-pressed]="theme === 'dark'"
          >
            @if (theme === 'dark') {
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            } @else {
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="4" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m3.64-6.36 1.42 1.42m11.88 11.88 1.42 1.42m0-14.72-1.42 1.42M7.06 16.94l-1.42 1.42" />
              </svg>
            }
          </button>

          @if (!isAuthenticated) {
            <a
              routerLink="/auth"
              class="hidden items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:bg-brand-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 sm:inline-flex"
            >
              Join
            </a>
          } @else {
            <div class="relative" (keydown.escape)="userMenuClose.emit()">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl border border-border-default px-4 py-2 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-white"
                (click)="userMenuToggle.emit()"
                [attr.aria-expanded]="showUserMenu"
              >
                <span class="hidden sm:inline-flex">{{ currentUser?.name || 'Profile' }}</span>
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 8l4 4 4-4" />
                </svg>
              </button>

              @if (showUserMenu) {
                <div class="absolute right-0 mt-2 w-48 rounded-xl border border-border-default bg-surface p-2 shadow-card dark:border-border-dark dark:bg-surface-dark" role="menu">
                  @for (item of userNav; track item.path) {
                    <a
                      [routerLink]="item.path"
                      class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors duration-200 hover:bg-brand-blue/10 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                      role="menuitem"
                    >
                      {{ item.label }}
                    </a>
                  }
                  <button
                    type="button"
                    class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-feedback-error transition-colors duration-200 hover:bg-feedback-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-feedback-error/30"
                    (click)="logout.emit()"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              }
            </div>
          }

          @if (!isAuthenticated) {
            <a
              routerLink="/auth"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:bg-brand-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 sm:hidden"
            >
              Join
            </a>
          }
        </div>
      </div>

      @if (mobileNavOpen) {
        <div class="md:hidden">
          <div class="fixed inset-x-4 top-20 z-40 rounded-2xl border border-border-default bg-surface p-5 shadow-elevated dark:border-border-dark dark:bg-surface-dark" role="dialog" aria-modal="true">
            <nav aria-label="Mobile primary navigation" class="flex flex-col gap-2">
              @for (item of primaryNav; track item.path) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-brand-blue/10 text-brand-blue dark:bg-white/10 dark:text-white"
                  class="rounded-xl px-4 py-3 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-brand-blue/10 hover:text-brand-blue dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {{ item.label }}
                </a>
              }
            </nav>
            <div class="mt-4 flex flex-col gap-2">
              @if (isAuthenticated) {
                <div class="flex flex-col gap-1">
                  @for (item of userNav; track item.path) {
                    <a
                      [routerLink]="item.path"
                      class="rounded-xl px-4 py-3 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-brand-blue/10 hover:text-brand-blue dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      {{ item.label }}
                    </a>
                  }
                </div>
                <button
                  type="button"
                  class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-default px-4 py-3 text-sm font-semibold text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-white/10 dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-white"
                  (click)="logout.emit()"
                >
                  Logout
                </button>
              } @else {
                <a
                  routerLink="/auth"
                  class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:bg-brand-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                >
                  Join the community
                </a>
              }
            </div>
          </div>
          <button
            type="button"
            class="fixed inset-0 z-30 bg-surface-dark/50 backdrop-blur-sm"
            aria-label="Dismiss navigation"
            (click)="menuClose.emit()"
          ></button>
        </div>
      }
    </header>
  `,
})
export class SiteHeaderComponent {
  @Input({ required: true }) blogTitle!: string;
  @Input({ required: true }) blogSubtitle!: string;
  @Input({ required: true }) primaryNav!: NavLink[];
  @Input({ required: true }) userNav!: NavLink[];
  @Input({ required: true }) isAuthenticated!: boolean;
  @Input() currentUser: User | null = null;
  @Input({ required: true }) theme!: ThemeMode;
  @Input({ required: true }) mobileNavOpen!: boolean;
  @Input({ required: true }) showUserMenu!: boolean;

  @Output() themeToggle = new EventEmitter<void>();
  @Output() menuToggle = new EventEmitter<void>();
  @Output() menuClose = new EventEmitter<void>();
  @Output() userMenuToggle = new EventEmitter<void>();
  @Output() userMenuClose = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
