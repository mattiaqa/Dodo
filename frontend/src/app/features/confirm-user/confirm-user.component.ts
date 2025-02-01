import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-confirm-user',
  imports:[
    FaIconComponent,
    NgIf,
  ],
  templateUrl: './confirm-user.component.html',
  styleUrls: ['./confirm-user.component.scss']
})
export class ConfirmUserComponent implements OnInit {
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    protected router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');

    if (token) {
      this.authService.confirmRegistration(token).subscribe({
        next: () => {
          sessionStorage.setItem('accountConfirmed', 'true'); // ✅ Salva stato
          this.router.navigate(['/login']); // 🔄 Redirect alla login
        },
        error: (error) => {
          this.errorMessage = error.error.message || "Account activation failed.";
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = "Invalid activation link.";
      this.isLoading = false;
    }
  }
}
