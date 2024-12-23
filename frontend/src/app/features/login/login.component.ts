import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../storage/storage.service';
import {FormsModule} from '@angular/forms';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    FaIconComponent,
    NgIf,
    RouterLink,
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

  constructor(private  authService: AuthService, private router: Router, private storageService: StorageService) { }

  ngOnInit() {
    if(this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
    }
  }

  onSubmit() {
    const { email, password } = this.form;

    this.authService.login(email, password).subscribe({
      next: data => {
        this.storageService.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;

        this.router.navigate(['/']);
      },
      error: error => {
        this.errorMessage = "Wrong Credentials!";
        this.isLoginFailed = true;
      }
    })
  }
}
