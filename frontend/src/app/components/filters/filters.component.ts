// src/app/components/filters/filters.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex gap-4">
      <select 
        (change)="onFilterChange('category', $event)"
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
        <option value="">All Categories</option>
        <option *ngFor="let category of categories" [value]="category">
          {{category}}
        </option>
      </select>

      <select 
        (change)="onFilterChange('sortBy', $event)"
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
        <option value="">Sort By</option>
        <option value="date">Latest</option>
        <option value="views">Most Viewed</option>
        <option value="likes">Most Liked</option>
      </select>
    </div>
  `
})
export class FiltersComponent {
  @Output() filterChange = new EventEmitter<any>();

  categories = [
    'Technology',
    'Programming',
    'Design',
    'Business',
    'Lifestyle',
    'Other'
  ];

  onFilterChange(type: string, event: any) {
    this.filterChange.emit({
      [type]: event.target.value
    });
  }
}