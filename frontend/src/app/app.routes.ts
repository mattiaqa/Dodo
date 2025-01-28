import { Routes } from '@angular/router';
import {LoginComponent} from './features/login/login.component';
import {HomeComponent} from './features/home/home.component';
import {loginGuard} from './guards/login.guard';
import {RegisterComponent} from './features/register/register.component';
import {RegistrationConfirmComponent} from './features/registration-confirm/registration-confirm.component';
import {AuctionComponent} from './features/auction/auction.component';
import {MyDodoComponent} from './features/mydodo/mydodo.component';
import {ProfileComponent} from './features/profile/profile.component';
import {authGuard} from './guards/auth.guard';
import {ChatComponent} from './features/chat/chat.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register/:token/confirm', component: RegistrationConfirmComponent },
  { path: 'auction/:auctionId', component: AuctionComponent},

  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },

  { path: 'mydodo', component: MyDodoComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'chats', component: ChatComponent, canActivate: [authGuard] },
];
