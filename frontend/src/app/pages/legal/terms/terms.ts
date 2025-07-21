import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-amber-25 to-orange-25">
      <!-- Header -->
      <header class="bg-amber-100 border-4 border-amber-800 p-8 mb-12">
        <div class="text-center border-2 border-dotted border-amber-700 p-6">
          <div class="inline-block bg-amber-800 text-amber-100 px-4 py-1 text-xs font-mono uppercase tracking-widest mb-4">
            Legal Document
          </div>
          
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-3">
            Terms of Service
          </h1>
          <p class="text-amber-700 text-lg font-mono">
            Last updated: {{ lastUpdated }}
          </p>
        </div>
      </header>

      <div class="max-w-4xl mx-auto px-4 mb-12">
        <!-- Back Navigation -->
        <div class="mb-8">
          <a 
            routerLink="/"
            class="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-mono text-sm transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to MyBlog
          </a>
        </div>

        <!-- Terms of Service Content -->
        <article class="bg-amber-50 border-4 border-amber-300 p-8 space-y-8">
          <!-- Agreement to Terms -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Agreement to Terms
            </h2>
            <div class="prose prose-amber max-w-none">
              <p class="text-amber-800 leading-relaxed mb-4">
                Welcome to MyBlog! These Terms of Service ("Terms") govern your use of our website and services. 
                By accessing or using MyBlog, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <div class="p-4 bg-red-50 border-2 border-red-300">
                <p class="text-red-800 text-sm">
                  <strong>Important:</strong> If you do not agree to these Terms, please do not access or use our services.
                </p>
              </div>
            </div>
          </section>

          <!-- Description of Services -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Description of Services
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              MyBlog is a content publishing platform that allows users to:
            </p>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-2">✍️ Content Creation</h4>
                <ul class="text-amber-800 text-sm space-y-1">
                  <li>• Write and publish blog posts</li>
                  <li>• Upload images and media</li>
                  <li>• Create and manage drafts</li>
                  <li>• Organize content with tags</li>
                </ul>
              </div>
              
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-2">🤝 Social Interaction</h4>
                <ul class="text-amber-800 text-sm space-y-1">
                  <li>• Comment on posts</li>
                  <li>• Like and bookmark content</li>
                  <li>• Follow other users</li>
                  <li>• Create collections</li>
                </ul>
              </div>
            </div>
            
            <div class="mt-4 p-4 bg-blue-50 border-2 border-blue-300">
              <p class="text-blue-800 text-sm">
                We reserve the right to modify, suspend, or discontinue any part of our services at any time with or without notice.
              </p>
            </div>
          </section>

          <!-- User Accounts -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              User Accounts and Registration
            </h2>
            
            <div class="space-y-4">
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Account Requirements</h3>
                <ul class="list-disc list-inside text-amber-800 space-y-2 ml-4">
                  <li>You must be at least 13 years old to create an account</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must not create multiple accounts to evade restrictions</li>
                  <li>One person or entity may maintain only one account</li>
                </ul>
              </div>
              
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Account Security</h3>
                <div class="p-4 bg-yellow-50 border-2 border-yellow-300">
                  <p class="text-yellow-800 text-sm mb-2">
                    <strong>Your Responsibilities:</strong>
                  </p>
                  <ul class="text-yellow-800 text-sm space-y-1">
                    <li>• Keep your password secure and confidential</li>
                    <li>• Notify us immediately of any unauthorized use</li>
                    <li>• Log out of your account when using shared devices</li>
                    <li>• Update your contact information when it changes</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <!-- User Content -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              User-Generated Content
            </h2>
            
            <div class="space-y-6">
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Content Ownership</h3>
                <p class="text-amber-800 leading-relaxed mb-3">
                  You retain ownership of the content you create and publish on MyBlog. However, by posting content, you grant us certain rights to use and display your content.
                </p>
                
                <div class="p-4 bg-amber-100 border-2 border-amber-400">
                  <h4 class="font-bold text-amber-900 mb-2">License Grant</h4>
                  <p class="text-amber-800 text-sm">
                    You grant MyBlog a non-exclusive, worldwide, royalty-free license to use, display, distribute, and modify your content for the purpose of operating and improving our services.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Content Guidelines</h3>
                <p class="text-amber-800 leading-relaxed mb-3">
                  All content must comply with our community guidelines. Prohibited content includes:
                </p>
                
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="p-4 bg-red-50 border-2 border-red-300">
                    <h4 class="font-bold text-red-900 mb-2">🚫 Prohibited Content</h4>
                    <ul class="text-red-800 text-sm space-y-1">
                      <li>• Illegal activities or content</li>
                      <li>• Harassment or hate speech</li>
                      <li>• Spam or misleading information</li>
                      <li>• Copyright infringement</li>
                      <li>• Adult or explicit content</li>
                      <li>• Violence or threats</li>
                    </ul>
                  </div>
                  
                  <div class="p-4 bg-green-50 border-2 border-green-300">
                    <h4 class="font-bold text-green-900 mb-2">✅ Encouraged Content</h4>
                    <ul class="text-green-800 text-sm space-y-1">
                      <li>• Original, thoughtful writing</li>
                      <li>• Constructive discussions</li>
                      <li>• Educational material</li>
                      <li>• Creative works</li>
                      <li>• Respectful commentary</li>
                      <li>• Community building</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Content Moderation</h3>
                <p class="text-amber-800 leading-relaxed mb-3">
                  We reserve the right to review, modify, or remove content that violates these Terms or our community guidelines.
                </p>
                
                <div class="p-4 bg-amber-100 border-2 border-amber-400">
                  <p class="text-amber-800 text-sm">
                    Content moderation may be performed through automated systems and human review. We strive to be fair and consistent in our enforcement.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Acceptable Use -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Acceptable Use Policy
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              You agree to use MyBlog in accordance with all applicable laws and regulations. The following activities are strictly prohibited:
            </p>
            
            <div class="space-y-4">
              <div class="p-4 bg-red-50 border-2 border-red-300">
                <h4 class="font-bold text-red-900 mb-2">Technical Violations</h4>
                <ul class="text-red-800 text-sm space-y-1">
                  <li>• Attempting to gain unauthorized access to our systems</li>
                  <li>• Interfering with the operation of our services</li>
                  <li>• Using automated scripts without permission</li>
                  <li>• Reverse engineering our software</li>
                  <li>• Distributing malware or viruses</li>
                </ul>
              </div>
              
              <div class="p-4 bg-red-50 border-2 border-red-300">
                <h4 class="font-bold text-red-900 mb-2">Content Violations</h4>
                <ul class="text-red-800 text-sm space-y-1">
                  <li>• Posting false or misleading information</li>
                  <li>• Impersonating others</li>
                  <li>• Violating intellectual property rights</li>
                  <li>• Engaging in harassment or bullying</li>
                  <li>• Promoting illegal activities</li>
                </ul>
              </div>
              
              <div class="p-4 bg-red-50 border-2 border-red-300">
                <h4 class="font-bold text-red-900 mb-2">Commercial Violations</h4>
                <ul class="text-red-800 text-sm space-y-1">
                  <li>• Excessive self-promotion or spam</li>
                  <li>• Unauthorized commercial use</li>
                  <li>• Selling access to accounts</li>
                  <li>• Fraudulent activities</li>
                  <li>• Circumventing payment systems</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Intellectual Property -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Intellectual Property Rights
            </h2>
            
            <div class="space-y-4">
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Our Intellectual Property</h3>
                <p class="text-amber-800 leading-relaxed mb-3">
                  MyBlog and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Copyright Policy</h3>
                <p class="text-amber-800 leading-relaxed mb-3">
                  We respect intellectual property rights and expect our users to do the same. If you believe your copyright has been infringed, please contact us with the following information:
                </p>
                
                <div class="p-4 bg-blue-50 border-2 border-blue-300">
                  <h4 class="font-bold text-blue-900 mb-2">DMCA Takedown Requests</h4>
                  <p class="text-blue-800 text-sm mb-2">
                    Send copyright infringement notices to: <strong>dmca&#64;myblog.com</strong>
                  </p>
                  <ul class="text-blue-800 text-sm space-y-1">
                    <li>• Identification of the copyrighted work</li>
                    <li>• Location of the infringing material</li>
                    <li>• Your contact information</li>
                    <li>• Statement of good faith belief</li>
                    <li>• Statement of accuracy and authority</li>
                    <li>• Physical or electronic signature</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Trademark Policy</h3>
                <p class="text-amber-800 leading-relaxed">
                  Our trademarks, service marks, and logos used in connection with MyBlog are our property. You may not use them without our prior written consent.
                </p>
              </div>
            </div>
          </section>

          <!-- Privacy -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Privacy and Data Protection
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our services.
            </p>
            
            <div class="p-4 bg-amber-100 border-2 border-amber-400">
              <h4 class="font-bold text-amber-900 mb-2">Key Privacy Points</h4>
              <ul class="text-amber-800 text-sm space-y-1">
                <li>• We collect only necessary information to provide our services</li>
                <li>• We do not sell your personal information to third parties</li>
                <li>• You have control over your privacy settings</li>
                <li>• We use industry-standard security measures</li>
                <li>• You can request deletion of your data</li>
              </ul>
            </div>
            
            <div class="mt-4 text-center">
              <a 
                routerLink="/legal/privacy"
                class="inline-block bg-blue-100 text-blue-800 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-blue-200 transition-colors border-2 border-blue-300"
              >
                Read Full Privacy Policy
              </a>
            </div>
          </section>

          <!-- Disclaimers -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Disclaimers and Limitation of Liability
            </h2>
            
            <div class="space-y-4">
              <div class="p-4 bg-yellow-50 border-2 border-yellow-300">
                <h4 class="font-bold text-yellow-900 mb-2">⚠️ Service Disclaimer</h4>
                <p class="text-yellow-800 text-sm">
                  MyBlog is provided "as is" and "as available" without warranties of any kind. We do not guarantee that our service will be uninterrupted, secure, or error-free.
                </p>
              </div>
              
              <div class="p-4 bg-orange-50 border-2 border-orange-300">
                <h4 class="font-bold text-orange-900 mb-2">📄 Content Disclaimer</h4>
                <p class="text-orange-800 text-sm">
                  User-generated content does not reflect our views or opinions. We are not responsible for the accuracy, completeness, or usefulness of any user content.
                </p>
              </div>
              
              <div class="p-4 bg-red-50 border-2 border-red-300">
                <h4 class="font-bold text-red-900 mb-2">⚖️ Limitation of Liability</h4>
                <p class="text-red-800 text-sm">
                  To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
                </p>
              </div>
            </div>
          </section>

          <!-- Termination -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Account Termination
            </h2>
            
            <div class="space-y-4">
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Termination by You</h3>
                <p class="text-amber-800 leading-relaxed mb-3">
                  You may terminate your account at any time by:
                </p>
                <ul class="list-disc list-inside text-amber-800 space-y-1 ml-4">
                  <li>Using the account deletion option in your settings</li>
                  <li>Contacting our support team</li>
                  <li>Following the account closure process</li>
                </ul>
              </div>
              
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Termination by Us</h3>
                <p class="text-amber-800 leading-relaxed mb-3">
                  We may suspend or terminate your account if you:
                </p>
                <ul class="list-disc list-inside text-amber-800 space-y-1 ml-4">
                  <li>Violate these Terms of Service</li>
                  <li>Engage in prohibited activities</li>
                  <li>Fail to respond to our communications</li>
                  <li>Pose a security risk to our platform</li>
                </ul>
              </div>
              
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-2">Effect of Termination</h4>
                <p class="text-amber-800 text-sm">
                  Upon termination, your right to use our services ceases immediately. We may retain certain information as required by law or for legitimate business purposes.
                </p>
              </div>
            </div>
          </section>

          <!-- Governing Law -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Governing Law and Dispute Resolution
            </h2>
            
            <div class="space-y-4">
              <div class="p-4 bg-blue-50 border-2 border-blue-300">
                <h4 class="font-bold text-blue-900 mb-2">Governing Law</h4>
                <p class="text-blue-800 text-sm">
                  These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles.
                </p>
              </div>
              
              <div class="p-4 bg-green-50 border-2 border-green-300">
                <h4 class="font-bold text-green-900 mb-2">Dispute Resolution</h4>
                <p class="text-green-800 text-sm mb-2">
                  We encourage resolving disputes through direct communication. If informal resolution fails:
                </p>
                <ul class="text-green-800 text-sm space-y-1">
                  <li>• Disputes will be resolved through binding arbitration</li>
                  <li>• Arbitration will be conducted under AAA rules</li>
                  <li>• Location: San Francisco, California</li>
                  <li>• No class action lawsuits permitted</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Changes to Terms -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Changes to Terms
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. When we make changes:
            </p>
            
            <div class="p-4 bg-amber-100 border-2 border-amber-400">
              <h4 class="font-bold text-amber-900 mb-2">Notification Process</h4>
              <ul class="text-amber-800 text-sm space-y-1">
                <li>• We will post the updated Terms on this page</li>
                <li>• We will update the "Last Updated" date</li>
                <li>• For material changes, we will provide prominent notice</li>
                <li>• We may send email notifications to registered users</li>
                <li>• Continued use constitutes acceptance of new Terms</li>
              </ul>
            </div>
            
            <div class="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300">
              <p class="text-yellow-800 text-sm">
                If you do not agree to the modified Terms, you must stop using our services and may terminate your account.
              </p>
            </div>
          </section>

          <!-- Contact Information -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Contact Information
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-3">📧 Email Support</h4>
                <div class="space-y-2 text-amber-800 text-sm">
                  <p><strong>Legal Team:</strong> legal&#64;myblog.com</p>
                  <p><strong>General Support:</strong> support&#64;myblog.com</p>
                  <p><strong>Abuse Reports:</strong> abuse&#64;myblog.com</p>
                </div>
              </div>
              
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-3">📍 Legal Address</h4>
                <div class="text-amber-800 text-sm">
                  <p>MyBlog Legal Department<br>
                  123 Blog Street<br>
                  Digital City, DC 12345<br>
                  United States</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Acknowledgment -->
          <section>
            <div class="p-6 bg-green-50 border-4 border-green-400 text-center">
              <h3 class="font-serif text-xl font-bold text-green-900 mb-3">
                Thank You for Using MyBlog!
              </h3>
              <p class="text-green-800 text-sm">
                By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </section>
        </article>

        <!-- Related Links -->
        <section class="mt-12">
          <div class="bg-amber-900 text-amber-100 border-4 border-amber-800 p-6">
            <h3 class="font-serif text-lg font-bold mb-4 text-center">Related Legal Documents</h3>
            
            <div class="flex justify-center gap-6">
              <a 
                routerLink="/legal/privacy"
                class="inline-block bg-amber-100 text-amber-900 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-200 transition-colors border-2 border-amber-300"
              >
                Privacy Policy
              </a>
              
              <a 
                href="mailto:legal@myblog.com"
                class="inline-block bg-amber-100 text-amber-900 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-200 transition-colors border-2 border-amber-300"
              >
                Legal Contact
              </a>
            </div>
          </div>
        </section>
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

    /* Smooth scrolling for anchor links */
    html {
      scroll-behavior: smooth;
    }

    /* Print styles */
    @media print {
      .no-print {
        display: none;
      }
      
      .bg-amber-50 {
        background: white !important;
        border: 1px solid #000 !important;
      }
    }
  `]
})
export class TermsComponent {
  lastUpdated = 'January 15, 2024';
}
