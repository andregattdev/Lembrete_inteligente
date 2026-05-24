import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  get currentUser() {
    return this.currentUserSubject.asObservable();
  }

  get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(credentials: { username: string; password?: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => {
        if (user && user.id) {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/register`, user).pipe(
      tap(newUser => {
        if (newUser && newUser.id) {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(newUser));
          }
          this.currentUserSubject.next(newUser);
        }
      })
    );
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr) as User;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }
}