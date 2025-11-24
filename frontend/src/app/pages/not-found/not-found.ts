import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25 flex items-center justify-center">
      <div class="max-w-2xl mx-auto px-4 text-center">
        <!-- 404 Card -->
        <div class="bg-amber-50 border-4 border-amber-800 p-8 mb-8 shadow-2xl">
          <!-- Vintage Header -->
          <div class="border-2 border-dotted border-amber-700 p-6 mb-8">
            <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
              Error 404
            </div>
            
            <!-- Large 404 -->
            <div class="text-8xl md:text-9xl font-serif font-bold text-amber-900 mb-4 leading-none">
              404
            </div>
            
            <h1 class="font-serif text-2xl md:text-3xl font-bold text-amber-900 mb-3">
              Page Not Found
            </h1>
            
            <p class="text-amber-700 font-mono text-sm">
              This page seems to have wandered off like a lost newsletter...
            </p>
          </div>

          <!-- Error Message -->
          <div class="mb-8">
            <div class="bg-red-50 border-4 border-red-300 p-6 mb-6">
              <h2 class="font-serif text-xl font-bold text-red-900 mb-3">
                📰 Missing Article Alert!
              </h2>
              <p class="text-red-800 leading-relaxed mb-4">
                The page you're looking for couldn't be found in our newspaper archives. 
                It might have been moved, deleted, or the URL might be incorrect.
              </p>
              @if (requestedUrl) {
                <div class="bg-red-100 border-2 border-red-400 p-3 mt-4">
                  <p class="text-red-900 font-mono text-sm break-all">
                    <strong>Requested URL:</strong> {{ requestedUrl }}
                  </p>
                </div>
              }
            </div>
          </div>

          <!-- Helpful Actions -->
          <div class="space-y-6">
            <!-- Primary Actions -->
            <div class="grid md:grid-cols-2 gap-4">
              <a 
                routerLink="/"
                class="block bg-amber-800 text-amber-100 py-4 px-6 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 text-center"
              >
                <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Back to Home
              </a>
              
              <button 
                (click)="goBack()"
                class="block bg-amber-200 text-amber-800 py-4 px-6 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400 text-center"
              >
                <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11H16a1 1 0 110 2H2.586l3.707 3.707a1 1 0 01-1.414 1.414l-5.414-5.414a1 1 0 010-1.414l5.414-5.414a1 1 0 011.414 1.414L2.586 9H16a1 1 0 110 2H7.707z" clip-rule="evenodd"></path>
                </svg>
                Go Back
              </button>
            </div>

            <!-- Search Option -->
            <div class="bg-blue-50 border-4 border-blue-300 p-6">
              <h3 class="font-serif text-lg font-bold text-blue-900 mb-3">
                🔍 Search Our Archives
              </h3>
              <p class="text-blue-800 text-sm mb-4">
                Can't find what you're looking for? Try searching our blog archives.
              </p>
              <a 
                routerLink="/search"
                class="inline-block bg-blue-600 text-blue-100 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-blue-700 transition-colors border-2 border-blue-700"
              >
                Search Motherworld
              </a>
            </div>

            <!-- Helpful Links -->
            <div class="bg-amber-100 border-4 border-amber-400 p-6">
              <h3 class="font-serif text-lg font-bold text-amber-900 mb-4">
                📚 Popular Destinations
              </h3>
              
              <div class="grid md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <a 
                    routerLink="/archive"
                    class="block text-amber-800 hover:text-amber-600 font-mono text-sm transition-colors"
                  >
                    → Browse All Articles
                  </a>
                  <a 
                    routerLink="/bookmarks"
                    class="block text-amber-800 hover:text-amber-600 font-mono text-sm transition-colors"
                  >
                    → My Bookmarks
                  </a>
                  <a 
                    routerLink="/collections"
                    class="block text-amber-800 hover:text-amber-600 font-mono text-sm transition-colors"
                  >
                    → Article Collections
                  </a>
                </div>
                
                <div class="space-y-3">
                  <a 
                    routerLink="/write"
                    class="block text-amber-800 hover:text-amber-600 font-mono text-sm transition-colors"
                  >
                    → Write New Article
                  </a>
                  <a 
                    routerLink="/profile"
                    class="block text-amber-800 hover:text-amber-600 font-mono text-sm transition-colors"
                  >
                    → My Profile
                  </a>
                  <a 
                    routerLink="/settings"
                    class="block text-amber-800 hover:text-amber-600 font-mono text-sm transition-colors"
                  >
                    → Account Settings
                  </a>
                </div>
              </div>
            </div>

            <!-- Report Issue -->
            <div class="bg-yellow-50 border-4 border-yellow-300 p-6">
              <h3 class="font-serif text-lg font-bold text-yellow-900 mb-3">
                🐛 Found a Broken Link?
              </h3>
              <p class="text-yellow-800 text-sm mb-4">
                If you think this page should exist or you found a broken link, please let us know!
              </p>
              <div class="flex gap-3 justify-center">
                <a 
                  href="mailto:support@Motherworld.com?subject=404 Error Report&body=I found a broken link at: {{ requestedUrl }}"
                  class="inline-block bg-yellow-600 text-yellow-100 px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-yellow-700 transition-colors border-2 border-yellow-700"
                >
                  Report Issue
                </a>
                
                <button 
                  (click)="copyUrl()"
                  class="inline-block bg-yellow-200 text-yellow-800 px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-yellow-300 transition-colors border-2 border-yellow-400"
                >
                  {{ copied ? 'Copied!' : 'Copy URL' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Fun 404 Messages -->
          <div class="mt-8 p-6 bg-green-50 border-4 border-green-300">
            <h3 class="font-serif text-lg font-bold text-green-900 mb-3">
              💭 Meanwhile, Here's a Random Thought...
            </h3>
            <p class="text-green-800 italic text-center">
              "{{ randomMessage }}"
            </p>
            <button 
              (click)="getRandomMessage()"
              class="mt-3 text-green-600 hover:text-green-800 font-mono text-xs underline"
            >
              Get another random thought →
            </button>
          </div>

          <!-- Social Links -->
          <div class="mt-8 pt-6 border-t-2 border-dotted border-amber-400">
            <p class="text-amber-700 font-mono text-sm mb-4">
              Follow us while you're here:
            </p>
            <div class="flex justify-center gap-4">
              <a 
                href="#"
                class="w-10 h-10 bg-blue-100 text-blue-800 flex items-center justify-center hover:bg-blue-200 transition-colors border-2 border-blue-300"
                title="Follow on Twitter"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              
              <a 
                href="#"
                class="w-10 h-10 bg-gray-100 text-gray-800 flex items-center justify-center hover:bg-gray-200 transition-colors border-2 border-gray-300"
                title="Follow on GitHub"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"></path>
                </svg>
              </a>
              
              <a 
                href="#"
                class="w-10 h-10 bg-red-100 text-red-800 flex items-center justify-center hover:bg-red-200 transition-colors border-2 border-red-300"
                title="Subscribe to RSS"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.429 2.776c9.208 0 16.667 7.462 16.667 16.667h-3.333c0-7.364-5.97-13.333-13.334-13.333V2.776zM3.429 9.109c5.515 0 9.984 4.47 9.984 9.984H10.08c0-3.682-2.986-6.667-6.651-6.667V9.109zM6.762 15.443a1.667 1.667 0 11-3.333 0 1.667 1.667 0 013.333 0z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Additional Help -->
        <div class="text-center">
          <p class="text-amber-600 font-mono text-sm mb-4">
            Still lost? Our support team is here to help!
          </p>
          <a 
            href="mailto:support@Motherworld.com"
            class="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-mono text-sm transition-colors"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Vintage paper texture */
    .bg-amber-50 {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.03) 0%, transparent 50%);
    }

    /* Large 404 number with vintage styling */
    .text-8xl, .text-9xl {
      text-shadow: 4px 4px 0px rgba(146, 64, 14, 0.3);
      line-height: 0.8;
    }

    /* Hover effects for links */
    a {
      transition: all 0.2s ease-in-out;
    }

    /* Button hover effects */
    button:hover {
      transform: translateY(-1px);
    }

    /* Social icon hover effects */
    .w-10:hover {
      transform: scale(1.1);
    }

    /* Animation for copy feedback */
    .copied {
      animation: copied 2s ease-out;
    }

    @keyframes copied {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `]
})
export class NotFoundComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  requestedUrl = '';
  copied = false;
  randomMessage = '';

  private funMessages = [
    "The best stories are found when you're not looking for them.",
    "Every writer was once a reader who refused to put down the pen.",
    "In a world of endless scrolling, be someone worth stopping for.",
    "The internet is vast, but good content is timeless.",
    "Sometimes the journey is more interesting than the destination.",
    "A blank page is just potential waiting to be unleashed.",
    "Every expert was once a beginner who refused to give up.",
    "The best blogs feel like conversations with old friends.",
    "Words have power. Use them wisely, use them well.",
    "Every click is a choice. Thank you for choosing to be here.",
    "Behind every great blog is a writer who believed in their story.",
    "The internet needs more genuine voices. Be one of them.",
  ];

  ngOnInit() {
    // Get the current URL that wasn't found
    this.requestedUrl = window.location.href;
    
    // Set a random message
    this.getRandomMessage();
  }

  goBack() {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, go to home
      this.router.navigate(['/']);
    }
  }

  getRandomMessage() {
    const randomIndex = Math.floor(Math.random() * this.funMessages.length);
    this.randomMessage = this.funMessages[randomIndex];
  }

  copyUrl() {
    navigator.clipboard.writeText(this.requestedUrl).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = this.requestedUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      } catch (err) {
        console.error('Could not copy URL');
      }
      document.body.removeChild(textArea);
    });
  }
}
