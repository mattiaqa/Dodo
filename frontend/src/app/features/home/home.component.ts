import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from '../../layout/navbar/navbar.component';
import {FooterComponent} from '../../layout/footer/footer.component';
import {CardComponent} from './components/card/card.component';
import {NgForOf} from '@angular/common';
import {AuctionService} from '../../services/auction.service';
import {SharedDataService} from '../../shared/shared-data';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    FooterComponent,
    CardComponent,
    NgForOf
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  auctions: any[] = [];
  constructor(private auctionModel: AuctionService, private sharedDataService: SharedDataService) {}

  ngOnInit() {
    this.auctionModel.getAllAuction().subscribe(auctions => {
      this.auctions = auctions;
      this.sharedDataService.updateArray(auctions);
    });

    this.sharedDataService.dataArray$.subscribe(auctions => {
      this.auctions = auctions;
    });
  }
}
