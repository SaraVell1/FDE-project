import { Component, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wikidata-panel';
  searchText: string = '';
  entityData: any;
  @ViewChild("results") results: any;
  constructor(private apiService: ApiService){}


  callApi(){
    this.entityData = null;
    this.apiService.getResults(this.searchText).subscribe(response => {
      this.entityData = response;
      console.log(response);
    })
  }
}

