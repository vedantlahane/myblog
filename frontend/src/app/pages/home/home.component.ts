import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { HeaderComponent } from '../../components/header/header.component';

import { FooterComponent } from '../../components/footer/footer.component';
import { MainContentComponent } from '../../components/main-content/main-content.component';

@Component({
  selector: 'app-home',
  imports: [HeroComponent,HeaderComponent,FooterComponent,MainContentComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
