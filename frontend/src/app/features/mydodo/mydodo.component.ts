import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import {StorageService} from '../../storage/storage.service';
import {UserComponent} from './user/user.component';
import {NgIf} from '@angular/common';
import {AdminComponent} from './admin/admin.component';
import { ToastComponent } from '../../layout/toast/toast.component';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-mydodo',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    UserComponent,
    NgIf,
    AdminComponent
  ],
  templateUrl: './mydodo.component.html',
  styleUrls: ['./mydodo.component.scss']
})

export class MyDodoComponent implements OnInit {
  isAdmin: boolean = false;
  isUserActive: boolean = true;

  constructor(
    private storageService: StorageService,
    protected toastService: ToastService,
  ) { }

  ngOnInit() {
    this.isAdmin = this.storageService.getUser().isAdmin;
  }
  
}
