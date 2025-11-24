import { , DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, OnInit, AfterViewInit, PLATFORM_ID, Renderer2, inject, signal, NgZone, effect } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, fromEvent, throttleTime } from 'rxjs';

import { ApiService } from './services/api.service';
import { User } from '../types/api';
import { SiteHeaderComponent, NavLink } from './ui/layout/header';
import { SiteFooterComponent } from './ui/layout/footer.ts';
import { ReadingProgressComponent } from './ui/common/reading-progress.component';
type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [, RouterOutlet, SiteHeaderComponent, SiteFooterComponent, ReadingProgressComponent],
  template: `
    <div class="app-shell min-h-screen" [attr.data-theme]="theme()">
      <app-reading-progress [progress]="readingProgress()"></app-reading-progress>
      <a href="#main-content" class="skip-link sr-only focus-visible:not-sr-only">Skip to main content</a>

      <app-site-header
        [blogTitle]="blogTitle"
        [blogSubtitle]="blogSubtitle"
        [primaryNav]="primaryNav"
        [userNav]="userNav"
        [isAuthenticated]="isAuthenticated()"
        [currentUser]="currentUser()"
        [theme]="theme()"
        [mobileNavOpen]="mobileNavOpen()"
        [showUserMenu]="showUserMenu()"
        (themeToggle)="toggleTheme()"
        (menuToggle)="toggleMobileNav()"
        (menuClose)="closeMobileNav()"
        (userMenuToggle)="toggleUserMenu()"
        (userMenuClose)="closeUserMenu()"
        (logout)="logout()"
      ></app-site-header>

      <main id="main-content" class="app-main">
        <div class="container-responsive app-main__inner">
          <router-outlet></router-outlet>
        </div>
      </main>

      <app-site-footer
        [blogTitle]="blogTitle"
        [blogTagline]="blogSubtitle"
        [description]="footerDescription"
        [currentYear]="currentYear"
      ></app-site-footer>
    </div>

    @if (showUserMenu()) {
      <div class="user-menu__backdrop" (click)="closeUserMenu()" aria-hidden="true"></div>
    }
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--surface-muted);
      color: var(--body);
    }

    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--surface-muted);
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
      background: var(--primary);
      color: var(--surface);
      font-weight: 600;
      transition: transform var(--transition-base);
      z-index: 80;
    }

    .skip-link:focus-visible {
      transform: translate(-50%, 0);
    }

    .app-main {
      flex: 1 1 auto;
    }

    .app-main__inner {
      padding-block: clamp(2.5rem, 6vw, 3.75rem);
    }

    .user-menu__backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: transparent;
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

  readonly blogTitle = 'Xandar';
  readonly blogSubtitle = 'Personal learning journal';
  readonly footerDescription = 'Xandar is a progressive library of ideas, tutorials, and experiments designed to guide you from curiosity to mastery—one focused insight at a time.';
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

  private readonly themeStorageKey = 'Xandar:theme';
  private readonly copyStateTimers = new Map<HTMLButtonElement, number>();

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
    this.setupAuthStateListener();
  }

  private initializeTheme() {
    const root = this.document?.documentElement;
    if (!root) {
      return;
    }

  let preferred: ThemeMode = 'dark';

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
    const tokenSignal = toSignal(this.apiService.token$ as any, { initialValue: null as string | null });
    effect(() => {
      const token = tokenSignal();
      if (!token) {
        this.currentUser.set(null);
        this.showUserMenu.set(false);
      }
    });
  }

  private setupRouterListeners() {
    const navSignal = toSignal(this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)) as any, { initialValue: null as any });
    effect(() => {
      if (navSignal()) {
        this.mobileNavOpen.set(false);
        this.showUserMenu.set(false);
        this.scheduleUiEnhancements();
        if (isPlatformBrowser(this.platformId)) {
          this.ngZone.runOutsideAngular(() => window.requestAnimationFrame(() => this.updateReadingProgress()));
        }
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
