import { Component } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-success-page',
  standalone: true,
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss']
})
export class SuccessPageComponent {
  message: string = 'Successfully Published!';

  constructor(private route: ActivatedRoute, private router: Router) {
    const state = this.route.snapshot.data['state'];
    if (state?.message) {
      this.message = state.message;
    }
  }

  goToProfilePage()
  {
    this.router.navigate(['/profile']);
  }
}
