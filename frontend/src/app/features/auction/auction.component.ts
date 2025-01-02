import {Component, Input, OnInit} from '@angular/core';
import {NavbarComponent} from '../../layout/navbar/navbar.component';
import {FooterComponent} from '../../layout/footer/footer.component';
import {AuctionModel} from '../../models/auction.model';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-auction',
  imports: [
    NavbarComponent,
    FooterComponent,
    FaIconComponent,
    FormsModule
  ],
  templateUrl: './auction.component.html',
  styleUrl: './auction.component.scss'
})
export class AuctionComponent implements OnInit {
  data: any = null;
  auctionId: string = '';

  constructor(private auctionModel: AuctionModel, private route: ActivatedRoute) {}

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

  lastBid: number = 0;
  newBid: number = 0;

  ngOnInit() {
    this.auctionId = this.route.snapshot.paramMap.get('auctionId') || '';
    this.auctionModel.getAuctionById(this.auctionId).subscribe(auction => {
      this.data = auction;
    });
  }

  placeBid(): void {
    if (this.newBid > this.data.lastBid) {
      this.data.lastBid = this.newBid;
      this.newBid = 0;
    } else {
      alert('Your bid must be higher than the last bid!');
    }
  }
}
