import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-view-mode',
  templateUrl: './view-mode.component.html',
  styleUrls: ['./view-mode.component.css']
})
export class ViewModeComponent implements OnInit {

  inText: string = '';
  formattedText: SafeHtml = '';
  loading: boolean = false;
  value: number = 0;


  constructor(private apiService:ApiService, private sanitizer: DomSanitizer){}

  ngOnInit(): void {
    this.getResult();
  }

  getResult(){
    this.loading = true;
    this.inText = this.apiService.getText();
    this.apiService.getResponseSubject().subscribe((apiResponse)=> {
      this.formattedText = this.sanitizer.bypassSecurityTrustHtml(this.formatText(this.inText, apiResponse));
      this.loading = false;
    })
  }
  // Galileo Galilei and Filippo Salviati were astronomers
  formatText(text:string, response:any){
    const flatResponse = response.flatMap((array: any) => array);
    const namePattern = new RegExp(
      flatResponse.map((item: { Name: string; }) => `\\b${item.Name}\\b`).join('|'),
      'g'
    );
    const formattedText = text.replace(namePattern, (match) => {
    const matchedItem = flatResponse.find((item: { Name: string; }) => item.Name === match);
    console.log(matchedItem)
    if (matchedItem) {
      return `<span data-id="${matchedItem.ID}" class="mySpan">${match}</span>`;
    } else {
      return match;
    }
  });

  return formattedText;
}
}
