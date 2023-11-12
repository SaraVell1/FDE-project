import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, AfterViewInit, Injector, ComponentRef, ComponentFactoryResolver, ChangeDetectorRef } from '@angular/core';
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
  dataL:string[] = [];
  private componentRef: ComponentRef<ClickableSpanComponent> | null = null;

  @ViewChild('spanContainer', {read: ViewContainerRef}) spans: ViewContainerRef | any;
  @ViewChild('formattedTextContainer', {static: true}) formattedTextContainer: ElementRef | any;

  constructor(private apiService:ApiService, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, private cdr: ChangeDetectorRef){}

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
    console.log('Span clicked:', spanData);
    this.selectedSpanData = spanData;
    const factory = this.componentFactoryResolver.resolveComponentFactory(ClickableSpanComponent);
    //this.componentRef = factory.create(this.injector);
    this.componentRef = this.spans.createComponent(factory);  

    if(this.componentRef){
    this.componentRef.instance.text = this.selectedSpanData.Name;
    this.componentRef.instance.dataId = this.apiService.getUpdatedDataId();
    this.componentRef.instance.dataClass = this.selectedSpanData.Type;
    this.componentRef.instance.dataList = this.selectedSpanData.Candidates;

    this.componentRef.instance.openCard();
    
    this.componentRef.instance.updatedDataId = this.apiService.getUpdatedDataId();

    this.componentRef.instance.updateSpan.subscribe((data: any) => {
      const index = this.textFragments.findIndex(fragment => fragment.type === 'span' && fragment.data === spanData);
      if (index !== -1) {
        this.textFragments[index].data = data;
      }
      if(this.componentRef){
        this.componentRef.instance.dataList = data.dataList;
        this.componentRef.instance.selectedValue = data.dataList.length > 0 ? data.dataList[0] : '';        
      }
      
      spanData.ID = data.dataId;
      spanData.Candidates = data.dataList;
      console.log('Update span data:', data);
    });
    
    this.componentRef.instance.spanClick.subscribe((data: any) => {
      // Handle spanClick event
      console.log('Span clicked within dynamic component:', data);
    });
  
    this.componentRef.changeDetectorRef.detectChanges();
    // Append the dynamic component to the DOM
    this.componentRef.location.nativeElement.style.display = 'inline-block';
    this.componentRef.location.nativeElement.style.float = 'right';
    this.spans.insert(this.componentRef.hostView);
  }
}
}

