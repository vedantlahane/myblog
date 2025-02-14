// pages/home/home.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeroComponent } from '../../components/hero/hero.component';
import { MainContentComponent } from '../../components/main-content/main-content.component';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, MainContentComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToPosts() {
    this.router.navigate(['/blog']);
  }
}