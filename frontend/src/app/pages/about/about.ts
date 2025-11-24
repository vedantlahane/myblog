import { Component, OnInit, inject, signal } from '@angular/core';
import {  } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [ RouterLink],
  template: `
    <div class="min-h-screen bg-ui-background py-12">
      <header class="mx-auto max-w-5xl rounded-3xl border border-ui-border bg-ui-surface px-6 py-16 text-center shadow-sm">
        <div class="inline-flex items-center rounded-full bg-brand-blue/10 px-6 py-2 text-sm font-mono uppercase tracking-[0.35em] text-brand-blue">
            About Xandar
        </div>

        <h1 class="mt-6 text-4xl font-semibold leading-tight text-text-primary md:text-5xl">
          A Digital Chronicle
          <span class="block text-3xl font-semibold text-brand-blue md:text-4xl">of Modern Life</span>
        </h1>

        <p class="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-text-secondary italic">
          "In the age of fleeting tweets and disappearing stories, we believe in the enduring power of thoughtful writing and meaningful discourse."
        </p>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-10 text-sm font-mono text-text-secondary">
          <div class="text-center">
            <div class="text-3xl font-bold text-text-primary">{{ currentYear - 2024 }}+</div>
            <div>Years Active</div>
          </div>
          <span aria-hidden="true" class="text-text-secondary/60">•</span>
          <div class="text-center">
            <div class="text-3xl font-bold text-text-primary">{{ totalArticles() }}</div>
            <div>Articles Published</div>
          </div>
          <span aria-hidden="true" class="text-text-secondary/60">•</span>
          <div class="text-center">
            <div class="text-3xl font-bold text-text-primary">{{ totalReaders() }}</div>
            <div>Happy Readers</div>
          </div>
        </div>
      </header>

      <section class="mx-auto mt-16 max-w-5xl rounded-3xl border border-ui-border bg-ui-surface p-8 shadow-sm">
        <h2 class="mb-8 text-center text-3xl font-semibold text-text-primary">Our Story</h2>
        <div class="grid gap-8 md:grid-cols-2 md:items-center">
          <div class="space-y-6 text-left text-text-secondary">
            <p class="text-lg">
                Xandar was born from a simple belief: <strong class="text-text-primary">great ideas deserve great presentation</strong>. In an era of information overload, we wanted to create a space where thoughts could breathe, where stories could unfold naturally, and where readers could truly connect with content.
            </p>
            <p>
              Founded in <strong class="text-text-primary">2024</strong>, our platform combines the timeless appeal of traditional print media with the accessibility and interactivity of modern web technology. Every element, from our typography to our carefully curated color palette, reflects our commitment to thoughtful design.
            </p>
            <p>
              We believe that <em class="text-text-primary">good writing transcends trends</em>, and that the best conversations happen when people take time to really think about what they want to say.
            </p>
          </div>

          <div class="rounded-2xl border border-ui-border bg-ui-background p-8 text-center shadow-sm">
            <div class="mb-4 text-6xl">📖</div>
            <blockquote class="mb-4 text-lg font-medium leading-relaxed text-text-primary">
              "The best way to find out if you can trust somebody is to trust them."
            </blockquote>
            <cite class="text-sm font-mono uppercase tracking-wide text-text-secondary">— Our founding principle</cite>
          </div>
        </div>
      </section>

      <section class="mx-auto mt-16 max-w-5xl grid gap-8 md:grid-cols-2">
        <div class="rounded-3xl border border-ui-border bg-ui-surface p-8 shadow-sm">
          <h3 class="mb-6 text-center text-2xl font-semibold text-text-primary">Our Mission</h3>
          <div class="rounded-2xl border border-dashed border-ui-border/80 bg-ui-background p-6 text-center text-lg leading-relaxed text-text-secondary italic">
            To provide a platform where quality writing thrives, meaningful conversations flourish, and every voice has the opportunity to contribute to the greater dialogue of human experience.
          </div>
          <div class="mt-6 space-y-4 text-sm font-mono text-text-secondary">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-3 w-3 rotate-45 rounded-sm bg-brand-blue"></span>
              <span>Promote thoughtful discourse</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="inline-flex h-3 w-3 rotate-45 rounded-sm bg-brand-blue"></span>
              <span>Celebrate quality over quantity</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="inline-flex h-3 w-3 rotate-45 rounded-sm bg-brand-blue"></span>
              <span>Foster genuine community</span>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-ui-border bg-ui-surface p-8 shadow-sm">
          <h3 class="mb-6 text-center text-2xl font-semibold text-text-primary">Our Values</h3>
          <div class="space-y-6">
            <div class="border-l-4 border-brand-blue/50 pl-4">
              <h4 class="mb-2 text-lg font-semibold text-text-primary">Authenticity</h4>
              <p class="text-sm leading-relaxed text-text-secondary">We believe in genuine voices and honest perspectives.</p>
            </div>
            <div class="border-l-4 border-brand-blue/50 pl-4">
              <h4 class="mb-2 text-lg font-semibold text-text-primary">Quality</h4>
              <p class="text-sm leading-relaxed text-text-secondary">Every piece of content is crafted with care and attention to detail.</p>
            </div>
            <div class="border-l-4 border-brand-blue/50 pl-4">
              <h4 class="mb-2 text-lg font-semibold text-text-primary">Community</h4>
              <p class="text-sm leading-relaxed text-text-secondary">We're building connections, not just collecting clicks.</p>
            </div>
            <div class="border-l-4 border-brand-blue/50 pl-4">
              <h4 class="mb-2 text-lg font-semibold text-text-primary">Timelessness</h4>
              <p class="text-sm leading-relaxed text-text-secondary">We focus on ideas that matter beyond the news cycle.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto mt-16 max-w-5xl rounded-3xl border border-ui-border bg-ui-surface p-8 shadow-sm">
        <h2 class="mb-8 text-center text-3xl font-semibold text-text-primary">What We Write About</h2>
        <div class="grid gap-6 md:grid-cols-3">
          <div class="rounded-2xl border border-ui-border bg-ui-background p-6 text-center shadow-sm">
            <div class="mb-4 text-4xl">💭</div>
            <h3 class="mb-2 text-xl font-semibold text-text-primary">Thoughts & Ideas</h3>
            <p class="text-sm leading-relaxed text-text-secondary">Deep dives into concepts that shape our world and challenge our assumptions.</p>
          </div>
          <div class="rounded-2xl border border-ui-border bg-ui-background p-6 text-center shadow-sm">
            <div class="mb-4 text-4xl">🛠️</div>
            <h3 class="mb-2 text-xl font-semibold text-text-primary">Technology</h3>
            <p class="text-sm leading-relaxed text-text-secondary">Exploring how technology shapes human experience and creative expression.</p>
          </div>
          <div class="rounded-2xl border border-ui-border bg-ui-background p-6 text-center shadow-sm">
            <div class="mb-4 text-4xl">🌱</div>
            <h3 class="mb-2 text-xl font-semibold text-text-primary">Personal Growth</h3>
            <p class="text-sm leading-relaxed text-text-secondary">Stories of learning, growth, and the ongoing journey of becoming our best selves.</p>
          </div>
        </div>
        <p class="mt-8 text-center text-text-secondary italic">
          And anything else that sparks curiosity and invites thoughtful discussion.
        </p>
      </section>

      <section class="mx-auto mt-16 max-w-5xl rounded-3xl bg-brand-navy p-8 text-white shadow-md">
  <h2 class="mb-8 text-center text-3xl font-semibold">Why Xandar is Different</h2>
        <div class="grid gap-8 md:grid-cols-2">
          <div class="space-y-6">
            <div>
              <h3 class="mb-3 text-xl font-semibold text-white">Design That Matters</h3>
              <p class="text-sm leading-relaxed text-white/80">
                Our modern design is intentional. We slow down the reading experience, encourage deeper engagement, and create a space that feels focused and energising.
              </p>
            </div>
            <div>
              <h3 class="mb-3 text-xl font-semibold text-white">Quality Over Quantity</h3>
              <p class="text-sm leading-relaxed text-white/80">
                We don't chase viral content or breaking news. Instead, we focus on pieces that will be just as relevant and interesting a year from now as they are today.
              </p>
            </div>
          </div>
          <div class="space-y-6">
            <div>
              <h3 class="mb-3 text-xl font-semibold text-white">Community First</h3>
              <p class="text-sm leading-relaxed text-white/80">
                Every feature we build is designed to foster genuine connection. Our comment system encourages thoughtful discussion, and our curation process ensures every piece adds value to the conversation.
              </p>
            </div>
            <div>
              <h3 class="mb-3 text-xl font-semibold text-white">Technology as a Tool</h3>
              <p class="text-sm leading-relaxed text-white/80">
                We leverage modern technology to enhance the reading experience, not distract from it. Fast loading, clean code, and intuitive navigation—all in service of great content.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto mt-16 max-w-5xl rounded-3xl border border-ui-border bg-ui-surface p-8 text-center shadow-sm">
        <h2 class="mb-6 text-3xl font-semibold text-text-primary">Join Our Community</h2>
        <p class="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-text-secondary">
          Xandar is more than a platform—it's a community of curious minds, thoughtful writers, and engaged readers who believe in the power of meaningful conversation.
        </p>

        @if (!isAuthenticated()) {
          <div class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <a
                routerLink="/auth/register"
                class="btn-primary px-8 py-4 text-sm uppercase tracking-wide"
              >
                Start Writing Today
              </a>
              <a
                routerLink="/archive"
                class="btn-secondary px-8 py-4 text-sm uppercase tracking-wide"
              >
                Browse Articles
              </a>
            </div>
            <p class="text-sm font-mono text-text-secondary">
              Already have an account?
              <a routerLink="/auth/login" class="font-semibold text-brand-blue hover:text-brand-blue/80">Sign in here</a>
            </p>
          </div>
        } @else {
          <div class="space-y-4">
            <p class="text-lg leading-relaxed text-text-secondary">
              Welcome to the community! Ready to share your thoughts with the world?
            </p>
            <div class="grid gap-4 md:grid-cols-2">
              <a
                routerLink="/write"
                class="btn-primary px-8 py-4 text-sm uppercase tracking-wide"
              >
                Write New Article
              </a>
              <a
                routerLink="/profile"
                class="btn-secondary px-8 py-4 text-sm uppercase tracking-wide"
              >
                View Your Profile
              </a>
            </div>
          </div>
        }
      </section>

      <section class="mx-auto mt-16 max-w-5xl grid gap-8 md:grid-cols-2">
        <div class="rounded-3xl border border-ui-border bg-ui-surface p-8 shadow-sm">
          <h3 class="mb-6 text-center text-2xl font-semibold text-text-primary">Get in Touch</h3>
          <div class="space-y-4 text-left text-text-secondary">
            <div class="flex items-start gap-3">
              <svg class="h-5 w-5 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              <div>
                <div class="font-mono text-xs uppercase tracking-wide text-text-secondary">Email</div>
                <a href="mailto:hello@Xandar.com" class="text-brand-blue hover:text-brand-blue/80">hello&#64;Xandar.com</a>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <svg class="h-5 w-5 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <div class="font-mono text-xs uppercase tracking-wide text-text-secondary">Website</div>
                <span class="text-text-primary">www.Xandar.com</span>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <svg class="h-5 w-5 text-brand-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <div class="font-mono text-xs uppercase tracking-wide text-text-secondary">Location</div>
                <span class="text-text-primary">Everywhere &amp; Nowhere</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-ui-border bg-ui-surface p-8 shadow-sm">
          <h3 class="mb-6 text-center text-2xl font-semibold text-text-primary">Quick Questions</h3>
          <div class="space-y-4 text-left">
            <div>
              <h4 class="mb-2 text-lg font-semibold text-text-primary">Can anyone write for Xandar?</h4>
              <p class="text-sm leading-relaxed text-text-secondary">Absolutely! Create an account and start sharing your thoughts with our community.</p>
            </div>
            <div>
              <h4 class="mb-2 text-lg font-semibold text-text-primary">Is Xandar free?</h4>
              <p class="text-sm leading-relaxed text-text-secondary">Yes, creating an account and reading articles is completely free. Always.</p>
            </div>
            <div>
              <h4 class="mb-2 text-lg font-semibold text-text-primary">How do you choose featured articles?</h4>
              <p class="text-sm leading-relaxed text-text-secondary">We look for quality writing, unique perspectives, and content that sparks meaningful discussion.</p>
            </div>
            <div>
              <h4 class="mb-2 text-lg font-semibold text-text-primary">Can I customize my profile?</h4>
              <p class="text-sm leading-relaxed text-text-secondary">Of course! Add a bio, upload an avatar, and make your profile uniquely yours.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: []
})
export class AboutComponent implements OnInit {
  private apiService = inject(ApiService);

  // Reactive Signals
  totalArticles = signal(0);
  totalReaders = signal(1250); // Can be made dynamic
  
  // Current year for stats
  currentYear = new Date().getFullYear();

  async ngOnInit() {
    await this.loadStats();
  }

  private async loadStats() {
    try {
      // Load total articles count
      const response = await this.apiService.getPosts({
        status: 'published',
        limit: 1,
        dateTo: '',
        dateFrom: ''
      });
      this.totalArticles.set(response.totalPosts || 0);
      
      // In a real app, you might also load user count, etc.
      // For now, we'll use static numbers that look good
      this.totalReaders.set(Math.max(1250, this.totalArticles() * 15));
      
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Fallback to reasonable defaults
      this.totalArticles.set(42);
      this.totalReaders.set(1250);
    }
  }

  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }
}
