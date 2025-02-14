// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface User {
  id: number;
  email: string;
  name: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);//BehaviorSubject is a type of subject, a subject is a special type of observable so you can subscribe to messages like any other observable. BehaviorSubject requires an initial value and emits the current value to new subscribers.
  currentUser$ = this.currentUserSubject.asObservable();//asObservable() method returns an observable that you can subscribe to.
  
  constructor(
    private http: HttpClient,//Inject HttpClient
    private router: Router//Inject Router
  ) {
    // Check localStorage for existing user session
    const storedUser = localStorage.getItem('currentUser');//Get the user from localStorage
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));//Set the user to currentUserSubject
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(user => this.setCurrentUser(user))
      );
  }

  register(userData: {//userData is an object that contains name, email, password, and confirmPassword
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(
        tap(user => this.setCurrentUser(user))
      );
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token,
      password
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}