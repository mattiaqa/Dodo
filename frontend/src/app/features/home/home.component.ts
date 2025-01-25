import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from '../../layout/navbar/navbar.component';
import {FooterComponent} from '../../layout/footer/footer.component';
import {CardComponent} from './components/card/card.component';
import {NgForOf} from '@angular/common';
import {AuctionService} from '../../services/auction.service';
import {SharedDataService} from '../../shared/shared-data';
import {FormsModule} from '@angular/forms';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    FooterComponent,
    CardComponent,
    NgForOf,
    FormsModule,
    FaIconComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  auctions: any[] = [];
  filteredAuctions: any[] = [];
  filters = {
    maxPrice: 0,
    location: ''
  };

  constructor(private auctionModel: AuctionService, private sharedDataService: SharedDataService) {}

  ngOnInit() {
    this.auctionModel.getAllAuction().subscribe(auctions => {
      this.auctions = auctions.Results;
      this.filteredAuctions = auctions.Results;
      this.sharedDataService.updateArray(auctions);
    });

    this.sharedDataService.dataArray$.subscribe(auctions => {
      this.auctions = auctions;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredAuctions = this.auctions.filter(auction => {
      const matchesPrice =
        !this.filters.maxPrice || auction.lastBid >= this.filters.maxPrice;
      const matchesLocation =
        !this.filters.location ||
        auction.country.toLowerCase().includes(this.filters.location.toLowerCase());
      return matchesPrice && matchesLocation;
    });
  }
}
