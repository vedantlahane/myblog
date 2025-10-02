import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, OnInit, AfterViewInit, PLATFORM_ID, Renderer2, inject, signal, NgZone } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent, throttleTime } from 'rxjs';

import { ApiService } from './services/api.service';
import { User } from '../types/api';

type ThemeMode = 'light' | 'dark';

interface NavLink {
  label: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-surface min-h-screen" [attr.data-theme]="theme()">
      <div class="reading-progress" aria-hidden="true">
        <div class="reading-progress__bar" [style.transform]="'scaleX(' + readingProgress() + ')'" role="presentation"></div>
      </div>
      <a href="#main-content" class="skip-link sr-only focus-visible:not-sr-only">Skip to main content</a>

  <header class="app-header">
        <div class="container-responsive flex h-16 items-center justify-between gap-3 md:h-20">
          <div class="flex items-center gap-3 md:gap-8">
            <button
              type="button"
              class="icon-button md:hidden"
              (click)="toggleMobileNav()"
              aria-label="Toggle navigation"
              [attr.aria-expanded]="mobileNavOpen()"
            >
              @if (mobileNavOpen()) {
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              } @else {
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              }
            </button>

            <a
              routerLink="/"
              class="brand focus-visible:focus-outline"
            >
              <span class="brand-mark" aria-hidden="true">MB</span>
              <span class="hidden flex-col leading-tight sm:flex">
                <span class="text-base font-semibold tracking-tight text-primary md:text-lg">{{ blogTitle }}</span>
                <span class="text-xs font-medium text-muted">{{ blogSubtitle }}</span>
              </span>
            </a>

            <nav class="primary-nav hidden items-center gap-6 md:flex" aria-label="Primary">
              @for (item of primaryNav; track item.path) {
                <a
                  class="nav-link"
                  [routerLink]="item.path"
                  [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                  routerLinkActive="nav-link-active"
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
              class="icon-button"
              (click)="toggleTheme()"
              aria-label="Toggle color theme"
              [attr.aria-pressed]="theme() === 'dark'"
            >
              @if (theme() === 'dark') {
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

            @if (!isAuthenticated()) {
              <a routerLink="/auth" class="btn-primary hidden sm:inline-flex">Join</a>
            } @else {
              <div class="relative" (keydown.escape)="closeUserMenu()">
                <button
                  type="button"
                  class="btn-secondary"
                  (click)="toggleUserMenu()"
                  [attr.aria-expanded]="showUserMenu()"
                >
                  <span class="hidden sm:inline-flex">{{ currentUser()?.name || 'Profile' }}</span>
                  <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 8l4 4 4-4" />
                  </svg>
                </button>

                @if (showUserMenu()) {
                  <div class="user-menu" role="menu">
                    @for (item of userNav; track item.path) {
                      <a [routerLink]="item.path" class="user-menu__item" role="menuitem">{{ item.label }}</a>
                    }
                    <button type="button" class="user-menu__item text-danger" (click)="logout()" role="menuitem">
                      Logout
                    </button>
                  </div>
                }
              </div>
            }

            @if (!isAuthenticated()) {
              <a routerLink="/auth" class="btn-primary sm:hidden">Join</a>
            }
          </div>
        </div>

        @if (mobileNavOpen()) {
          <div class="mobile-nav md:hidden">
            <div class="mobile-nav__panel" role="dialog" aria-modal="true">
              <nav aria-label="Mobile primary navigation" class="flex flex-col gap-2">
                @for (item of primaryNav; track item.path) {
                  <a [routerLink]="item.path" routerLinkActive="mobile-nav__link-active" class="mobile-nav__link">
                    {{ item.label }}
                  </a>
                }
              </nav>
              <div class="mobile-nav__actions">
                @if (isAuthenticated()) {
                  <div class="flex flex-col gap-1">
                    @for (item of userNav; track item.path) {
                      <a [routerLink]="item.path" class="mobile-nav__link">{{ item.label }}</a>
                    }
                  </div>
                  <button type="button" class="btn-secondary w-full" (click)="logout()">Logout</button>
                } @else {
                  <a routerLink="/auth" class="btn-primary w-full">Join the community</a>
                }
              </div>
            </div>
            <button type="button" class="mobile-nav__backdrop" aria-label="Dismiss navigation" (click)="closeMobileNav()"></button>
          </div>
        }
      </header>

      <main id="main-content" class="app-main">
        <div class="container-responsive space-y-12">
          <section class="intro">
            <div class="intro__content">
              <div>
                <h1>Articles crafted for deep focus</h1>
                <p class="intro__lead">
                  A minimalist publication Space built for progressive learning, thoughtful exploration, and distraction-free reading.
                </p>
              </div>
              <div class="intro__meta">
                <span class="intro__meta-pill">
                  <span class="intro__pulse" aria-hidden="true"></span>
                  {{ totalPosts }} published posts
                </span>
              </div>
            </div>
          </section>

          @if (loading()) {
            <section class="grid-responsive" role="status" aria-live="polite">
              @for (placeholder of skeletonPlaceholders; track placeholder) {
                <article class="blog-card skeleton-card" aria-hidden="true">
                  <div class="skeleton skeleton-image"></div>
                  <div class="skeleton skeleton-title"></div>
                  <div class="skeleton skeleton-text"></div>
                  <div class="skeleton skeleton-text skeleton-text--short"></div>
                </article>
              }
            </section>
          } @else {
            <section class="content-shell">
              <router-outlet></router-outlet>
            </section>
          }
        </div>
      </main>

      <footer class="app-footer">
        <div class="container-responsive grid gap-10 md:grid-cols-[2fr,1fr]">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="brand-mark">MB</span>
              <div>
                <p class="text-sm font-semibold text-primary">{{ blogTitle }}</p>
                <p class="text-xs text-muted">Curated knowledge for curious minds.</p>
              </div>
            </div>
            <p class="max-w-xl text-sm text-muted">
              MyBlog is a progressive library of ideas, tutorials, and experiments designed to guide you from curiosity to mastery—one focused insight at a time.
            </p>
            <div class="flex flex-wrap items-center gap-3 text-xs text-muted">
              <a routerLink="/privacy" class="link-muted">Privacy</a>
              <span aria-hidden="true">•</span>
              <a routerLink="/terms" class="link-muted">Terms</a>
              <span aria-hidden="true">•</span>
              <a href="mailto:hello@myblog.com" class="link-muted">Contact</a>
            </div>
            <p class="text-xs text-muted">&copy; {{ currentYear }} {{ blogTitle }} — Built for minimal distraction and maximum clarity.</p>
          </div>

          <div class="space-y-4">
            <p class="text-sm font-semibold text-primary">Stay in the loop</p>
            <p class="text-xs text-muted">Get weekly digests of our latest thinking, deep-dives, and learning roadmaps.</p>
            <form class="newsletter" (submit)="$event.preventDefault()" novalidate>
              <label class="sr-only" for="newsletter-email">Email address</label>
              <input id="newsletter-email" type="email" class="newsletter__input" placeholder="you@example.com" autocomplete="email" />
              <button type="submit" class="btn-primary newsletter__submit">Subscribe</button>
            </form>
            <div class="flex items-center gap-2">
              <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter" class="icon-button">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M22 5.92c-.77.35-1.6.58-2.47.69a4.27 4.27 0 0 0 1.88-2.35 8.4 8.4 0 0 1-2.69 1.04 4.22 4.22 0 0 0-7.19 3.85 12 12 0 0 1-8.7-4.41 4.2 4.2 0 0 0 1.3 5.62 4.19 4.19 0 0 1-1.9-.53v.05a4.23 4.23 0 0 0 3.39 4.14 4.27 4.27 0 0 1-1.89.07 4.23 4.23 0 0 0 3.95 2.93A8.48 8.48 0 0 1 2 19.54 12 12 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53A8.33 8.33 0 0 0 22 5.92Z" />
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub" class="icon-button">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19c-4 1-4-2-6-2m12 4v-3.87a3.37 3.37 0 0 0-.94-2.6c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 18 4.77a5.07 5.07 0 0 0-.09-3.77S16.73 .65 13 2.48a13.38 13.38 0 0 0-7 0C2.27 .65 1.1 1 1.1 1A5.07 5.07 0 0 0 1 4.77 5.44 5.44 0 0 0 0 8.53c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.6V22" />
                </svg>
              </a>
              <a href="https://dribbble.com" target="_blank" rel="noopener" aria-label="Dribbble" class="icon-button">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.7 19.4C14.5 15.6 12 11.9 8.2 8.8M19.1 14.6c-2.5-.6-5.2-.4-8 .7M4.9 9.4a13.7 13.7 0 0 1 6.5 1.5m2.7-6.7c-1.3 1.8-3.5 3.6-6.6 5.2" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      @if (showUserMenu()) {
        <div class="user-menu__backdrop" (click)="closeUserMenu()" aria-hidden="true"></div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--color-surface-muted);
      color: var(--color-body);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .skip-link {
      position: absolute;
      left: 50%;
      top: 1rem;
      transform: translate(-50%, -200%);
      padding: 0.75rem 1.25rem;
      border-radius: 999px;
      background: var(--color-primary);
      color: var(--color-surface);
      font-weight: 600;
      transition: transform var(--transition-base);
      z-index: 60;
    }

    .skip-link:focus-visible {
      transform: translate(-50%, 0);
    }

    .app-header {
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(10px);
      background: color-mix(in srgb, var(--color-surface) 85%, transparent);
      border-bottom: 1px solid var(--color-border);
    }

    .reading-progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      z-index: 70;
      pointer-events: none;
      background: transparent;
    }

    .reading-progress__bar {
      width: 100%;
      height: 100%;
      transform-origin: left;
      transform: scaleX(0);
      background: linear-gradient(90deg, var(--color-success), var(--color-accent));
      transition: transform 0.2s ease-out;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .brand-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: var(--color-primary);
      color: var(--color-surface);
      box-shadow: var(--shadow-card);
    }

    .primary-nav {
      font-size: 0.95rem;
      font-weight: 500;
    }

    .nav-link {
      position: relative;
      padding-bottom: 0.35rem;
      color: var(--color-muted);
      transition: color var(--transition-base);
    }

    .nav-link::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 2px;
      transform: scaleX(0);
      transform-origin: left;
      background: var(--color-primary);
      transition: transform var(--transition-base);
    }

    .nav-link:hover,
    .nav-link:focus-visible,
    .nav-link-active {
      color: var(--color-primary);
    }

    .nav-link:hover::after,
    .nav-link:focus-visible::after,
    .nav-link-active::after {
      transform: scaleX(1);
    }

    .icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background: color-mix(in srgb, var(--color-surface) 85%, transparent);
      color: var(--color-primary);
      transition: transform var(--transition-base), background var(--transition-base), border-color var(--transition-base);
    }

    .icon-button:hover,
    .icon-button:focus-visible {
      background: var(--color-surface);
      border-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
    }

    .btn-primary,
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      padding: 0.65rem 1.25rem;
      min-height: 2.75rem;
      transition: transform var(--transition-base), box-shadow var(--transition-base), background var(--transition-base), color var(--transition-base);
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-surface);
      box-shadow: var(--shadow-card);
    }

    .btn-primary:hover {
      background: var(--color-primary-hover);
      transform: scale(1.03);
      box-shadow: var(--shadow-card-hover);
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-primary);
      border: 1px solid color-mix(in srgb, var(--color-primary) 12%, transparent);
    }

    .btn-secondary:hover {
      background: color-mix(in srgb, var(--color-primary) 6%, transparent);
      transform: translateY(-1px);
    }

    .user-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 0.75rem);
      width: 220px;
      padding: 0.5rem;
      border-radius: var(--radius-card);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      box-shadow: var(--shadow-elevated);
      z-index: 50;
    }

    .user-menu__item {
      width: 100%;
      text-align: left;
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      color: var(--color-muted);
      transition: color var(--transition-base), background var(--transition-base);
    }

    .user-menu__item:hover,
    .user-menu__item:focus-visible {
      color: var(--color-primary);
      background: var(--color-surface-muted);
    }

    .user-menu__backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: transparent;
    }

    .mobile-nav {
      position: fixed;
      inset: 0;
      z-index: 60;
      display: flex;
    }

    .mobile-nav__panel {
      width: min(80vw, 320px);
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      padding: 1.75rem 1.5rem;
      box-shadow: var(--shadow-elevated);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      animation: slideIn var(--transition-base);
    }

    .mobile-nav__backdrop {
      flex: 1 1 auto;
      background: var(--color-backdrop);
    }

    .mobile-nav__link {
      display: block;
      padding: 0.65rem 0.75rem;
      border-radius: 8px;
      color: var(--color-muted);
      font-weight: 500;
      transition: background var(--transition-base), color var(--transition-base);
    }

    .mobile-nav__link:hover,
    .mobile-nav__link:focus-visible,
    .mobile-nav__link-active {
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 6%, transparent);
    }

    .mobile-nav__actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .app-main {
      padding: clamp(3rem, 8vw, 4.5rem) 0;
    }

    .intro {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .intro__content {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .intro__lead {
      margin-top: 0.75rem;
      max-width: 48ch;
      color: var(--color-subtle);
      font-size: 1rem;
    }

    .intro__meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .intro__meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      background: var(--color-surface);
      color: var(--color-muted);
      box-shadow: var(--shadow-card);
      font-weight: 500;
    }

    .intro__pulse {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: var(--color-success);
      animation: pulseSoft 1.8s ease-in-out infinite;
    }

    .content-shell {
      min-height: 60vh;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .skeleton-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.25rem;
    }

    .skeleton {
      width: 100%;
      border-radius: 12px;
      background: linear-gradient(90deg, color-mix(in srgb, var(--color-surface-muted) 98%, transparent) 0%, color-mix(in srgb, var(--color-muted) 6%, transparent) 50%, color-mix(in srgb, var(--color-surface-muted) 98%, transparent) 100%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
    }

    .skeleton-image {
      aspect-ratio: 16 / 9;
    }

    .skeleton-title {
      height: 1.4rem;
      width: 80%;
    }

    .skeleton-text {
      height: 0.9rem;
    }

    .skeleton-text--short {
      width: 60%;
    }

    .reveal {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s var(--transition-base), transform 0.6s var(--transition-base);
    }

    .reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .app-footer {
      border-top: 1px solid var(--color-border);
      background: var(--color-surface);
      padding: clamp(2.5rem, 6vw, 4rem) 0;
      margin-top: clamp(3rem, 8vw, 4.5rem);
    }

    .link-muted {
      color: var(--color-muted);
      transition: color var(--transition-base);
    }

    .link-muted:hover,
    .link-muted:focus-visible {
      color: var(--color-primary);
    }

    .newsletter {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .newsletter__input {
      width: 100%;
      border-radius: 12px;
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      padding: 0.75rem 1rem;
      color: var(--color-body);
      transition: border-color var(--transition-base), box-shadow var(--transition-base);
    }

    .newsletter__input:focus-visible {
      border-color: color-mix(in srgb, var(--color-primary) 18%, transparent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 12%, transparent);
      outline: none;
    }

    .newsletter__submit {
      align-self: flex-start;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(-10%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (min-width: 768px) {
      .newsletter {
        flex-direction: row;
        align-items: center;
      }

      .newsletter__input {
        flex: 1;
      }
    }

    @media (max-width: 600px) {
      .brand-mark {
        width: 2.25rem;
        height: 2.25rem;
      }

      .btn-primary,
      .btn-secondary {
        padding-inline: 1rem;
      }
    }
  `]
})
export class AppComponent implements OnInit, AfterViewInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private intersectionObserver: IntersectionObserver | null = null;

  readonly blogTitle = 'MyBlog';
  readonly blogSubtitle = 'Personal learning journal';
  readonly currentYear = new Date().getFullYear();

  readonly primaryNav: NavLink[] = [
    { label: 'Latest', path: '/', exact: true },
    { label: 'Archive', path: '/archive' },
    { label: 'Categories', path: '/search' },
    { label: 'About', path: '/about' },
  ];

  readonly userNav: NavLink[] = [
    { label: 'Profile', path: '/profile' },
    { label: 'Write', path: '/write' },
    { label: 'Drafts', path: '/drafts' },
    { label: 'Bookmarks', path: '/bookmarks' },
  ];

  readonly skeletonPlaceholders = Array.from({ length: 6 }, (_, index) => index);

  private readonly themeStorageKey = 'myblog:theme';
  private readonly copyStateTimers = new Map<HTMLButtonElement, number>();

  totalPosts = 0;
  loading = signal(false);
  currentUser = signal<User | null>(null);
  showUserMenu = signal(false);
  mobileNavOpen = signal(false);
  theme = signal<ThemeMode>('light');
  readingProgress = signal(0);

  async ngOnInit() {
    this.initializeTheme();
    this.setupScrollProgress();
    this.setupRouterListeners();
    await this.bootstrapData();
  }

  ngAfterViewInit(): void {
  this.scheduleUiEnhancements();
  }

  private async bootstrapData() {
    await this.checkAuthStatus();
    await this.updatePostCount();
    this.setupAuthStateListener();
  }

  private initializeTheme() {
    const root = this.document?.documentElement;
    if (!root) {
      return;
    }

    let preferred: ThemeMode = 'light';

    if (isPlatformBrowser(this.platformId)) {
      const stored = window.localStorage.getItem(this.themeStorageKey) as ThemeMode | null;
      if (stored === 'dark' || stored === 'light') {
        preferred = stored;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        preferred = 'dark';
      }
    }

    this.applyTheme(preferred);
  }

  toggleTheme() {
    const next: ThemeMode = this.theme() === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
  }

  private applyTheme(mode: ThemeMode) {
    this.theme.set(mode);
    const root = this.document?.documentElement;
    if (root) {
      root.setAttribute('data-theme', mode);
      if (mode === 'dark') {
        this.renderer.addClass(root, 'dark');
      } else {
        this.renderer.removeClass(root, 'dark');
      }
    }

    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem(this.themeStorageKey, mode);
    }
  }

  toggleMobileNav() {
    this.mobileNavOpen.update((state) => !state);
  }

  closeMobileNav() {
    this.mobileNavOpen.set(false);
  }

  toggleUserMenu() {
    this.showUserMenu.update((state) => !state);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }

  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  async logout() {
    try {
      this.loading.set(true);
      await this.apiService.logout();
      this.currentUser.set(null);
      this.showUserMenu.set(false);
      this.mobileNavOpen.set(false);
      await this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private async checkAuthStatus() {
    if (!this.apiService.isAuthenticated()) {
      return;
    }

    try {
      this.loading.set(true);
      const user = await this.apiService.getCurrentUser();
      this.currentUser.set(user);
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.currentUser.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private setupAuthStateListener() {
    this.apiService.token$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((token) => {
        if (!token) {
          this.currentUser.set(null);
          this.showUserMenu.set(false);
        }
      });
  }

  private async updatePostCount() {
    try {
      const response = await this.apiService.getPosts({
        limit: 1,
        status: 'published',
        dateTo: '',
        dateFrom: '',
      });
      this.totalPosts = response.totalPosts || 0;
    } catch (error) {
      console.error('Failed to get post count:', error);
      this.totalPosts = 0;
    }
  }

  private setupRouterListeners() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.mobileNavOpen.set(false);
        this.showUserMenu.set(false);
  this.scheduleUiEnhancements();
        if (isPlatformBrowser(this.platformId)) {
          this.ngZone.runOutsideAngular(() => window.requestAnimationFrame(() => this.updateReadingProgress()));
        }
      });
  }

  private scheduleUiEnhancements() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      window.requestAnimationFrame(() => {
        this.enhanceCodeBlocks();
        this.observeRevealElements();
        this.ensureLazyLoading();
      });
    });
  }

  private enhanceCodeBlocks() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const codeBlocks = Array.from(this.document.querySelectorAll('pre code')) as HTMLElement[];
    codeBlocks.forEach((codeElement) => {
      const parent = codeElement.parentElement;
      if (!parent || parent.dataset['enhanced'] === 'true') {
        return;
      }

      parent.dataset['enhanced'] = 'true';

      const button = this.document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      button.dataset['state'] = 'idle';

      const icon = this.document.createElement('span');
      icon.className = 'code-copy__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="9" y="9" width="13" height="13" rx="2"></rect>
          <path d="M15 9V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h4" />
        </svg>
      `;

      const label = this.document.createElement('span');
      label.className = 'code-copy__label';
      label.textContent = 'Copy';
      label.dataset['original'] = 'Copy';

      button.append(icon, label);
      button.addEventListener('click', () => this.handleCopyButtonClick(button, codeElement.innerText));

      parent.appendChild(button);
    });
  }

  private handleCopyButtonClick(button: HTMLButtonElement, content: string) {
    if (!content) {
      return;
    }

    this.ngZone.runOutsideAngular(async () => {
      try {
        await this.copyToClipboard(content);
        this.setCopyState(button, 'copied');
      } catch (error) {
        console.error('Failed to copy code:', error);
        this.setCopyState(button, 'error');
      }
    });
  }

  private async copyToClipboard(value: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = this.document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
  this.document.body.appendChild(textarea);
  textarea.select();
  (this.document as Document).execCommand('copy');
  this.document.body.removeChild(textarea);
  }

  private setCopyState(button: HTMLButtonElement, state: 'copied' | 'error') {
    button.dataset['state'] = state;

    const label = button.querySelector<HTMLElement>('.code-copy__label');
    if (label) {
      const original = label.dataset['original'] ?? label.textContent ?? 'Copy';
      label.dataset['original'] = original;
      label.textContent = state === 'copied' ? 'Copied' : 'Copy failed';
    }

    const previous = this.copyStateTimers.get(button);
    if (previous) {
      window.clearTimeout(previous);
    }

    const timer = window.setTimeout(() => {
      button.dataset['state'] = 'idle';
      const labelReset = button.querySelector<HTMLElement>('.code-copy__label');
      if (labelReset) {
        labelReset.textContent = labelReset.dataset['original'] ?? 'Copy';
      }
      this.copyStateTimers.delete(button);
    }, 2000);

    this.copyStateTimers.set(button, timer);
  }

  private setupScrollProgress() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const update = () => this.updateReadingProgress();

    fromEvent(window, 'scroll')
      .pipe(throttleTime(120, undefined, { leading: true, trailing: true }), takeUntilDestroyed(this.destroyRef))
      .subscribe(update);

    fromEvent(window, 'resize')
      .pipe(throttleTime(250, undefined, { leading: true, trailing: true }), takeUntilDestroyed(this.destroyRef))
      .subscribe(update);

    this.updateReadingProgress();
  }

  private updateReadingProgress() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const doc = this.document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const scrollHeight = doc.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;
    this.readingProgress.set(Number(progress.toFixed(3)));
  }

  private ensureLazyLoading() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const images = Array.from(this.document.querySelectorAll('img')) as HTMLImageElement[];
    images.forEach((img) => {
      if (img.dataset['priority'] === 'true') {
        return;
      }
      if (img.loading !== 'lazy') {
        img.loading = 'lazy';
      }
      if (!img.decoding || img.decoding === 'auto') {
        img.decoding = 'async';
      }
    });
  }

  private observeRevealElements() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initIntersectionObserver();

    const targets = Array.from(
      this.document.querySelectorAll<HTMLElement>('[data-animate="fade"], .blog-card')
    );

    targets.forEach((element) => {
      if (element.dataset['observed'] === 'true') {
        return;
      }

      element.dataset['observed'] = 'true';
      element.classList.add('reveal');
      this.intersectionObserver?.observe(element);
    });
  }

  private initIntersectionObserver() {
    if (this.intersectionObserver || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.intersectionObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              target.classList.add('is-visible');
              observer.unobserve(target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -10% 0px',
        }
      );
    });
  }
}
