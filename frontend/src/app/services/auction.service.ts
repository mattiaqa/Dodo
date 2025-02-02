import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { config } from '../config/default'

const API_URL = `//${config.hostname}/api/auction`;

@Injectable({
  providedIn: 'root',
})
export class AuctionService {
  constructor(private http: HttpClient) {}

  createAuction(body: any): Observable<any> {
    return this.http.post(API_URL + '/', body, { withCredentials: true });
  }

  editAuction(auctionId: string, body: any): Observable<any> {
    return this.http.put(API_URL + '/' + auctionId, body, { withCredentials: true });
  }

  getAllAuction(): Observable<any> {
    return this.http.get(API_URL, { withCredentials: true });
  }

  getAuctions(params: any): Observable<any> {
    return this.http.get(API_URL, {
      params: params,
      withCredentials: true
    });
  }

  getAuctionById(auctionId: string): Observable<any> {
    return this.http.get(API_URL + '/' + auctionId, { withCredentials: true });
  }

  search(query: any): Observable<any> {
    return this.http.post(API_URL + '/search', query, { withCredentials: true });
  }

  getAuctionComments(auctionId: string): Observable<any> {
    return this.http.get(API_URL + '/' + auctionId + '/comment', {withCredentials: true } );
  }

  submitComment(auctionId: string, comment: string): Observable<any> {
    return this.http.post(API_URL +  '/' + auctionId + '/comment', {"comment": comment}, { withCredentials: true });
  }

  placeBid(auctionId: string, bid: number): Observable<any> {
    return this.http.post(API_URL + '/' + auctionId + '/bid', {amount: bid}, { withCredentials: true });
  }

  deleteAuction(auctionId: string): Observable<any> {
    return this.http.delete(API_URL + '/' + auctionId, {withCredentials: true});
  }

  getBidsByAuctionId(auctionId: string): Observable<any> {
    return this.http.get(API_URL + '/' + auctionId + '/bid', {withCredentials: true});
  }

  likeAuction(auctionId: string): Observable<any> {
    return this.http.post(API_URL + '/' + auctionId + '/like', { withCredentials: true });
  }

  dislikeAuction(auctionId: string): Observable<any> {
    return this.http.post(API_URL + '/' + auctionId + '/dislike', { withCredentials: true });
  }

  deleteComment(commentId: string): Observable<any> {
    return this.http.delete(API_URL + '/' + commentId + '/delete', {withCredentials: true});
  }
}
