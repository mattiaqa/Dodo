import {Component, OnInit} from '@angular/core';
import {StorageService} from '../../storage/storage.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {NavbarComponent} from '../../layout/navbar/navbar.component';
import {FooterComponent} from '../../layout/footer/footer.component';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {CardComponent} from './components/card/card.component';

@Component({
  selector: 'app-profile',
  imports: [
    NgForOf,
    NavbarComponent,
    FooterComponent,
    DatePipe,
    FaIconComponent,
    NgIf,
    CardComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: any = {};
  savedAuctions: any[] = [];

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.user = this.storageService.getUser();
    this.savedAuctions = this.user.savedAuctions || [];
  }
}
