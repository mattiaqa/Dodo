import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { config } from '../config/default'

const API_URL = `//${config.hostname}/api/statistics/`;

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
