import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthTokenService } from './auth-token.service';
import { tap } from 'rxjs';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://localhost:8000/auth';

  constructor(
    private http: HttpClient,
    private tokenService: AuthTokenService
  ) {}

  refreshToken() {
    return this.http.post<any>(`${this.API}/refresh`, {
      refresh_token: this.tokenService.getRefreshToken()
    });
  }

  private setSession(auth: LoginResponse) {
    localStorage.setItem('access_token', auth.access_token);
    // localStorage.setItem('refresh_token', auth.refreshToken);
  }


  logout() {
    this.tokenService.clearTokens();
    window.location.href = '/login';
  }

  login(email: string, password: string) {
        return this.http.post<LoginResponse>(
            `${this.API}/login`,
            { email, password }
        ).pipe(
            tap(res => {
            this.setSession(res);
            })
        );
    }

register(name: string, email: string, password: string) {
  return this.http.post(
    `${this.API}/register`,
    { name, email, password }
  );
}


}
