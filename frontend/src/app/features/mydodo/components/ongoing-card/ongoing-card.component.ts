import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AuctionService} from '../../../../services/auction.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-ongoing-card',
  imports: [],
  templateUrl: './ongoing-card.component.html',
  styleUrl: './ongoing-card.component.scss'
})
export class OngoingCardComponent implements OnInit, OnDestroy {
  @Input() auction: {
    auctionId: string;
    book: {
      title: string;
      _id: string;
    };
    lastBid: number;
    condition: string;
    description: string;
    seller: string;
    country: string;
    province: string;
    images: string[];
    image: string;
    expireDate: string;
    createdAt: string;
    updatedAt: string;
    interactions: number;
    likes: number;
    views: number;
  } | undefined;

  timeLeftPercentage: number = 0;
  timeLeft: string = '';
  private timerInterval: any;
  chart: any = [];
  amounts: number[] = [];
  dates: string[] = [];

  constructor(private auctionService: AuctionService) {
  }

  ngOnInit() {
    this.auctionService.getBidsByAuctionId(this.auction!.auctionId).subscribe({
      next: (bids) => {
        for (const bid of bids) {
          this.amounts!.push(Number(bid.amount));
          this.dates!.push(bid.date.toString());
        }

        if (this.amounts.length == 0 && this.dates.length == 0) {
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
