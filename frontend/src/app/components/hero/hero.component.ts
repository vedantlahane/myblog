import { Component } from '@angular/core';
import { FloatingCardsComponent } from '../floating-cards/floating-cards.component';

@Component({
  selector: 'app-hero',
  imports: [FloatingCardsComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {

}
