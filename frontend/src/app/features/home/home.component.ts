import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from '../../layout/navbar/navbar.component';
import {FooterComponent} from '../../layout/footer/footer.component';
import {CardComponent} from './components/card/card.component';
import {NgClass, NgForOf, NgIf} from '@angular/common';
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
    FaIconComponent,
    NgIf,
    NgClass
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  auctions: any[] = [];
  filteredAuctions: any[] = [];
  totalPages = 1;
  filters = {
    minPrice: null as number | null,
    maxPrice: null as number | null,
    location: '',
    condition: '',
    booktitle: '',
    author: '',
    publisher: '',
    isbn: '',
    auctionTitle: '',
    currentPage: 1,
  };

  constructor(
    private auctionModel: AuctionService, 
    private sharedDataService: SharedDataService
  ) {}

  ngOnInit() {
    this.auctionModel.getAuctions({resultsPage: this.filters.currentPage}).subscribe(auctions => {
      this.auctions = auctions.Results;
      this.filteredAuctions = auctions.Results;
      this.sharedDataService.updateArray(auctions.Results);
      this.applyFilters();
    });

    this.sharedDataService.dataArray$.subscribe(auctions => {
      this.filteredAuctions = auctions;
    });
    this.sharedDataService.dataString$.subscribe(title => {
      this.filters.auctionTitle = title;
      this.applyFilters();
    });
  }

  formatISBN(event: Event) {
    const input = event.target as HTMLInputElement;
    // Mantieni solo numeri e limita a 13 caratteri
    this.filters.isbn = input.value.replace(/[^0-9]/g, '').slice(0, 13);
  }
  
  isISBNValid(): boolean {
    return /^\d{13}$/.test(this.filters.isbn);
  }

  applyFilters(restartPage: boolean = true) {
    const params: any = {};
    
    if (this.filters.auctionTitle) params['auctionTitle'] = this.filters.auctionTitle;
    if (this.filters.location) params['where'] = this.filters.location;
    if (this.filters.minPrice != null && this.filters.minPrice >= 0) params['minPrice'] = this.filters.minPrice;
    if (this.filters.maxPrice != null && this.filters.maxPrice >= 0) params['maxPrice'] = this.filters.maxPrice;
    if (this.filters.condition) params['condition'] = this.filters.condition;
    if (this.filters.booktitle) params['bookTitle'] = this.filters.booktitle;
    if (this.filters.author) params['bookAuthor'] = this.filters.author;
    if (this.filters.publisher) params['bookPublisher'] = this.filters.publisher;
    if (this.filters.isbn && this.isISBNValid()) params['ISBN'] = this.filters.isbn;
    
    if (this.filters.currentPage){
      this.filters.currentPage = restartPage ? 1 : this.filters.currentPage;
      params['resultsPage'] = this.filters.currentPage;
    } 

    this.auctionModel.getAuctions(params).subscribe(auctions => {
      this.filteredAuctions = auctions.Results;
      this.totalPages = auctions.pages;
    });
  }

  changePage(page: number){
    this.filters.currentPage = page;
    this.applyFilters(false);
  }
}
