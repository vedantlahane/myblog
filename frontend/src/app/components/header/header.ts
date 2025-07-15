import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  isMenuOpen = false;
  
  navigationItems = [
    { label: 'Home', route: '/' },
    { label: 'Music', route: '/category/music' },
    { label: 'Fashion', route: '/category/fashion' },
    { label: 'Careers', route: '/category/careers' },
    { label: 'Relationships', route: '/category/relationships' },
    { label: 'Movies', route: '/category/movies' },
    { label: 'Events', route: '/category/events' }
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}