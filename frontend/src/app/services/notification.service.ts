import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:1338/api/notification/';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  getUserNotifications(): Observable<any> {
    return this.http.get(API_URL, { withCredentials: true });
  }

  readNotification(notificationId: string): Observable<any> {
    return this.http.post(API_URL + 'read', {notificationId: notificationId}, { withCredentials: true });
  }
}
