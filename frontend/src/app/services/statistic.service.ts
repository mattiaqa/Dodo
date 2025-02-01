import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_URL = '//localhost:1338/api/statistics/';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  constructor(private http: HttpClient) {}

  getTotalAuctions(): Observable<any> {
    return this.http.get(API_URL + 'totalAuctions', { withCredentials: true });
  }

  getAllStatistics(): Observable<any> {
    return this.http.get(API_URL, { withCredentials: true });
  }
}
