import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams} from '@angular/common/http';
import { config } from '../config/default'

const API_URL = `//${config.hostname}/api/book`;

@Injectable({
  providedIn: 'root',
})
export class BookService {
  constructor(private http: HttpClient) {}

  searchBook(criteria: { title?: string; author?: string; publisher?: string; ISBN?: string }): Observable<any> {
    // Costruisce i query params dinamicamente
    let params = new HttpParams();
    if (criteria.title) {
      params = params.append('title', criteria.title);
    }
    if (criteria.author) {
      params = params.append('author', criteria.author);
    }
    if (criteria.publisher) {
      params = params.append('publisher', criteria.publisher);
    }
    if (criteria.ISBN) {
      params = params.append('ISBN', criteria.ISBN);
    }

    console.log(params);
    // Effettua la chiamata HTTP GET con i query params
    return this.http.get<any[]>(`${API_URL}/search/local`, { params });
  }

  searchBookOnline(criteria: { title?: string; author?: string; publisher?: string; ISBN?: string }): Observable<any> {
    // Costruisce i query params dinamicamente
    let params = new HttpParams();
    if (criteria.title) {
      params = params.append('title', criteria.title);
    }
    if (criteria.author) {
      params = params.append('author', criteria.author);
    }
    if (criteria.publisher) {
      params = params.append('publisher', criteria.publisher);
    }
    if (criteria.ISBN) {
      params = params.append('ISBN', criteria.ISBN);
    }

    console.log(params);
    // Effettua la chiamata HTTP GET con i query params
    return this.http.get<any[]>(`${API_URL}/search/online`, { params });
  }

  serializeBook(book: any): Observable<any> {
    return this.http.post<any[]>(`${API_URL}/serializeBook`, book);
  }
}
