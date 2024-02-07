import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  private entityData:any;

  constructor(private http:HttpClient) { }

  getEntityInfo(type:string, id:string){
    const apiUrl = `http://127.0.0.1:8888/${type}/${id}`;
    const headers = new HttpHeaders({ 'Content-Type': '*/*' });

    return this.http.get(apiUrl, {headers})
  }

  setEntityData(data:any){
    this.entityData = data;
  }

  getEntityData(){
    return this.entityData;
  }
}
