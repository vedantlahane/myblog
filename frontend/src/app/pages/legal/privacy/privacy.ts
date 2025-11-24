import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
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
            Privacy Policy
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
            Back to Xandar
          </a>
        </div>

        <!-- Privacy Policy Content -->
        <article class="bg-amber-50 border-4 border-amber-300 p-8 space-y-8">
          <!-- Introduction -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Introduction
            </h2>
            <div class="prose prose-amber max-w-none">
              <p class="text-amber-800 leading-relaxed mb-4">
                Welcome to Xandar! We respect your privacy and are committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                visit our website and use our services.
              </p>
              <p class="text-amber-800 leading-relaxed">
                By using Xandar, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use our services.
              </p>
            </div>
          </section>

          <!-- Information We Collect -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Information We Collect
            </h2>
            
            <div class="space-y-6">
              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Personal Information</h3>
                <p class="text-amber-800 leading-relaxed mb-3">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul class="list-disc list-inside text-amber-800 space-y-2 ml-4">
                  <li>Register for an account</li>
                  <li>Create or publish content</li>
                  <li>Comment on posts</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Contact us directly</li>
                  <li>Upload images or other media</li>
                </ul>
                <div class="mt-4 p-4 bg-amber-100 border-2 border-amber-400">
                  <h4 class="font-bold text-amber-900 mb-2">Types of Personal Information:</h4>
                  <ul class="text-amber-800 text-sm space-y-1">
                    <li>• Name and display name</li>
                    <li>• Email address</li>
                    <li>• Profile photos and avatars</li>
                    <li>• Bio and profile information</li>
                    <li>• Content you create (posts, comments)</li>
                    <li>• Preferences and settings</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Automatically Collected Information</h3>
                <p class="text-amber-800 leading-relaxed mb-3">
                  When you visit Xandar, we automatically collect certain information about your device and usage:
                </p>
                <ul class="list-disc list-inside text-amber-800 space-y-2 ml-4">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent</li>
                  <li>Referral sources</li>
                  <li>Search queries within our site</li>
                  <li>Interaction data (likes, bookmarks, follows)</li>
                </ul>
              </div>

              <div>
                <h3 class="font-serif text-xl font-bold text-amber-900 mb-3">Cookies and Tracking Technologies</h3>
                <p class="text-amber-800 leading-relaxed">
                  We use cookies, web beacons, and similar tracking technologies to enhance your experience. 
                  These technologies help us remember your preferences, understand how you use our services, 
                  and improve our platform.
                </p>
              </div>
            </div>
          </section>

          <!-- How We Use Your Information -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              How We Use Your Information
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              We use the information we collect for various purposes, including:
            </p>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-3">Service Provision</h4>
                <ul class="text-amber-800 text-sm space-y-1">
                  <li>• Provide and maintain our services</li>
                  <li>• Process your registration and manage your account</li>
                  <li>• Enable content creation and sharing</li>
                  <li>• Facilitate user interactions</li>
                </ul>
              </div>
              
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-3">Communication</h4>
                <ul class="text-amber-800 text-sm space-y-1">
                  <li>• Send you updates and newsletters</li>
                  <li>• Respond to your inquiries</li>
                  <li>• Notify you about activity on your content</li>
                  <li>• Send administrative information</li>
                </ul>
              </div>
              
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-3">Improvement</h4>
                <ul class="text-amber-800 text-sm space-y-1">
                  <li>• Analyze usage patterns and trends</li>
                  <li>• Improve our website and services</li>
                  <li>• Develop new features</li>
                  <li>• Personalize your experience</li>
                </ul>
              </div>
              
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-3">Security & Legal</h4>
                <ul class="text-amber-800 text-sm space-y-1">
                  <li>• Detect and prevent fraud</li>
                  <li>• Ensure platform security</li>
                  <li>• Comply with legal obligations</li>
                  <li>• Enforce our terms of service</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Information Sharing -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Information Sharing and Disclosure
            </h2>
            
            <div class="space-y-4">
              <div class="p-4 bg-yellow-50 border-2 border-yellow-300">
                <h4 class="font-bold text-yellow-900 mb-2">🔒 We Do Not Sell Your Personal Information</h4>
                <p class="text-yellow-800 text-sm">
                  We do not sell, trade, or rent your personal information to third parties for their marketing purposes.
                </p>
              </div>
              
              <p class="text-amber-800 leading-relaxed">
                We may share your information in the following circumstances:
              </p>
              
              <ul class="space-y-3">
                <li class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong class="text-amber-900">Public Content:</strong>
                    <span class="text-amber-800"> Content you publish (posts, comments, profile information) is publicly visible and may be viewed by other users.</span>
                  </div>
                </li>
                
                <li class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong class="text-amber-900">Service Providers:</strong>
                    <span class="text-amber-800"> We may share information with trusted third-party service providers who assist us in operating our website and conducting our business.</span>
                  </div>
                </li>
                
                <li class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong class="text-amber-900">Legal Requirements:</strong>
                    <span class="text-amber-800"> We may disclose information if required by law, court order, or government request.</span>
                  </div>
                </li>
                
                <li class="flex items-start gap-3">
                  <div class="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong class="text-amber-900">Business Transfers:</strong>
                    <span class="text-amber-800"> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <!-- Data Security -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Data Security
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div class="p-4 bg-green-50 border-2 border-green-300">
                <h4 class="font-bold text-green-900 mb-2">🔐 Security Measures</h4>
                <ul class="text-green-800 text-sm space-y-1">
                  <li>• SSL/TLS encryption for data transmission</li>
                  <li>• Secure password hashing</li>
                  <li>• Regular security audits</li>
                  <li>• Access controls and monitoring</li>
                  <li>• Data backup and recovery systems</li>
                </ul>
              </div>
              
              <div class="p-4 bg-blue-50 border-2 border-blue-300">
                <h4 class="font-bold text-blue-900 mb-2">👤 Your Responsibilities</h4>
                <ul class="text-blue-800 text-sm space-y-1">
                  <li>• Use strong, unique passwords</li>
                  <li>• Keep your login credentials secure</li>
                  <li>• Log out from shared devices</li>
                  <li>• Report suspicious activity</li>
                  <li>• Keep your contact information updated</li>
                </ul>
              </div>
            </div>
            
            <div class="mt-4 p-4 bg-red-50 border-2 border-red-300">
              <p class="text-red-800 text-sm">
                <strong>Important:</strong> While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <!-- Your Rights -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Your Privacy Rights
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            
            <div class="space-y-4">
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-2">Access and Portability</h4>
                <p class="text-amber-800 text-sm">
                  You have the right to access your personal information and receive a copy of your data in a portable format.
                </p>
              </div>
              
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-2">Correction and Updates</h4>
                <p class="text-amber-800 text-sm">
                  You can update your profile information and correct inaccuracies through your account settings.
                </p>
              </div>
              
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-2">Deletion</h4>
                <p class="text-amber-800 text-sm">
                  You may request deletion of your account and associated personal information, subject to certain legal limitations.
                </p>
              </div>
              
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-2">Opt-out</h4>
                <p class="text-amber-800 text-sm">
                  You can opt out of marketing communications and adjust your notification preferences in your account settings.
                </p>
              </div>
            </div>
            
            <div class="mt-6 p-4 bg-blue-50 border-2 border-blue-300">
              <h4 class="font-bold text-blue-900 mb-2">How to Exercise Your Rights</h4>
              <p class="text-blue-800 text-sm mb-2">
                To exercise these rights, please contact us at <strong>privacy&#64;Xandar.com</strong> or use the settings in your account dashboard.
              </p>
              <p class="text-blue-800 text-sm">
                We will respond to your request within 30 days and may require verification of your identity.
              </p>
            </div>
          </section>

          <!-- Children's Privacy -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Children's Privacy
            </h2>
            
            <div class="p-6 bg-red-50 border-2 border-red-400">
              <p class="text-red-800 leading-relaxed mb-3">
                Xandar is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13 years of age.
              </p>
              <p class="text-red-800 leading-relaxed">
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can delete such information.
              </p>
            </div>
          </section>

          <!-- International Transfers -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              International Data Transfers
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
            </p>
            
            <div class="p-4 bg-amber-100 border-2 border-amber-400">
              <p class="text-amber-800 text-sm">
                By using Xandar, you consent to such transfers. We will take appropriate measures to ensure your data receives adequate protection in accordance with this Privacy Policy.
              </p>
            </div>
          </section>

          <!-- Changes to Privacy Policy -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Changes to This Privacy Policy
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. When we do, we will:
            </p>
            
            <ul class="list-disc list-inside text-amber-800 space-y-2 ml-4 mb-4">
              <li>Post the updated policy on this page</li>
              <li>Update the "Last Updated" date</li>
              <li>Notify you via email or prominent notice on our website for significant changes</li>
              <li>Provide a clear summary of changes made</li>
            </ul>
            
            <div class="p-4 bg-amber-100 border-2 border-amber-400">
              <p class="text-amber-800 text-sm">
                Your continued use of Xandar after any changes to this Privacy Policy constitutes your acceptance of such changes.
              </p>
            </div>
          </section>

          <!-- Contact Information -->
          <section>
            <h2 class="font-serif text-2xl font-bold text-amber-900 mb-4 border-b-2 border-dotted border-amber-400 pb-2">
              Contact Us
            </h2>
            
            <p class="text-amber-800 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-3">📧 Email Contact</h4>
                <div class="space-y-2 text-amber-800 text-sm">
                  <p><strong>Privacy Officer:</strong> privacy&#64;Xandar.com</p>
                  <p><strong>General Support:</strong> support&#64;Xandar.com</p>
                  <p><strong>Legal Inquiries:</strong> legal&#64;Xandar.com</p>
                </div>
              </div>
              
              <div class="p-4 bg-amber-100 border-2 border-amber-400">
                <h4 class="font-bold text-amber-900 mb-3">📍 Mailing Address</h4>
                <div class="text-amber-800 text-sm">
                  <p>Xandar Privacy Team<br>
                  123 Blog Street<br>
                  Digital City, DC 12345<br>
                  United States</p>
                </div>
              </div>
            </div>
            
            <div class="mt-4 p-4 bg-blue-50 border-2 border-blue-300">
              <p class="text-blue-800 text-sm">
                <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 48 hours during business days.
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
                routerLink="/legal/terms"
                class="inline-block bg-amber-100 text-amber-900 px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-amber-200 transition-colors border-2 border-amber-300"
              >
                Terms of Service
              </a>
              
              <a 
                href="mailto:legal@Xandar.com"
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
export class PrivacyComponent {
  lastUpdated = 'January 15, 2024';
}
