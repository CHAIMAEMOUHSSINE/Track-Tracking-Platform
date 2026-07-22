import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private api = "http://localhost:8080/api/auth";

  login(email: string, password: string): Observable<any> {

    return this.http.post(`${this.api}/login`, {
      email,
      password
    });

  }

}
