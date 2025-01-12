import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const AUTH_API = 'http://localhost:1338/api/user/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(
        AUTH_API + 'login',
        { email, password }
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
      {withCredentials: true}
    );
  }

  logout(): Observable<any> {
    return this.http.delete(AUTH_API + 'logout', { withCredentials: true });
  }

  confirmRegistration(token: string): Observable<any> {
    return this.http.get(AUTH_API + 'register/' + token + '/confirm', {withCredentials: true});
  }
}
