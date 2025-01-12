import { Routes } from '@angular/router';
import {LoginComponent} from './features/login/login.component';
import {HomeComponent} from './features/home/home.component';
import {loginGuard} from './guards/login.guard';
import {RegisterComponent} from './features/register/register.component';
import {RegistrationConfirmComponent} from './features/registration-confirm/registration-confirm.component';
import {AuctionComponent} from './features/auction/auction.component';
import {MyauctionComponent} from './features/myauction/myauction.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: 'register/:token/confirm', component: RegistrationConfirmComponent },

  { path: 'auction', component: AuctionComponent},

  { path: 'myauction', component: MyauctionComponent},
];
