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
  selectedCard: string = "listingCreated";
  userAuctions: any[] = [];
  userWinning: any[] = [];
  userPartecipation: any[] = [];
  userOngoingAuctions: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUserAuctions().subscribe(auctions => {
      this.userAuctions = auctions;
    });

    this.userService.getUserWinning().subscribe(winning => {
      this.userWinning = winning;
    });

    this.userService.getUserPartecipation().subscribe(partecipation => {
      this.userPartecipation = partecipation;
    });

    this.userService.getUserOngoingAuctions().subscribe(auctions => {
      this.userOngoingAuctions = auctions;
    });

  }

  selectCard(card: any) {
    this.selectedCard = card;
  }

  protected readonly length = length;
}
