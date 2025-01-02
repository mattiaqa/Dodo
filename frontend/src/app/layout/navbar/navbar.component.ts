import {Component, OnInit} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import {StorageService} from '../../storage/storage.service';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    FaIconComponent,
    NgOptimizedImage,
    RouterLink,
    NgIf
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  protected isLoggedIn: boolean = false;
  constructor(private storageService: StorageService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoggedIn = this.storageService.isLoggedIn();
  }

  logout() {
    this.authService.logout()
  }
}
