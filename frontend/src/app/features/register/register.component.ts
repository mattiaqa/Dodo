import {Component, OnInit} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from '../../services/auth.service';
import {StorageService} from '../../storage/storage.service';

@Component({
  selector: 'app-register',
    imports: [
        FaIconComponent,
        FormsModule,
        NgIf,
        ReactiveFormsModule
    ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  form: any = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  isRegisterFailed: boolean = false;
  errorMessage: string = '';
  confirmMessage: string = '';

  constructor(private  authService: AuthService, private router: Router, private storageService: StorageService) { }

  ngOnInit() {
  }

  onSubmit() {
    const { name, email, password, passwordConfirmation } = this.form;

    if(password != passwordConfirmation) {
      this.isRegisterFailed = true;
      this.errorMessage = 'Passwords do not match';
    } else {
      this.authService.register(name, email, password, passwordConfirmation).subscribe({
        next: data => {
          this.confirmMessage = "Please check your email, an activation link has been sent to you.";
        },
        error: error => {
          this.errorMessage = error.message;
          this.isRegisterFailed = true;
        }
      })
    }
  }
}
