import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { APIURL, EditedText } from './edited-text';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private inText :string = '';
  private apiResponseSubject = new Subject<any>();
  private updatedDataId:string = '';
  private dataList: string[] = [];
  private spanDataSubject = new BehaviorSubject<any>(null);
  spanData$ = this.spanDataSubject.asObservable();
  private editedContent: any = {};
  private editedContentSubject = new BehaviorSubject<EditedText>({ text: '', spans: [], metadata:{} });
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

  setEditedContent(content: string, list: any, data:any): void {
    let myRes:EditedText = {text: content, spans: list, metadata: data};
    this.editedContentSubject.next(myRes);
  }

  getEditedContent() {
    return this.editedContent;
  }

  getAnalyzedText(textBlock: string){
    const apiUrl = `${APIURL}/getEntities`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requestBody = { text: textBlock };
    return this.http.post(apiUrl, requestBody, {headers});
  }

  
  setCombinedResponse(combinedResponse: any[]) {
    const filteredResponses = combinedResponse.filter(response => response.success !== false);
    const flattenedArray = filteredResponses
      .flatMap(innerArrays => innerArrays.flat())
      .filter(item => item && item.ID && item.Name && item.Type);
    this.apiResponseSubject.next(flattenedArray);
  }

  getResponseSubject(){
    return this.apiResponseSubject.asObservable();
  }

}
