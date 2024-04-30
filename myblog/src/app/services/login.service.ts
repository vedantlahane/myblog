import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  url = 'http://localhost:9000/login';
  constructor(private http: HttpClient) {}
  loginUser(data: any) {
    return this.http.post(this.url, data);
  }
}
