import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { UserService } from '../../services/user.service';
import { CreatedCardComponent } from './components/created-card/created-card.component';
import {NgForOf, NgIf} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {WonCardComponent} from './components/won-card/won-card.component';
import {PartecipatedCardComponent} from './components/partecipated-card/partecipated-card.component';

@Component({
  selector: 'app-mydodo',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    CreatedCardComponent,
    NgForOf,
    NgIf,
    FaIconComponent,
    WonCardComponent,
    PartecipatedCardComponent
  ],
  templateUrl: './mydodo.component.html',
  styleUrls: ['./mydodo.component.scss']
})
export class MyDodoComponent implements OnInit {
  auctions: any[] = [];
  selectedCard: string = "listingCreated";
  userAuctions: any;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.auctions = [
      {
        auctionId: '12345',
        book: {
          title: 'The Great Gatsby',
          ISBN: '978-3-16-148410-0',
        },
        condition: 'Good',
        lastBid: 100,
        country: 'USA',
        province: 'New York',
        image: 'path/to/image.jpg',
        expireDate: '2025-12-31',
        createdAt: '2024-01-01',
        interactions: 1,
        views: 1,
      }
    ];

    this.userService.getUserAuctions().subscribe(auctions => {
      this.userAuctions = auctions;
    });
  }

  selectCard(card: any) {
    this.selectedCard = card;
  }

  protected readonly length = length;
}
