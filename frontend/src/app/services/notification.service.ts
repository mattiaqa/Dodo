import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { config } from '../config/default'

const API_URL = `//${config.hostname}/api/notification/`;

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
