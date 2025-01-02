import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:1338/api/auction/';

@Injectable({
  providedIn: 'root',
})
export class AuctionModel {
  constructor(private http: HttpClient) {}

  getAllAuction(): Observable<any> {
    return this.http.get(API_URL + 'all', { withCredentials: true });
  }

  getAuctionById(auctionId: string): Observable<any> {
    return this.http.get(API_URL + '/' + auctionId);
  }
}
