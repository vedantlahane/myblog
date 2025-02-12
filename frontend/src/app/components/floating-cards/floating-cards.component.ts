import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-cards.component.html',
  styleUrls: ['./floating-cards.component.css'],
  animations: [
    trigger('fadeInScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate(
          '{{duration}}ms {{delay}}ms cubic-bezier(0.68, -0.55, 0.27, 1.55)',
          style({ opacity: 1, transform: 'scale(1)' })
        )
      ], { params: { delay: 0, duration: 800 } })
    ])
  ]
})
export class FloatingCardsComponent implements OnInit {
  floatingCards: Array<{ size: number, z: number, x: number, y: number, delay: number }> = [];

  ngOnInit(): void {
    this.floatingCards = [
      { size: 100, z: 1, x: 10, y: 10, delay: 0 },
      { size: 120, z: 2, x: 25, y: 30, delay: 150 },
      { size: 90,  z: 3, x: 40, y: 15, delay: 300 },
      { size: 110, z: 4, x: 60, y: 25, delay: 450 },
      { size: 80,  z: 5, x: 75, y: 40, delay: 600 },
      { size: 100, z: 6, x: 85, y: 10, delay: 750 },
    ];
  }
}