import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:1338/api/user/';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUserInfo(userId: string): Observable<any> {
    return this.http.get(API_URL + userId + '/info', { withCredentials: true });
  }

  getUserAuctions(): Observable<any> {
    return this.http.get(API_URL + 'auctions', { withCredentials: true });
  }

  getUserWinning(): Observable<any> {
    return this.http.get(API_URL + 'winning', { withCredentials: true });
  }

  getUserPartecipation(): Observable<any> {
    return this.http.get(API_URL + 'partecipated', { withCredentials: true });
  }

  getUserOngoingAuctions(): Observable<any> {
    return this.http.get(API_URL + 'ongoing', { withCredentials: true });
  }

  setUserProfilePicture(body: any): Observable<any>{
    return this.http.post(API_URL + 'avatar', body, { withCredentials: true });   
  }
}
