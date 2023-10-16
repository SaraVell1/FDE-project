import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http:HttpClient) { }

  getResults(text: string){
      const apiUrl = 'http://127.0.0.1:8888';
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      return this.http.post(apiUrl, {text});
  }
}
