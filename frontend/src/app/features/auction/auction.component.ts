import {Component, Input, OnInit} from '@angular/core';
import {NavbarComponent} from '../../layout/navbar/navbar.component';
import {FooterComponent} from '../../layout/footer/footer.component';
import {AuctionService} from '../../services/auction.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {FormsModule} from '@angular/forms';
import {StorageService} from '../../storage/storage.service';
import {CommentComponent} from './components/comment/comment.component';

@Component({
  selector: 'app-auction',
  imports: [
    NavbarComponent,
    FooterComponent,
    FaIconComponent,
    FormsModule,
    CommentComponent
  ],
  templateUrl: './auction.component.html',
  styleUrl: './auction.component.scss'
})
export class AuctionComponent implements OnInit {
  data: any = null;
  auctionId: string = '';

  constructor(private auctionModel: AuctionService, private route: ActivatedRoute, private storageService: StorageService, private router: Router) {}

  @Input() auction: {
    auctionId: string;
    description: string;
    book: {
      title: string;
      ISBN: string;
      authors: string[];
      description: string;
    };
    condition: string;
    lastBid: number;
    country: string;
    province: string;
    image: string;
    expireDate: string;
    createdAt: string;
  } | undefined;

  bidAmount: number = 0;

  ngOnInit() {
    this.auctionId = this.route.snapshot.paramMap.get('auctionId') || '';
    this.auctionModel.getAuctionById(this.auctionId).subscribe(auction => {
      this.data = auction;
    });
  }

  placeBid(): void {
    if(!this.storageService.isLoggedIn()) {
      this.router.navigate(['login']);
    } else {
      if (this.bidAmount > this.data.lastBid) {
        this.data.lastBid = this.bidAmount;
        this.auctionModel.placeBid(this.auctionId, this.bidAmount).subscribe();
      } else {
        alert('Your bid must be higher than the last bid!');
      }
    }
  }
}
