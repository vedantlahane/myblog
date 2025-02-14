// components/hero/hero.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit {
  isImageLoaded = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Preload the background image
    const img = new Image();
    img.src = 'assets/hero-bg.jpg';
    img.onload = () => {
      this.isImageLoaded = true;
    };
  }

  exploreNow() {
    this.router.navigate(['/blog']);
  }
}