import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { CommentComponent } from './components/comment/comment.component';
import {CurrencyPipe, NgIf} from '@angular/common';
import {StorageService} from '../../storage/storage.service';
import {AuctionService} from '../../services/auction.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-auction',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, FaIconComponent, FormsModule, CommentComponent, NgIf, CurrencyPipe],
  templateUrl: './auction.component.html',
  styleUrl: './auction.component.scss'
})
export class AuctionComponent implements OnInit {
  auctionId: string = '';
  bidAmount: number = 0;
  data: any = [];
  isOfferPopupOpen: boolean = false;
  isAdmin: boolean = false;
  offersNumber: number = 0;
  timeLeft: string = '';
  private timerInterval: any;

  constructor(private storageService: StorageService, private auctionService: AuctionService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.isAdmin = this.storageService.isUserAdmin();
    this.auctionId = this.route.snapshot.paramMap.get('auctionId') || '';
    this.auctionService.getAuctionById(this.auctionId).subscribe(auction => {
      this.data = auction;
    });

    this.auctionService.getBidsByAuctionId(this.auctionId).subscribe(auction => {
      this.offersNumber = auction.length;
    })

    this.updateTimeLeft();

    this.timerInterval = setInterval(() => {
      this.updateTimeLeft();
    }, 1000);
  }

  placeBid(): void {
    if(!this.storageService.isLoggedIn()) {
      this.router.navigate(['login']);
    } else {
      if (this.bidAmount > this.data.lastBid) {
        this.auctionService.placeBid(this.auctionId, this.bidAmount).subscribe( data => {
          if(!data.Error)
            this.offersNumber++;
            this.data.lastBid = this.bidAmount;
        }
        );
      } else {
        alert('Your bid must be higher than the last bid!');
      }
    }
  }

  deleteAuction(auctionId: string): void {
    this.auctionService.deleteAuction(auctionId).subscribe( deleted => {
        this.router.navigate(['']);
    });
  }

  private updateTimeLeft() {
    if (this.data) {
      const now = new Date().getTime();
      const expireDate = new Date(this.data.expireDate).getTime();
      const startDate = new Date(this.data.createdAt).getTime();

      if (expireDate > now && startDate < expireDate) {

        const timeLeftMs = expireDate - now;

        const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

        this.timeLeft = `${hours}h ${minutes}m ${seconds}s`;
      } else {
        this.timeLeft = 'Expired';
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
      }
    }
  }

  setBidAmount(amount: number) {
    this.bidAmount = amount;
  }

  addToWatchlist(auctionId: any) {
    this.auctionService.addToWatchlist(auctionId).subscribe();
    this.storageService.addToWatchlist(auctionId);
  }

  likeAuction(auctionId: any) {
    this.auctionService.saveAuction(auctionId).subscribe();
    this.storageService.saveAuction(auctionId);
  }
}
