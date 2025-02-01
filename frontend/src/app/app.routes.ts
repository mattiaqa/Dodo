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
import { NewListingComponent } from './features/new-listing/new-listing.component';
import { CreateAuctionComponent } from './features/new-listing/auction-data/auction-data.component';
import { SuccessPageComponent } from './features/new-listing/success-page/success-page.component';
import {ChatComponent} from './features/chat/chat.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ConfirmUserComponent } from './features/confirm-user/confirm-user.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent},
  { path: 'search', component: HomeComponent },
  { path: 'register/:token/confirm', component: RegistrationConfirmComponent },
  { path: 'auction/:auctionId', component: AuctionComponent},

  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: 'confirmUser/:token', component: ConfirmUserComponent, canActivate: [loginGuard] },


  { path: 'mydodo', component: MyDodoComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'chats', component: ChatComponent, canActivate: [authGuard] },
  { path: 'newListing', component: NewListingComponent, canActivate: [authGuard] },
  { path: 'newListing/auctionData', component: CreateAuctionComponent, canActivate: [authGuard] },
  { path: 'CreateAuctionSuccess', component: SuccessPageComponent } 
];
