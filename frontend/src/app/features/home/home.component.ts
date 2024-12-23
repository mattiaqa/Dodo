import { Component } from '@angular/core';
import {NavbarComponent} from '../../layout/navbar/navbar.component';
import {FooterComponent} from '../../layout/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
