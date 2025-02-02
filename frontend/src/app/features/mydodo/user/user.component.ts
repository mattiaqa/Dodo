import {Component, OnInit} from '@angular/core';
import {CreatedCardComponent} from "../components/created-card/created-card.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgForOf, NgIf} from "@angular/common";
import {PartecipatedCardComponent} from "../components/partecipated-card/partecipated-card.component";
import {WonCardComponent} from "../components/won-card/won-card.component";
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-user',
  imports: [
    CreatedCardComponent,
    FaIconComponent,
    NgForOf,
    NgIf,
    PartecipatedCardComponent,
    WonCardComponent
  ],
  templateUrl: './user.component.html',
  standalone: true,
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit{
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
