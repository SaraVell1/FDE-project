import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private inText :string = '';
  private apiResponse: any;
  private apiResponseSubject = new Subject<any>();
  private updatedDataId:string = '';

  constructor(private http:HttpClient) { }

  setText(text:string){
    this.inText = text;
  }

  getText(): string{
    return this.inText;
  }

  getUpdatedDataId(): string {
    return this.updatedDataId;
  }

  setUpdatedDataId(updatedDataId: string) {
    this.updatedDataId = updatedDataId;
  }

  getAnalyzedText(){
    const apiUrl = 'http://127.0.0.1:8888';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestBody = {text: this.inText}

    // return this.http.post(apiUrl, requestBody).pipe(tap((response) => {
    //   this.apiResponse = response;
    this.http.post(apiUrl, requestBody).subscribe((response)=> {
      this.apiResponseSubject.next(response);
    })
  }

  getResponseSubject(){
    return this.apiResponseSubject.asObservable();
  }
  getResponse():any{
    return this.apiResponse;
  }
}
