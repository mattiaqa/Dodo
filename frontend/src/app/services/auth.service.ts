import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API = 'http://localhost:1338/api/user/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(
        AUTH_API + 'login',
        { email, password },
        { withCredentials: true }
      );
  }

  register(name: string, email: string, password: string, passwordConfirmation: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'register',
      {
        name,
        email,
        password,
        passwordConfirmation
      },
      httpOptions
    );
  }

  logout(): Observable<any> {
    return this.http.delete(AUTH_API + 'logout', { withCredentials: true });
  }

  confirmRegistration(token: string): Observable<any> {
    return this.http.get(AUTH_API + 'register/' + token + '/confirm');
  }
}
