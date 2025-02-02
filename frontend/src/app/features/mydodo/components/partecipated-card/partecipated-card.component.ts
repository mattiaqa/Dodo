import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import Chart from 'chart.js/auto';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {RouterLink} from '@angular/router';
import {AuctionService} from '../../../../services/auction.service';
import {CurrencyPipe, DatePipe} from '@angular/common';
import { config } from '../../../../config/default'

@Component({
  selector: 'app-partecipated-card',
  standalone: true,
  imports: [
    FaIconComponent,
    RouterLink,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './partecipated-card.component.html',
  styleUrl: './partecipated-card.component.scss'
})
export class PartecipatedCardComponent implements OnInit, OnDestroy {
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
    image: string;
    expireDate: string;
    createdAt: string;
    images: string[];
    reservePrice: number;
  } | undefined;

  timeLeftPercentage: number = 0;
  timeLeft: string = '';
  private timerInterval: any;
  chart: any = [];
  amounts: number[] = [];
  dates: string[] = [];
  bids: any[] = [];
  image_url: string = '';

  constructor(private auctionService: AuctionService) {}

  ngOnInit() {
    this.image_url = `http://${config.hostname}/api/download/image/` + this.auction?.images[0];

    this.auctionService.getBidsByAuctionId(this.auction!.auctionId).subscribe({
      next: (bids) => {
        for (const bid of bids) {
          this.amounts!.push(Number(bid.amount));
          this.dates!.push(bid.date.toString());
        }

        if(this.amounts.length == 0 && this.dates.length == 0) {
          this.amounts!.push(0);
          this.dates!.push('');
        }

        if (this.amounts.length > 0 && this.dates.length > 0) {
          this.chart = this.initializeChart();
          this.chart.update();
        }
      },
      error: (err) => {
        console.error('Error fetching bids:', err);
      }
    });
    this.updateTimeLeft();

    this.timerInterval = setInterval(() => {
      this.updateTimeLeft();
    }, 1000);

    this.auctionService.getBidsByAuctionId(this.auction!.auctionId).subscribe(bids => {
      this.bids = bids;
    })
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  initializeChart() {
    const name = 'canvas_' + this.auction?.auctionId;

    return new Chart(name, {
      type: 'line',
      data: {
        labels: this.dates,
        datasets: [{
          label: 'Eur',
          data: this.amounts,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Offers',
          },
          legend: {
            display: false
          }
        }
      }
    });
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
