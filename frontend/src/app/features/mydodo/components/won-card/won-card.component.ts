import {Component, Input, OnInit} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {RouterLink} from '@angular/router';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {AuctionService} from '../../../../services/auction.service';

@Component({
  selector: 'app-won-card',
  imports: [
    FaIconComponent,
    RouterLink,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './won-card.component.html',
  styleUrl: './won-card.component.scss'
})
export class WonCardComponent implements OnInit {
  @Input() auction: {
    auctionId: string;
    title: string;
    book: {
      title: string;
      ISBN: string;
    };
    condition: string;
    lastBid: number;
    country: string;
    province: string;
    images: string[];
    expireDate: string;
    createdAt: string;
  } | undefined;
  bids: any[] = [];

  image_url: string = '';

  constructor(private auctionService: AuctionService,) { }

  ngOnInit() {
    this.image_url = "http://localhost:1338/api/download/image/" + this.auction?.images[0];

    this.auctionService.getBidsByAuctionId(this.auction!.auctionId).subscribe(bids => {
      this.bids = bids;
    })
  }
}
