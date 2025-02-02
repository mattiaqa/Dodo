import {Component, OnInit} from '@angular/core';
import {StorageService} from '../../storage/storage.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {NavbarComponent} from '../../layout/navbar/navbar.component';
import {FooterComponent} from '../../layout/footer/footer.component';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {CardComponent} from './components/card/card.component';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../layout/toast/toast.component';
import { SharedDataService } from '../../shared/shared-data';
import { faImage, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { config } from '../../config/default'

@Component({
  selector: 'app-profile',
  imports: [
    NgForOf,
    NavbarComponent,
    FooterComponent,
    DatePipe,
    FaIconComponent,
    NgIf,
    CardComponent,
    ToastComponent
  ],
  templateUrl: './profile.component.html',
  standalone: true,
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: any = {};
  savedAuctions: any[] = [];
  avatar_url: string = '';
  showMenu = false; // Controlla la visibilità del menu
  faImage = faImage;
  faTrashAlt = faTrashAlt;

  constructor(
    protected storageService: StorageService,
    private userService: UserService,
    private toastService: ToastService,
    private sharedDataService: SharedDataService,
  ) {}

  ngOnInit(): void {
    this.sharedDataService.dataAvatarUrl$.subscribe(url => {
      this.avatar_url = url;
    });

    this.user = this.storageService.getUser();
    this.savedAuctions = this.user.savedAuctions || [];
    if(this.user.avatar){
      this.avatar_url = `http://${config.hostname}/api/download/avatar/` +  this.user.avatar;
    }
    else{
      this.avatar_url = this.user.defaultAvatar;
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

setNewImage(event: Event) {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];

  if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
  }

  const formData = new FormData();
  formData.append('avatar', file, file.name);

  this.userService.setUserProfilePicture(formData).subscribe({
    next: () => {
      const userId = this.storageService.getUser().id;
      this.userService.getUserInfo(userId).subscribe(user => {
        this.storageService.saveUser(user);
        this.sharedDataService.updateAvatarUrl(`http://${config.hostname}/api/download/avatar/` +  user.avatar);
      });
    },
    error: (err) => {
      console.error('An error occured during the edit process of the image:', err);
      console.log(err.error.message)
      this.toastService.showToast({
        message: err.error.message,
        type: 'error',
        duration: 8000
      });
    }
  })
  this.showMenu = false;

  // Reset del valore dell'input per permettere la selezione dello stesso file nuovamente
  input.value = '';
}

  // Metodo per rimuovere l'immagine esistente
  removeExistingImage() {
    const formData = new FormData();
    this.userService.setUserProfilePicture(formData).subscribe({
      next: () => {
        const userId = this.storageService.getUser().id;
        this.userService.getUserInfo(userId).subscribe(user => {
          this.storageService.saveUser(user);
          this.sharedDataService.updateAvatarUrl(user.defaultAvatar);
        });
      },
      error: (err) => {
        console.error('An error occured during the edit process of the image:', err);
        console.log(err.error.message)
        this.toastService.showToast({
          message: err.error.message,
          type: 'error',
          duration: 8000
        });
      }
    })
    this.showMenu = false;
  }
}
