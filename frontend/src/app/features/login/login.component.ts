import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../storage/storage.service';
import {FormsModule} from '@angular/forms';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {Router, RouterLink} from '@angular/router';
import {UserService} from '../../services/user.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastService} from '../../services/toast.service';
import {ToastComponent} from '../../layout/toast/toast.component';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    FaIconComponent,
    RouterLink,
    ToastComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent implements OnInit {
  form: any = {
    email: '',
    password: ''
  };
  isLoggedIn: boolean = false;
  isLoginFailed: boolean = false;
  errorMessage: string = '';

  constructor(
    private  authService: AuthService,
    private router: Router,
    private storageService: StorageService,
    private userModel: UserService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    if(this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
    }

    console.log(sessionStorage.getItem('accountConfirmed'))
    if (sessionStorage.getItem('accountConfirmed')) {
      // Aggiungi un ritardo prima del redirect
      setTimeout(() => {
        this.toastService.showToast({
          message: "Account activated successfully! You can now log in.",
          type: 'success',
          duration: 5000
        });
        sessionStorage.removeItem('accountConfirmed'); 
      }, 500);
      
  
    }
  }

  onSubmit() {
    const { email, password } = this.form;
  
    this.authService.login(email, password).subscribe({
      next: data => {
        console.log(data)
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.storageService.saveRefreshToken(data.refreshToken);
        this.authService.getCsrfToken().subscribe();
        this.userModel.getUserInfo(data._id).subscribe(user => {
          this.storageService.saveUser(user);
          const redirectUrl = sessionStorage.getItem('redirectUrl') || '/';
          sessionStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
        });
      },
      error: (error) => {
        this.isLoginFailed = true;
        this.toastService.showToast({
          message: error.error.message ?? "Invalid username or password",
          type: 'error',
          duration: 8000
        });
      }
    })


  }
}
