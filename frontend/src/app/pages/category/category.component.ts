import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Category Page</h1>
        <p class="text-gray-600 mb-6">This page is under development.</p>
        <a routerLink="/" class="text-amber-600 hover:text-amber-700 font-semibold">
          ← Back to Home
        </a>
      </div>
    </div>
  `
})
export class CategoryComponent {}
