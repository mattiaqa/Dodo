import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { UserService } from '../../services/user.service';
import { CardComponent } from './components/card/card.component';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-myauction',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    CardComponent,
    NgForOf
  ],
  templateUrl: './myauction.component.html',
  styleUrls: ['./myauction.component.scss']
})
export class MyauctionComponent implements OnInit {
  auctions: any[] = [];

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
  }
}
