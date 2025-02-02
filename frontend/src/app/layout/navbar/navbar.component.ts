import {Component, OnInit,} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {StorageService} from '../../storage/storage.service';
import {AuthService} from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuctionService} from '../../services/auction.service';
import {SharedDataService} from '../../shared/shared-data';
import {catchError, filter, first, of} from 'rxjs';
import {NotificationComponent} from './components/notification/notification.component';
import { config } from '../../config/default'

@Component({
  selector: 'app-navbar',
  imports: [
    FaIconComponent,
    NgOptimizedImage,
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    NotificationComponent,
    FormsModule,
  ],
  templateUrl: './navbar.component.html',
  standalone: true,
  styleUrl: './navbar.component.scss'
})

export class NavbarComponent implements OnInit {
  protected isLoggedIn: boolean = false;
  protected avatar_url: string = '';
  isPopupOpen: boolean = false;

  filters = {
    auctionTitle: '',
  };

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private auctionModel: AuctionService,
    private sharedDataService: SharedDataService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.isLoggedIn = this.storageService.isLoggedIn();
    this.sharedDataService.dataAvatarUrl$.subscribe(url => {
      this.avatar_url = url;
    });
    const avatar = this.storageService.getUser().avatar
    if(avatar){
      this.avatar_url = `http://${config.hostname}/api/download/avatar/` + avatar;
    }
    else{
      this.avatar_url = this.storageService.getUser().defaultAvatar
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: ()=> {
        this.storageService.clean();
        window.location.reload();
      }
    });
  }

  private searchRoute = '/search';
  onSubmit() {
    let searchTerm = '';
    if (this.filters.auctionTitle.trim().length >= 3) {
      searchTerm = this.filters.auctionTitle.trim();
    }

    if (this.router.url !== this.searchRoute) {
      const savedSearchTerm = searchTerm;

      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
      ).subscribe(() => {
        this.filters.auctionTitle = savedSearchTerm;
        this.executeSearch(savedSearchTerm);
      });

      this.router.navigate([this.searchRoute]);
    } else {
      this.executeSearch(searchTerm);
    }
  }

  executeSearch(searchTerm: string) {
    this.auctionModel.getAuctions({ auctionTitle: searchTerm, resultsPage: 1 }).pipe(
      catchError(error => {
        if (error.status === 404) {
          this.sharedDataService.updateArray([]);
        }
        return of([]);
      })
    ).subscribe(auctions => {
      this.sharedDataService.updateArray(auctions.Results);
      this.sharedDataService.updateString(searchTerm);
    });
  }

  openPopup() {
    this.isPopupOpen = true;
  }
}
