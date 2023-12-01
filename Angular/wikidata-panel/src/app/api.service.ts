import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { EditedText } from './edited-text';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private inText :string = '';
  private apiResponse: any;
  private apiResponseSubject = new Subject<any>();
  private updatedDataId:string = '';
  private dataList: string[] = [];
  private spanDataSubject = new BehaviorSubject<any>(null);
  spanData$ = this.spanDataSubject.asObservable();
  private editedContent: any = {};
  private editedContentSubject = new BehaviorSubject<EditedText>({ text: '', spans: [] });
  editedContent$ = this.editedContentSubject.asObservable();


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
  updateSpanData(spanData: any) {
    this.spanDataSubject.next(spanData);
  }
  
  updateDataList(newDataList: string[]) {
    return this.dataList = newDataList;
  }

  setEditedContent(content: any): void {
    this.editedContentSubject.next(content);
  }

  getEditedContent() {
    return this.editedContent;
  }

  getAnalyzedText(textBlock: string): Observable<any> {
    const apiUrl = 'http://127.0.0.1:8888';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestBody = { text: textBlock };

    return this.http.post(apiUrl, requestBody);
  }

  setCombinedResponse(combinedResponse: any[]) {
    const flattenedArray = combinedResponse
    .flatMap(innerArrays => innerArrays.flat())
    .filter(item => item && item.ID && item.Name && item.Type);

    this.apiResponseSubject.next(flattenedArray);
  }

  getResponseSubject(){
    return this.apiResponseSubject.asObservable();
  }
  getResponse():any{
    return this.apiResponse;
  }
}
