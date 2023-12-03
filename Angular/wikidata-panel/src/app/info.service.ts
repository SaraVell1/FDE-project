import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  constructor(private http:HttpClient) { }

  getEntityInfo(id:string):Observable<any>{
    console.log("GetEntityInfo in InfoService is called!");
    const apiUrl = `http://127.0.0.1:8888/${id}`;
    return this.http.get(apiUrl)
  }
}
