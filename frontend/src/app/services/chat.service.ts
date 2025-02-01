import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_URL = '//localhost:1338/api/chat/';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient) {}

  getUserChat(): Observable<any> {
    return this.http.get(API_URL + 'all', { withCredentials: true });
  }

  getChatContent(auctionId: string): Observable<any> {
    return this.http.get(API_URL + auctionId + 'content', { withCredentials: true });
  }

  sendMessage(chatId: string, content: string): Observable<any> {
    return this.http.post(API_URL + 'send', {chatId, content}, { withCredentials: true });
  }

  getChatId(auctionId: string): Observable<any> {
    return this.http.get(API_URL + auctionId + '/chat', { withCredentials: true });
  }
}
