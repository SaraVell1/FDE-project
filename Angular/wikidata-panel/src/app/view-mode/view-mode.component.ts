import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
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
  contentSpan: Array<string> = []
  contentMetadata: any = null;
  modifiedText = '';
  @ViewChild('text') textToXML!:ElementRef;

  constructor(private apiService: ApiService, private sanitizer: DomSanitizer, private el: ElementRef, private infoService: InfoService, private cdr: ChangeDetectorRef){}

  ngOnInit(){
    this.editedContentSubscription = this.apiService.editedContent$.subscribe(
     (content: any) => {
       this.editedContent = this.formatText(content.text, content.spans);
       this.contentSpan = content.spans;
       this.contentMetadata = content.metadata;
       this.author = content.metadata && content.metadata['Author'] !== undefined ? content.metadata['Author'] : '';
       this.title = content.metadata && content.metadata['Title'] !== undefined ? content.metadata['Title'] : '';
       this.setHeaders(content.spans);      
       this.createSummaryPanel(content.spans);
     });
 }

 transformToXML(){
    const textHTML = this.textToXML.nativeElement.outerHTML;
    const xmlContent = this.convertToXML(textHTML);
    this.downloadXML(xmlContent);
 }

 convertToXML(htmlContent: string): string {
  const replacedDivContent = htmlContent.replace(/<div\s+([^>]*)>/g, "<paragraph>").replace(/<\/div>/g, "</paragraph>");
  const replacedBrContent = replacedDivContent.replace(/<br>\s*<br>/g, "</paragraph><paragraph>");
  const replacedSpanContent = replacedBrContent.replace(/<span\s+class="([^"]*)"\s+id="([^"]*)"\s+pos="([^"]*)"\s+type="([^"]*)">(.*?)<\/span>/g, "<entity class=\"$1\" id=\"$2\" pos=\"$3\" type=\"$4\">$5</entity>");
 
  return `<?xml version="1.0" encoding="UTF-8"?>
          <document>${replacedSpanContent}</document>`;
  }

  downloadXML(xmlContent: string) {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

 createSummaryPanel(spans: any) {
   this.panelHeader.forEach((item: any) => {
       const entity: { type: string, names: { name: string, position: number }[] } = { type: item, names: [] };
       const entityNames = this.setPanelsEntity(spans, item);

       const seenNames = new Set<string>(); 
       entityNames.forEach((name: string) => {
           this.spanPos
               .filter(span => span.name === name)
               .forEach(span => {
                   const uniqueName = span.name;
                   const uniquePosition = span.position;

                   if (!seenNames.has(uniqueName)) {
                       entity.names.push({ name: uniqueName, position: uniquePosition });
                       seenNames.add(uniqueName);
                   }
               });
       });
       if (!this.entities.some(e => e.type === item)) {
           this.entities.push(entity);
       }
   });
}

formatText(text: string, response: any) {
 const flatResponse = response.flatMap((array: any) => array);
 const sentencesBetweenNewLines = 5;

 flatResponse.forEach((item: any) => {
     const existingSpan = this.spanPos.find(span => span.name === item.Name);

     if (!existingSpan) {
         let positions = this.findPosition(item.Name, text);
         const spanElement = document.createElement('span');
         spanElement.textContent = item.Name;
         spanElement.className = 'entitySpan';
         spanElement.id = item.ID;
         spanElement.setAttribute('pos', positions.toString());
         spanElement.setAttribute('type', item.Type);

         this.spanPos.push({ name: item.Name, position: positions });
         const spanHtml = spanElement.outerHTML;
         const regex = new RegExp(item.Name, 'g');
         text = text.replace(regex, spanHtml);
     }
 });

 const sentences = text.match(/[^.!?]*((?:[.!?]["']*)|(?:$))/g) || [];

 let sentenceCountProcessed = 0;

 sentences.forEach((sentence) => {
     sentenceCountProcessed++;
     if (sentenceCountProcessed % sentencesBetweenNewLines === 0 && sentenceCountProcessed < sentences.length) {
         this.modifiedText += `<br/><br/>`;
     }
     this.modifiedText += sentence;
 });

 this.sanitizedText = this.sanitizer.bypassSecurityTrustHtml(this.modifiedText);
 this.editedContent = this.sanitizedText;
 return this.editedContent;
}

 findPosition(name: string, text: string){
   const regex = new RegExp(`\\b${name}\\b`, 'i');  
   const match = regex.exec(text);

   return match ? match.index : 0;
 }
 
   
 goToPos(position: string) {
   const elements = this.el.nativeElement.querySelectorAll(`[pos="${position}"]`);
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
   const entitySpans = this.el.nativeElement.querySelectorAll('.entitySpan');

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
     if(response){
       this.cardOpen = true;
       this.infoService.setEntityData(response);
     }
   })
 }

 closePanel(event:any){
   this.cardOpen = event;
 }
 ngOnDestroy(): void {
   this.apiService.setEditedContent(this.modifiedText, this.contentSpan, this.contentMetadata);
   this.editedContentSubscription.unsubscribe();
 }

 ngAfterViewInit(): void {
   this.cdr.detectChanges();
   this.addClickEventToEntitySpans();
 }
 
}