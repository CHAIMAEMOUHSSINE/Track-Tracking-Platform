import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private api = "http://localhost:8080/api/auth";

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, {
      email,
      password
    });

  }

  saveSession(response: LoginResponse): void {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response));
  }

  getSession(): LoginResponse | null {
    const rawSession = localStorage.getItem('auth_user');
    return rawSession ? (JSON.parse(rawSession) as LoginResponse) : null;
  }

  getHomeForRole(role?: string): string {
    switch ((role || '').toUpperCase()) {
      case 'PRODUCTION':
        return '/dashboard/production';
      case 'MAINTENANCE':
        return '/dashboard/maintenance';
      case 'EXPEDITION':
        return '/dashboard/expedition';
      default:
        return '/dashboard';
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

}
