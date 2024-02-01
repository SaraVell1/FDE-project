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
  entities: { type: string, names:{ name: string, position: number }[]}[] = [];
  spanPos: {name:string, position:number}[] = [];
  spanPositions:{ name:string, positions:number[]}[] = [];

  constructor(private apiService: ApiService, private sanitizer: DomSanitizer, private el: ElementRef, private infoService: InfoService, private cdr: ChangeDetectorRef, private renderer:Renderer2){}

  ngOnInit(){
     this.editedContentSubscription = this.apiService.editedContent$.subscribe(
      (content: any) => {
        this.editedContent = this.formatText(content.text, content.spans);
        this.author = content.metadata && content.metadata['Author'] !== undefined ? content.metadata['Author'] : '';
        this.title = content.metadata && content.metadata['Title'] !== undefined ? content.metadata['Title'] : '';
        this.setHeaders(content.spans);      
        this.createSummaryPanel(content.spans, content.text);
      });
  }

  setHeaders(spans:any){
    spans.forEach((item:any)=>{
      this.panelHeader.push(item.Type);
    });
    this.panelHeader = Array.from(new Set(this.panelHeader));
  }

  setPanelsEntity(spans:any, header:string){
    this.panelContent = [];
    spans.forEach((item:any)=>{
      if(item.Type === header){
        this.panelContent.push(item.Name);
      }
    })
    return this.panelContent   
  }

  createSummaryPanel(spans:any, text:string){
    this.panelHeader.forEach((item: any) => {
      const entity: { type: string, names: { name: string, position: number }[] } = { type: item, names: [] };
      const entityNames = this.setPanelsEntity(spans, item);
  
      entityNames.forEach((name: string) => {
        const positions = this.spanPos.filter(span => span.name === name).map(span => span.position);
  
        positions.forEach(position => {
          entity.names.push({ name, position });
          console.log("entities", entity);
        });
      });
  
      this.entities.push(entity);
    });
  }

  formatText(text: string, response: any) {
    const flatResponse = response.flatMap((array: any) => array);
    const sentencesBetweenNewLines = 5;
    let offset=0;

    flatResponse.forEach((item: any) => {
        const spanElement = document.createElement('span');
        let positions = this.findPositions(item.Name, text); 

        spanElement.textContent = item.Name;
        spanElement.className = 'entitySpan';
        spanElement.id = item.ID;
        spanElement.setAttribute('pos', positions.toString())
        spanElement.setAttribute('type', item.Type);               
   
        this.spanPos.push({name:item.Name, position: positions[0]})
        const spanHtml = spanElement.outerHTML;
        console.log("my pos", this.spanPositions)
        text = text.replace(item.Name, spanHtml);
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
  
  findPositions(name: string, text: string): number[] {
    const positions: number[] = [];
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    let match;
  
    while ((match = regex.exec(text)) !== null) {
      const position = match.index;
      positions.push(position);
    } 
    return positions;
  }
    
  goToPos(position: string): void {
    console.log("goToPos cliccato!");
    console.log("position in goToPos", position);
  
    const elements = this.el.nativeElement.querySelectorAll(`[pos="${position}"]`);
  
    console.log(elements);
    if (elements.length > 0) {
      const container = this.el.nativeElement.querySelector('#file');
      const element = elements[0] as HTMLElement;
      const entityId = element.id;
  
      const entityElement = this.el.nativeElement.querySelector(`[id="${entityId}"]`);
    if (entityElement) {
      entityElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
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
      if(response.type === "Person"){
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
