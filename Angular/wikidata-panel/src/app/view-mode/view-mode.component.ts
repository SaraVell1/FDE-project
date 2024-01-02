import { ChangeDetectorRef, Component, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { EditedText } from '../edited-text';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InfoService } from '../info.service';

@Component({
  selector: 'app-view-mode',
  templateUrl: './view-mode.component.html',
  styleUrls: ['./view-mode.component.css']
})
export class ViewModeComponent {

  author:string = '';
  title:string = '';
  editedContent: any;
  editedContentSubscription: Subscription | any;
  sanitizedText:SafeHtml = '';
  cardOpen:boolean = false;
  panelHeader:Array<string> = [];
  panelContent:Array<string> = [];
  entities: { type: string, names: string[] }[] = [];

  constructor(private apiService: ApiService, private sanitizer: DomSanitizer, private el: ElementRef, private infoService: InfoService, private cdr: ChangeDetectorRef){}

  ngOnInit(){
     this.editedContentSubscription = this.apiService.editedContent$.subscribe(
      (content: any) => {
        this.editedContent = this.formatText(content.text, content.spans);
        this.author = content.metadata['Author'] === null ? '': content.metadata['Author'];
        this.title = content.metadata['Title'] === null ? '': content.metadata['Title'];
        this.setHeaders(content.spans);      
        this.createSummaryPanel(content.spans);
      });
  }

  setHeaders(spans:any){
    spans.forEach((item:any)=>{
      this.panelHeader.push(item.Type);
    });
    this.panelHeader = Array.from(new Set(this.panelHeader));
    console.log("Headers", this.panelHeader);
  }

  setPanelsEntity(spans:any, header:string){
    this.panelContent = [];
    spans.forEach((item:any)=>{
      if(item.Type === header){
        this.panelContent.push(item.Name);
      }
    })
    console.log("PanelContent", this.panelContent)
    return this.panelContent   
  }

  createSummaryPanel(spans:any){
    this.panelHeader.forEach((item: any) => {
      const entity: { type: string, names: string[] } = { type: item, names: [] };
      this.setPanelsEntity(spans, item).forEach((name: string) => {
        entity.names.push(name);
      });
      this.entities.push(entity);
    });
    console.log("entities", this.entities);
  }

  formatText(text: string, response: any) {
    const flatResponse = response.flatMap((array: any) => array);
    const sentencesBetweenNewLines = 5;

    flatResponse.forEach((item: any) => {
        const spanElement = document.createElement('span');
        spanElement.textContent = item.Name;
        spanElement.className = 'entitySpan';
        spanElement.id = item.ID;
        spanElement.setAttribute('type', item.Type)         
   
        const spanHtml = spanElement.outerHTML;
        const regex = new RegExp(item.Name, 'g');
        text = text.replace(regex, spanHtml);
    });

  
    const sentences = text.match(/[^.!?]*((?:[.!?]["']*)|(?:$))/g) || [];

    let sentenceCountProcessed = 0;
    let modifiedText = '';

    sentences.forEach((sentence) => {
        sentenceCountProcessed++;
        if (sentenceCountProcessed % sentencesBetweenNewLines === 0 && sentenceCountProcessed < sentences.length) {
            modifiedText += `<br/><br/>`;
        }
        modifiedText += sentence;
    });

    this.sanitizedText = this.sanitizer.bypassSecurityTrustHtml(modifiedText);
    this.editedContent = this.sanitizedText;
    return this.editedContent;
  }

  addClickEventToEntitySpans() {
    const entitySpans = document.querySelectorAll('.entitySpan');
  
    entitySpans.forEach((element: Element) => {
      const spanElement = element as HTMLElement;
      if (spanElement.classList.contains('entitySpan')) {
        const itemId = spanElement['id'];
        const itemType = spanElement.getAttribute('type');
        spanElement.addEventListener('click', (event) => {
          this.closePanel(false);
          if (itemId && itemType) {
            this.getIdInfo(itemType, itemId);
          } else {
            console.log('Item ID not found on clicked element.');
          }
        });
      }
    });
  }
  
  
  getIdInfo(itemType:string, itemId:string){
    this.infoService.getEntityInfo(itemType, itemId).subscribe((response)=>{
      if(response.type === "Human"){
        this.cardOpen = true;
        this.infoService.setEntityData(response);
      }
      else if(response.type === "Location"){
        this.cardOpen = true;
        this.infoService.setEntityData(response);
      }
      else if(response.type === "Space"){
          this.cardOpen = true;
          this.infoService.setEntityData(response);
      }
      else if(response.type === "Other"){
        this.cardOpen = true;
        this.infoService.setEntityData(response);
      }
    })
  }

  closePanel(event:any){
    this.cardOpen = event;
  }
  ngOnDestroy(): void {
    this.editedContentSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this.addClickEventToEntitySpans();
  }

  
}
