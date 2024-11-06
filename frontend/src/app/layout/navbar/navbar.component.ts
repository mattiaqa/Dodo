import { Component, OnInit } from '@angular/core';
import { AvatarComponent } from './avatar/avatar.component';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import {MenuItem} from "primeng/api";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    AvatarComponent,
    ButtonModule,
    FontAwesomeModule,
    MenuModule,
    ToolbarModule
  ],
  providers: [DialogService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{
  
  location: string = "Anywhere";
  
  //login () => this.authService.login();
  //logout () => this.authService.logout();

  currentMenuItems: MenuItem[] | undefined = [];

  ngOnInit(): void {
    this.fetchMenu();
  }

  private fetchMenu() {
    return [
      {
        label: "Sign up",
        styleClass: "font-bold"
      },
      {
        label: "Log in",
      }
    ]
  }
}
