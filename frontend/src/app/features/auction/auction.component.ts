import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { CommentComponent } from './components/comment/comment.component';
import {CurrencyPipe, NgClass, NgIf} from '@angular/common';
import {StorageService} from '../../storage/storage.service';
import {AuctionService} from '../../services/auction.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-auction',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, FaIconComponent, FormsModule, CommentComponent, NgIf, CurrencyPipe, NgClass],
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
  userLike: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private storageService: StorageService,
    private auctionService: AuctionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.isAdmin = this.storageService.isUserAdmin();
    this.isLoggedIn = this.storageService.isLoggedIn();

    this.auctionId = this.route.snapshot.paramMap.get('auctionId') || '';
    this.auctionService.getAuctionById(this.auctionId).subscribe(auction => {
      this.data = auction;
      this.userLike = auction.userLike;
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
            this.toastService.showToast({
              message: `Bid successfully entered.`,
              type: 'success',
              duration: 8000
            });
        }
        );
      } else {
        this.toastService.showToast({
          message: `Your bid must be more than ${this.data.lastBid} euros!`,
          type: 'error',
          duration: 8000
        });
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

  handleLike(auctionId: any) {
    if(this.userLike) {
      this.auctionService.dislikeAuction(auctionId).subscribe();
      this.storageService.removeSavedAuction(auctionId);
      this.userLike = false;
    } else {
      this.auctionService.likeAuction(auctionId).subscribe();
      this.storageService.saveAuction(auctionId);
      this.userLike = true;
    }
  }
}
