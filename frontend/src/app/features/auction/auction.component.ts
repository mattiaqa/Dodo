import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { CommentComponent } from './components/comment/comment.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-auction',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, FaIconComponent, FormsModule, CommentComponent, NgIf],
  templateUrl: './auction.component.html',
  styleUrl: './auction.component.scss'
})
export class AuctionComponent implements OnInit {
  auctionId: string = '12345';
  bidAmount: number = 0;
  data: any = {
    auctionId: '12345',
    description: 'A rare book auction',
    book: {
      title: 'The Great Gatsby',
      ISBN: '978-3-16-148410-0',
      authors: ['F. Scott Fitzgerald'],
      description: 'A classic novel set in the 1920s.',
    },
    condition: 'Good',
    lastBid: 100,
    country: 'USA',
    province: 'New York',
    image: 'path/to/image.jpg',
    expireDate: '2025-12-31',
    createdAt: '2024-01-01'
  };
  isOfferPopupOpen: boolean = false;

  ngOnInit() {
    console.log('Auction initialized with hardcoded data.');
  }

  placeBid(): void {
    if (this.bidAmount > this.data.lastBid) {
      this.data.lastBid = this.bidAmount;
      alert('Bid placed successfully!');
    } else {
      alert('Your bid must be higher than the last bid!');
    }
  }

  openOfferPopup() {
    this.isOfferPopupOpen = true;
  }

  submitOffer() {

  }
}
