import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {CurrencyPipe} from '@angular/common';
import { config } from '../../../../config/default'

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    RouterLink,
    FaIconComponent,
    CurrencyPipe
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {
  @Input() auction: {
    auctionId: string;
    book: {
      title: string;
      ISBN: string;
    };
    title: string;
    condition: string;
    lastBid: number;
    country: string;
    province: string;
    image: string;
    expireDate: string;
    createdAt: string;
    images: string[];
  } | undefined;

  timeLeftPercentage: number = 0;
  timeLeft: string = '';
  private timerInterval: any;
  image_url: string = '';

  ngOnInit() {
    this.updateTimeLeft();

    this.timerInterval = setInterval(() => {
      this.updateTimeLeft();
    }, 1000);

    this.image_url = `http://${config.hostname}/api/download/image/`+ this.auction?.images[0];
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private updateTimeLeft() {
    if (this.auction) {
      const now = new Date().getTime();
      const expireDate = new Date(this.auction.expireDate).getTime();
      const startDate = new Date(this.auction.createdAt).getTime();

      if (expireDate > now && startDate < expireDate) {
        const totalDuration = expireDate - startDate;
        const timeElapsed = now - startDate;
        this.timeLeftPercentage = Math.max(0, Math.min(100, 100 - (timeElapsed / totalDuration) * 100));

        const timeLeftMs = expireDate - now;

        const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

        this.timeLeft = `${hours}h ${minutes}m ${seconds}s`;
      } else {
        this.timeLeftPercentage = 0;
        this.timeLeft = 'Expired';
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
      }
    }
  }
}
