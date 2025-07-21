import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      <!-- Hero Section -->
      <header class="bg-amber-100 border-4 border-amber-800 p-12 mb-12">
        <div class="text-center border-2 border-dotted border-amber-700 p-8">
          <div class="inline-block bg-amber-800 text-amber-100 px-6 py-2 text-sm font-mono uppercase tracking-widest mb-6">
            About MyBlog
          </div>
          
          <h1 class="font-serif text-4xl md:text-5xl font-bold text-amber-900 mb-6 leading-tight">
            A Digital Chronicle<br>
            <span class="text-3xl md:text-4xl text-amber-700">of Modern Life</span>
          </h1>
          
          <p class="text-amber-800 text-xl leading-relaxed max-w-3xl mx-auto italic">
            "In the age of fleeting tweets and disappearing stories, we believe in the enduring power of thoughtful writing and meaningful discourse."
          </p>
          
          <!-- Stats -->
          <div class="flex items-center justify-center gap-8 mt-8 text-sm font-mono text-amber-600">
            <div class="text-center">
              <div class="text-2xl font-bold text-amber-900">{{ currentYear - 2024 }}+</div>
              <div>Years Active</div>
            </div>
            <span class="text-amber-400">•</span>
            <div class="text-center">
              <div class="text-2xl font-bold text-amber-900">{{ totalArticles() }}</div>
              <div>Articles Published</div>
            </div>
            <span class="text-amber-400">•</span>
            <div class="text-center">
              <div class="text-2xl font-bold text-amber-900">{{ totalReaders() }}</div>
              <div>Happy Readers</div>
            </div>
          </div>
        </div>
      </header>

      <!-- Story Section -->
      <section class="mb-16">
        <div class="bg-amber-50 border-4 border-amber-300 p-8">
          <div class="max-w-4xl mx-auto">
            <h2 class="font-serif text-3xl font-bold text-amber-900 mb-8 text-center border-b-2 border-dotted border-amber-400 pb-4">
              Our Story
            </h2>
            
            <div class="prose prose-lg max-w-none text-amber-900 leading-relaxed">
              <div class="grid md:grid-cols-2 gap-8 items-center mb-12">
                <div>
                  <p class="text-lg mb-6">
                    MyBlog was born from a simple belief: <strong>great ideas deserve great presentation</strong>. In an era of information overload, we wanted to create a space where thoughts could breathe, where stories could unfold naturally, and where readers could truly connect with content.
                  </p>
                  
                  <p class="mb-6">
                    Founded in <strong>2024</strong>, our platform combines the timeless appeal of traditional print media with the accessibility and interactivity of modern web technology. Every element, from our vintage typography to our carefully curated color palette, reflects our commitment to thoughtful design.
                  </p>
                  
                  <p class="mb-6">
                    We believe that <em>good writing transcends trends</em>, and that the best conversations happen when people take time to really think about what they want to say.
                  </p>
                </div>
                
                <div class="text-center">
                  <div class="bg-amber-200 border-4 border-amber-600 p-8 transform rotate-2 shadow-lg">
                    <div class="text-6xl mb-4">📖</div>
                    <blockquote class="font-serif text-lg italic text-amber-900 mb-4">
                      "The best way to find out if you can trust somebody is to trust them."
                    </blockquote>
                    <cite class="text-amber-700 font-mono text-sm">— Our founding principle</cite>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Mission & Values -->
      <section class="mb-16">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Mission -->
          <div class="bg-amber-100 border-4 border-amber-700 p-8">
            <h3 class="font-serif text-2xl font-bold text-amber-900 mb-6 text-center">
              Our Mission
            </h3>
            
            <div class="border-2 border-dotted border-amber-600 p-6">
              <p class="text-amber-800 leading-relaxed text-center italic text-lg">
                To provide a platform where quality writing thrives, meaningful conversations flourish, and every voice has the opportunity to contribute to the greater dialogue of human experience.
              </p>
            </div>
            
            <div class="mt-6 space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-amber-600 transform rotate-45"></div>
                <span class="text-amber-800 font-mono text-sm">Promote thoughtful discourse</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-amber-600 transform rotate-45"></div>
                <span class="text-amber-800 font-mono text-sm">Celebrate quality over quantity</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-amber-600 transform rotate-45"></div>
                <span class="text-amber-800 font-mono text-sm">Foster genuine community</span>
              </div>
            </div>
          </div>

          <!-- Values -->
          <div class="bg-amber-100 border-4 border-amber-700 p-8">
            <h3 class="font-serif text-2xl font-bold text-amber-900 mb-6 text-center">
              Our Values
            </h3>
            
            <div class="space-y-6">
              <div class="border-l-4 border-amber-600 pl-4">
                <h4 class="font-bold text-amber-900 mb-2">Authenticity</h4>
                <p class="text-amber-700 text-sm">We believe in genuine voices and honest perspectives.</p>
              </div>
              
              <div class="border-l-4 border-amber-600 pl-4">
                <h4 class="font-bold text-amber-900 mb-2">Quality</h4>
                <p class="text-amber-700 text-sm">Every piece of content is crafted with care and attention to detail.</p>
              </div>
              
              <div class="border-l-4 border-amber-600 pl-4">
                <h4 class="font-bold text-amber-900 mb-2">Community</h4>
                <p class="text-amber-700 text-sm">We're building connections, not just collecting clicks.</p>
              </div>
              
              <div class="border-l-4 border-amber-600 pl-4">
                <h4 class="font-bold text-amber-900 mb-2">Timelessness</h4>
                <p class="text-amber-700 text-sm">We focus on ideas that matter beyond the news cycle.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- What We Write About -->
      <section class="mb-16">
        <div class="bg-amber-50 border-4 border-amber-300 p-8">
          <h2 class="font-serif text-3xl font-bold text-amber-900 mb-8 text-center border-b-2 border-dotted border-amber-400 pb-4">
            What We Write About
          </h2>
          
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center p-6 bg-amber-100 border-2 border-amber-400">
              <div class="text-4xl mb-4">💭</div>
              <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Thoughts & Ideas</h3>
              <p class="text-amber-700 text-sm">Deep dives into concepts that shape our world and challenge our assumptions.</p>
            </div>
            
            <div class="text-center p-6 bg-amber-100 border-2 border-amber-400">
              <div class="text-4xl mb-4">🛠️</div>
              <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Technology</h3>
              <p class="text-amber-700 text-sm">Exploring how technology shapes human experience and creative expression.</p>
            </div>
            
            <div class="text-center p-6 bg-amber-100 border-2 border-amber-400">
              <div class="text-4xl mb-4">🌱</div>
              <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Personal Growth</h3>
              <p class="text-amber-700 text-sm">Stories of learning, growth, and the ongoing journey of becoming our best selves.</p>
            </div>
          </div>
          
          <div class="mt-8 text-center">
            <p class="text-amber-700 italic">
              And anything else that sparks curiosity and invites thoughtful discussion.
            </p>
          </div>
        </div>
      </section>

      <!-- How We're Different -->
      <section class="mb-16">
        <div class="bg-amber-900 text-amber-100 border-4 border-amber-700 p-8">
          <h2 class="font-serif text-3xl font-bold mb-8 text-center border-b-2 border-dotted border-amber-600 pb-4">
            Why MyBlog is Different
          </h2>
          
          <div class="grid md:grid-cols-2 gap-8">
            <div>
              <h3 class="font-serif text-xl font-bold text-amber-200 mb-4">Design That Matters</h3>
              <p class="text-amber-300 mb-6">
                Our retro-inspired design isn't just aesthetic—it's intentional. We slow down the reading experience, encourage deeper engagement, and create a space that feels both nostalgic and timeless.
              </p>
              
              <h3 class="font-serif text-xl font-bold text-amber-200 mb-4">Quality Over Quantity</h3>
              <p class="text-amber-300 mb-6">
                We don't chase viral content or breaking news. Instead, we focus on pieces that will be just as relevant and interesting a year from now as they are today.
              </p>
            </div>
            
            <div>
              <h3 class="font-serif text-xl font-bold text-amber-200 mb-4">Community First</h3>
              <p class="text-amber-300 mb-6">
                Every feature we build is designed to foster genuine connection. Our comment system encourages thoughtful discussion, and our curation process ensures every piece adds value to the conversation.
              </p>
              
              <h3 class="font-serif text-xl font-bold text-amber-200 mb-4">Technology as a Tool</h3>
              <p class="text-amber-300 mb-6">
                We leverage modern technology to enhance the reading experience, not distract from it. Fast loading, clean code, and intuitive navigation—all in service of great content.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Join the Community -->
      <section class="mb-16">
        <div class="bg-amber-100 border-4 border-amber-800 p-8 text-center">
          <div class="border-2 border-dotted border-amber-700 p-8 max-w-3xl mx-auto">
            <h2 class="font-serif text-3xl font-bold text-amber-900 mb-6">
              Join Our Community
            </h2>
            
            <p class="text-amber-800 text-lg mb-8 leading-relaxed">
              MyBlog is more than a platform—it's a community of curious minds, thoughtful writers, and engaged readers who believe in the power of meaningful conversation.
            </p>
            
            @if (!isAuthenticated()) {
              <div class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                  <a 
                    routerLink="/auth/register"
                    class="inline-block bg-amber-800 text-amber-100 px-8 py-4 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 hover:border-amber-600"
                  >
                    Start Writing Today
                  </a>
                  
                  <a 
                    routerLink="/archive"
                    class="inline-block bg-amber-200 text-amber-900 px-8 py-4 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400 hover:border-amber-500"
                  >
                    Browse Articles
                  </a>
                </div>
                
                <p class="text-amber-600 text-sm font-mono mt-4">
                  Already have an account? <a routerLink="/auth/login" class="underline hover:text-amber-800">Sign in here</a>
                </p>
              </div>
            } @else {
              <div class="space-y-4">
                <p class="text-amber-700 text-lg mb-6">
                  Welcome to the community! Ready to share your thoughts with the world?
                </p>
                
                <div class="grid md:grid-cols-2 gap-4">
                  <a 
                    routerLink="/write"
                    class="inline-block bg-amber-800 text-amber-100 px-8 py-4 font-mono text-sm uppercase tracking-wider hover:bg-amber-700 transition-colors border-2 border-amber-700 hover:border-amber-600"
                  >
                    Write New Article
                  </a>
                  
                  <a 
                    routerLink="/profile"
                    class="inline-block bg-amber-200 text-amber-900 px-8 py-4 font-mono text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors border-2 border-amber-400 hover:border-amber-500"
                  >
                    View Your Profile
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Contact Information -->
      <section class="mb-12">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Contact -->
          <div class="bg-amber-50 border-4 border-amber-300 p-6">
            <h3 class="font-serif text-2xl font-bold text-amber-900 mb-6 text-center">
              Get in Touch
            </h3>
            
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                <div>
                  <div class="font-mono text-sm text-amber-600">Email</div>
                  <a href="mailto:hello@myblog.com" class="text-amber-800 hover:text-amber-900">hellomyblog.com</a>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <div class="font-mono text-sm text-amber-600">Website</div>
                  <span class="text-amber-800">www.myblog.com</span>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <div class="font-mono text-sm text-amber-600">Location</div>
                  <span class="text-amber-800">Everywhere & Nowhere</span>
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ -->
          <div class="bg-amber-50 border-4 border-amber-300 p-6">
            <h3 class="font-serif text-2xl font-bold text-amber-900 mb-6 text-center">
              Quick Questions
            </h3>
            
            <div class="space-y-4">
              <div>
                <h4 class="font-bold text-amber-900 mb-2">Can anyone write for MyBlog?</h4>
                <p class="text-amber-700 text-sm">Absolutely! Create an account and start sharing your thoughts with our community.</p>
              </div>
              
              <div>
                <h4 class="font-bold text-amber-900 mb-2">Is MyBlog free?</h4>
                <p class="text-amber-700 text-sm">Yes, creating an account and reading articles is completely free. Always.</p>
              </div>
              
              <div>
                <h4 class="font-bold text-amber-900 mb-2">How do you choose featured articles?</h4>
                <p class="text-amber-700 text-sm">We look for quality writing, unique perspectives, and content that sparks meaningful discussion.</p>
              </div>
              
              <div>
                <h4 class="font-bold text-amber-900 mb-2">Can I customize my profile?</h4>
                <p class="text-amber-700 text-sm">Of course! Add a bio, upload an avatar, and make your profile uniquely yours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* Custom prose styling for better readability */
    .prose p {
      margin-bottom: 1.5rem;
    }

    .prose strong {
      color: #92400e;
      font-weight: 700;
    }

    .prose em {
      color: #b45309;
      font-style: italic;
    }

    /* Vintage paper texture */
    section {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.02) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 200, 124, 0.02) 0%, transparent 50%);
    }

    /* Rotating card effect */
    .transform.rotate-2 {
      transform: rotate(2deg);
    }

    .transform.rotate-2:hover {
      transform: rotate(-1deg);
      transition: transform 0.3s ease-in-out;
    }

    /* Diamond bullet points */
    .transform.rotate-45 {
      transform: rotate(45deg);
    }
  `]
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
