import { Component, OnInit, SecurityContext, ViewContainerRef, Renderer2, ComponentFactoryResolver, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ClickableSpanComponent } from '../clickable-span/clickable-span.component';

@Component({
  selector: 'app-edit-mode',
  templateUrl: './edit-mode.component.html',
  styleUrls: ['./edit-mode.component.css']
})
export class EditModeComponent implements OnInit, AfterViewInit {

  inText: string = '';
  formattedText: SafeHtml = '';
  loading: boolean = false;
  value: number = 0;
  spanDataList: any[] = [];
  selectedSpanData: any = null;
  spanContainer: any;
  response: any;
  textFragments: any[] = [];

  @ViewChild('spanContainer', {read: ViewContainerRef}) spans: ViewContainerRef | any;
  @ViewChild('formattedTextContainer', {static: true}) formattedTextContainer: ElementRef | any;

  constructor(private apiService:ApiService, private sanitizer: DomSanitizer, private componentFactoryResolver: ComponentFactoryResolver, private renderer: Renderer2, private el: ElementRef){}

  ngOnInit(): void {
    this.getResult();
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit called")
    if (this.response) {
      console.log("the response is arrived", this.response)
      this.formatText(this.inText, this.response);
    }
    
  }

  getResult(){
    this.loading = true;
    this.inText = this.apiService.getText();
    this.apiService.getResponseSubject().subscribe((apiResponse)=> {
      this.response = apiResponse;
    this.formatText(this.inText, apiResponse);
      this.loading = false;
    })
  }
  //Galileo Galilei and Filippo Salviati were astronomers
  // formatText(text: string, response: any) {
  //   const flatResponse = response.flatMap((array: any) => array);
  
  //   const spanDataList: any[] = [];
  //   const container = this.formattedTextContainer.nativeElement;
  
  //   flatResponse.forEach((item: any) => {
  //     if (item.Name && item.ID && item.Type && item.Candidates) {
  //       const name = item.Name;
  //       const namePattern = new RegExp(`\\b${name}\\b`, 'g');
  //       const spanData = {
  //         Name: item.Name,
  //         ID: item.ID,
  //         Type: item.Type,
  //         Candidates: item.Candidates,
  //       };
  //       spanDataList.push(spanData);
  
  //       // Create a span element
  //       const spanElement = this.renderer.createElement('span');
  //       this.renderer.addClass(spanElement, 'mySpan');
  //       this.renderer.setProperty(spanElement, 'textContent', name);
  
  //       // Add a click event listener to the span
  //       this.renderer.listen(spanElement, 'click', () => this.handleSpanClick(spanData));
  
  //       // Append the span element to the container
  //       this.renderer.appendChild(container, spanElement);
  //       text = text.replace(namePattern, `<span class="mySpan" (click)="handleSpanClick(${JSON.stringify(spanData)})">${name}</span>`);

  //     }
  //   });
  
  //   this.spanDataList = spanDataList;
  //   console.log("this is the spanDataList",this.spanDataList)
  //   this.formattedText = this.sanitizer.bypassSecurityTrustHtml(text);

  //}
  formatText(text: string, response: any) {
    const flatResponse = response.flatMap((array: any) => array);
  
    const textFragments: any[] = [];
    let currentIndex = 0;
  
    flatResponse.forEach((item: any) => {
      if (item.Name && item.ID && item.Type && item.Candidates) {
        const name = item.Name;
        const namePattern = new RegExp(`\\b${name}\\b`, 'g');
        const spanData = {
          Name: item.Name,
          ID: item.ID,
          Type: item.Type,
          Candidates: item.Candidates,
        };
  
        const matches = text.match(namePattern);
        if (matches) {
          matches.forEach(match => {
            // Extract the text before the span
            const beforeText = text.slice(currentIndex, text.indexOf(match, currentIndex));
            if (beforeText) {
              textFragments.push({ type: 'text', text: beforeText });
            }
  
            // Add the span data
            textFragments.push({ type: 'span', text: match, data: spanData });
            currentIndex = text.indexOf(match, currentIndex) + match.length;
          });
        }
      }
    });
  
    // Add any remaining text after the last span
    const remainingText = text.slice(currentIndex);
    if (remainingText) {
      textFragments.push({ type: 'text', text: remainingText });
    }
  
    this.textFragments = textFragments;
  }
    
  
  handleSpanClick(spanData: any) {
    // Handle the click event for the spanData
    // You can open a card or perform any other desired action here
    console.log('Span clicked:', spanData);
    this.selectedSpanData = spanData;
  }
  updateSpanData(data: any, index: number) {
    this.spanDataList[index] = data;
  }
}

