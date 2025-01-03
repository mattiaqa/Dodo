import {Component, OnInit, Output} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {StorageService} from '../../storage/storage.service';
import {AuthService} from '../../services/auth.service';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuctionService} from '../../services/auction.service';
import {SharedDataService} from '../../shared/shared-data';
import {catchError, of} from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    FaIconComponent,
    NgOptimizedImage,
    RouterLink,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  protected isLoggedIn: boolean = false;
  protected avatar_url: string = '';
  searchForm: FormGroup = new FormGroup({});

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private auctionModel: AuctionService,
    private sharedDataService: SharedDataService,
  ) { }

  ngOnInit() {
    this.isLoggedIn = this.storageService.isLoggedIn();
    this.avatar_url = "http://localhost:1338/api/download/" + this.storageService.getUser().avatar;

    this.searchForm = new FormGroup({
      where: new FormControl(''),
      ISBN: new FormControl('', [Validators.pattern('^\\d{3}-\\d{1,5}-\\d{1,7}-\\d{1,7}-\\d{1}$')]),
      budget: new FormControl('', [Validators.min(0)])
    });

  }

  logout() {
    this.authService.logout().subscribe({
      next: ()=> {
        this.storageService.clean();
        window.location.reload();
      }
    });
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.auctionModel.search(this.searchForm.value).pipe(
        catchError(error => {
          if (error.status === 404) {
            this.sharedDataService.updateArray([]);
          }

          return of([]);
        })
      ).subscribe(auctions => {
        if (auctions.length > 0) {
          this.sharedDataService.updateArray(auctions);
        }
      })
    }
  }
}
