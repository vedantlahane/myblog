import {  } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [, RouterLink],
  host: {
    class: 'block',
  },
  template: `
    <footer class="mt-12 border-t border-border-default bg-surface py-12 transition-colors duration-200 dark:border-border-dark dark:bg-surface-dark">
      <div class="mx-auto grid w-full max-w-6xl gap-10 px-4 md:grid-cols-[2fr,1fr] md:px-6">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <img src="/mw-logo.svg" alt="Xandar" class="h-10 w-10 rounded-full object-cover shadow-card border border-transparent" style="box-shadow: var(--glow-violet), var(--shadow-card);" />
            <div>
              <p class="text-sm font-semibold text-text-primary dark:text-white">{{ blogTitle }}</p>
              <p class="text-xs text-text-secondary dark:text-slate-300">{{ blogTagline }}</p>
            </div>
          </div>
          <p class="max-w-xl text-sm text-text-secondary dark:text-slate-300">
            {{ description }}
          </p>
          <div class="flex flex-wrap items-center gap-3 text-xs text-text-secondary dark:text-slate-400">
            <a routerLink="/privacy" class="transition-colors duration-200 hover:text-brand-blue dark:hover:text-brand-accent">Privacy</a>
            <span aria-hidden="true">•</span>
            <a routerLink="/terms" class="transition-colors duration-200 hover:text-brand-blue dark:hover:text-brand-accent">Terms</a>
            <span aria-hidden="true">•</span>
            <a [href]="contactHref" class="transition-colors duration-200 hover:text-brand-blue dark:hover:text-brand-accent">Contact</a>
          </div>
          <p class="text-xs text-text-secondary dark:text-slate-400">&copy; {{ currentYear }} {{ blogTitle }} — Crafted for minimal distraction and maximum clarity.</p>
        </div>

        <div class="space-y-4">
          <p class="text-sm font-semibold text-text-primary dark:text-white">Stay in the loop</p>
          <p class="text-xs text-text-secondary dark:text-slate-300">Get weekly digests of our latest thinking, deep-dives, and learning roadmaps.</p>
          <form class="flex flex-col gap-3 md:flex-row md:items-center" (submit)="$event.preventDefault()" novalidate>
            <label class="sr-only" for="newsletter-email">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              class="w-full flex-1 rounded-xl border border-border-default bg-surface px-4 py-3 text-sm text-text-primary transition-colors duration-200 placeholder:text-text-secondary/70 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 dark:border-border-dark dark:bg-surface-dark dark:text-white"
              placeholder="you@example.com"
              autocomplete="email"
            />
            <button
              type="submit"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent-gold px-5 py-3 text-sm font-semibold uppercase tracking-wide text-brand-navy transition-all duration-200 hover:bg-brand-accent-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-gold/30"
            >
              Subscribe
            </button>
          </form>
          <div class="flex items-center gap-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener"
              aria-label="Twitter"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-default text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-border-dark dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-brand-accent"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M22 5.92c-.77.35-1.6.58-2.47.69a4.27 4.27 0 0 0 1.88-2.35 8.4 8.4 0 0 1-2.69 1.04 4.22 4.22 0 0 0-7.19 3.85 12 12 0 0 1-8.7-4.41 4.2 4.2 0 0 0 1.3 5.62 4.19 4.19 0 0 1-1.9-.53v.05a4.23 4.23 0 0 0 3.39 4.14 4.27 4.27 0 0 1-1.89.07 4.23 4.23 0 0 0 3.95 2.93A8.48 8.48 0 0 1 2 19.54 12 12 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53A8.33 8.33 0 0 0 22 5.92Z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener"
              aria-label="GitHub"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-default text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-border-dark dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-brand-accent"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19c-4 1-4-2-6-2m12 4v-3.87a3.37 3.37 0 0 0-.94-2.6c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 18 4.77a5.07 5.07 0 0 0-.09-3.77S16.73 .65 13 2.48a13.38 13.38 0 0 0-7 0C2.27 .65 1.1 1 1.1 1A5.07 5.07 0 0 0 1 4.77 5.44 5.44 0 0 0 0 8.53c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.6V22" />
              </svg>
            </a>
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noopener"
              aria-label="Dribbble"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-default text-text-secondary transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 dark:border-border-dark dark:text-slate-200 dark:hover:border-brand-accent dark:hover:text-brand-accent"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="9" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.7 19.4C14.5 15.6 12 11.9 8.2 8.8M19.1 14.6c-2.5-.6-5.2-.4-8 .7M4.9 9.4a13.7 13.7 0 0 1 6.5 1.5m2.7-6.7c-1.3 1.8-3.5 3.6-6.6 5.2" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  @Input({ required: true }) blogTitle!: string;
  @Input({ required: true }) blogTagline!: string;
  @Input({ required: true }) description!: string;
  @Input({ required: true }) currentYear!: number;
  @Input() contactEmail = 'hello@Xandar.com';

  get contactHref(): string {
    return `mailto:${this.contactEmail}`;
  }
}
