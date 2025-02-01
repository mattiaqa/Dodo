import { Component } from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-footer',
  imports: [
    FaIconComponent
  ],
  templateUrl: './footer.component.html',
  standalone: true,
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}
