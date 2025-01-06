import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from '../../layout/navbar/navbar.component';
import {FooterComponent} from '../../layout/footer/footer.component';
import {UserService} from '../../services/user.service';
import {CardComponent} from './components/card/card.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-myauction',
  imports: [
    NavbarComponent,
    FooterComponent,
    CardComponent,
    NgForOf
  ],
  templateUrl: './myauction.component.html',
  styleUrl: './myauction.component.scss'
})
export class MyauctionComponent implements OnInit {
  auctions: any[] = [];
  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUserAuctions().subscribe(auctions => {
      this.auctions = auctions;
    });
  }
}
