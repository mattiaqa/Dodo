import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';
import { UserService } from '../../services/user.service';
import { StorageService } from '../../storage/storage.service';

@Component({
  selector: 'app-confirm-admin',
  imports: [
    FaIconComponent,
    NgIf,
  ],
  templateUrl: './confirm-admin.component.html',
  standalone: true,
  styleUrls: ['./confirm-admin.component.scss']
})
export class ConfirmAdminComponent implements OnInit {
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    protected router: Router,
    private toastService: ToastService,
    private userService: UserService,
    private storageService: StorageService,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');

    if (token) {
      this.authService.confirmInvitation(token).subscribe({
        next: () => {
          this.storageService.setAdmin();
          //sessionStorage.setItem('accountConfirmed', 'true'); // ✅ Salva stato
          this.router.navigate(['/mydodo']);
        },
        error: (error) => {
          this.errorMessage = error.error.message || "Admin activation failed.";
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = "Invalid activation link.";
      this.isLoading = false;
    }
  }
}
