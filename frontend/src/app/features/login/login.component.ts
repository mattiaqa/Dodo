import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../storage/storage.service';
import {FormsModule} from '@angular/forms';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {Router, RouterLink} from '@angular/router';
import {UserModel} from '../../models/user.model';

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

  constructor(private  authService: AuthService, private router: Router, private storageService: StorageService, private userModel: UserModel) { }

  ngOnInit() {
    if(this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
    }
  }

  onSubmit() {
    const { email, password } = this.form;

    this.authService.login(email, password).subscribe({
      next: data => {
        this.isLoginFailed = false;
        this.isLoggedIn = true;
      },
      error: error => {
        this.errorMessage = "Wrong Credentials!";
        this.isLoginFailed = true;
      }
    });

    this.userModel.getUserInfo().subscribe(user => {
      console.log(user);
      this.storageService.saveUser(user);

      this.router.navigate(['/']);
    })
  }
}
