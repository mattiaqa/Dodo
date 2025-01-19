import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';
const REFRESH_KEY = 'refresh-token';

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

  public saveRefreshToken (token: string): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem(REFRESH_KEY);
      sessionStorage.setItem(REFRESH_KEY, token);
    }
  }

  public getToken(): any {
    if (this.isBrowser()) {
      const token = sessionStorage.getItem(REFRESH_KEY);
      if (token) {
        return token;
      }
    }
    return {};
  }

  public isUserAdmin(): boolean {
    return this.getUser().isAdmin;
  }

  public saveAuction(auctionId: string): void {
    if (this.isBrowser()) {
      let user = this.getUser();

      if (!user.savedAuctions) {
        user.savedAuctions = [];
      }

      user.savedAuctions.push(auctionId);

      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  public addToWatchlist(auctionId: string): void {
    if (this.isBrowser()) {
      let user = this.getUser();

      if (!user.watchList) {
        user.watchList = [];
      }

      user.watchList.push(auctionId);

      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }
}
