import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }

  clean(): void {
    if (this.isBrowser()) {
      sessionStorage.clear();
    }
  }

  public saveUser(user: any): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  public getUser(): any {
    if (this.isBrowser()) {
      const user = sessionStorage.getItem(USER_KEY);
      if (user) {
        return JSON.parse(user);
      }
    }
    return {};
  }

  public isLoggedIn(): boolean {
    if (this.isBrowser()) {
      const user = sessionStorage.getItem(USER_KEY);
      return user != null;
    }
    return false;
  }
}
