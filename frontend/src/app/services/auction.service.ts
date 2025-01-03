import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:1338/api/auction/';

@Injectable({
  providedIn: 'root',
})
export class AuctionService {
  constructor(private http: HttpClient) {}

  getAllAuction(): Observable<any> {
    return this.http.get(API_URL, { withCredentials: true });
  }

  getAuctionById(auctionId: string): Observable<any> {
    return this.http.get(API_URL + '/' + auctionId);
  }

  search(query: any): Observable<any> {
    return this.http.post(API_URL + 'search', query, { withCredentials: true });
  }

  getAuctionComments(auctionId: string): Observable<any> {
    return this.http.get(API_URL + auctionId + '/comments' );
  }

  submitComment(auctionId: string, comment: string): Observable<any> {
    return this.http.post(API_URL + auctionId + '/comment', {"comment": comment}, { withCredentials: true });
  }
}
