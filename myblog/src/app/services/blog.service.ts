import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private url = 'http://localhost:9000/createblog';

  constructor(private http: HttpClient) {}

  writeBlog(data: any) {
    return this.http.post(this.url, data);
  }
}
