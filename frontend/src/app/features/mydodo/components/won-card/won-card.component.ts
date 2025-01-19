import {Component, Input} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-won-card',
  imports: [
    FaIconComponent,
    RouterLink
  ],
  templateUrl: './won-card.component.html',
  styleUrl: './won-card.component.scss'
})
export class WonCardComponent {
  @Input() auction: {
    auctionId: string;
    book: {
      title: string;
      ISBN: string;
    };
    condition: string;
    lastBid: number;
    country: string;
    province: string;
    image: string;
    expireDate: string;
    createdAt: string;
  } | undefined;
}
