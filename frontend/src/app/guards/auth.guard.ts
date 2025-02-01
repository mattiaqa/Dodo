import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  if (!storageService.isLoggedIn()) {
    // Salva l'URL a cui l'utente voleva accedere
    localStorage.setItem('redirectUrl', state.url);

    // Reindirizza al login
    router.navigate(['/login']);
    return false;
  }

  return true;
};
