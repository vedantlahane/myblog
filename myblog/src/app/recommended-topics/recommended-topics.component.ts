import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RecommendedTopics {
  recommendedTopics: any[];
}
@Component({
  selector: 'app-recommended-topics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommended-topics.component.html',
  styleUrls: ['./recommended-topics.component.css']
})

export class RecommendedTopicsComponent {
  recommendedTopics: RecommendedTopics[]=[
    {
      recommendedTopics: ['Topic 1', 'Topic 2', 'Topic 3']
    }
  ];

  constructor() {
    this.recommendedTopics = [];
  }

}