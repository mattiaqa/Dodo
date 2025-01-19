import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {CurrencyPipe} from '@angular/common';
import {AuctionService} from '../../../../services/auction.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  bookTitle: string = '';

  @Input() auctionId: string | undefined;

  constructor(private auctionService: AuctionService,) {
  }

  ngOnInit() {
    const auction = this.auctionService.getAuctionById(this.auctionId!).subscribe(auction => {
      this.bookTitle = auction.book.title;
    });
  }
}
