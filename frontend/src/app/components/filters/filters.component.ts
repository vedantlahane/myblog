// filters.component.ts

import { Component, Output, EventEmitter } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';


@Component({

  selector: 'app-filters',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule

  ],

  templateUrl: './filters.component.html',

  styleUrls: ['./filters.component.css']

})

export class FiltersComponent {
  @Output() filterChange = new EventEmitter<any>();

  categories: string[] = ['Technology', 'Travel', 'Food', 'Lifestyle', 'Business'];
  tags: string[] = ['Angular', 'React', 'Vue', 'JavaScript', 'TypeScript', 'Web Development'];
  selectedCategories: string[] = [];
  selectedTags: string[] = [];
  dateFrom: string = '';
  dateTo: string = '';

  onCategoryChange(event: any) {
    const category = event.target.value;
    if (event.target.checked) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    }
    this.emitFilters();
  }

  onTagClick(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index === -1) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags.splice(index, 1);
    }
    this.emitFilters();
  }

  onDateChange() {
    this.emitFilters();
  }

  private emitFilters() {
    this.filterChange.emit({
      categories: this.selectedCategories,
      tags: this.selectedTags,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    });
  }
}