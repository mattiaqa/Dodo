import { Routes } from '@angular/router';
import {LoginComponent} from './features/login/login.component';
import {HomeComponent} from './features/home/home.component';
import {authGuard} from './guards/auth.guard';
import {loginGuard} from './guards/login.guard';
import {RegisterComponent} from './features/register/register.component';
import {RegistrationConfirmComponent} from './features/registration-confirm/registration-confirm.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: 'confirmRegistration/:token', component: RegistrationConfirmComponent },
];
