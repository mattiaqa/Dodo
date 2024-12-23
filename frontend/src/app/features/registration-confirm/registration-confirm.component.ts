import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-registration-confirm',
  imports: [
    RouterLink
  ],
  templateUrl: './registration-confirm.component.html',
  styleUrl: './registration-confirm.component.scss'
})
export class RegistrationConfirmComponent implements OnInit {
  token: string = '';

  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    this.authService.confirmRegistration(this.token);
  }
}
