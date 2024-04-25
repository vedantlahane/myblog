import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-writeblog',
  standalone: true,
  imports: [CommonModule, WriteblogComponent,RouterLink,RouterOutlet],
  templateUrl: './writeblog.component.html',
  styleUrl: './writeblog.component.css'
})
export class WriteblogComponent {

}
