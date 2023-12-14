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
  
  constructor(private apiService: ApiService, private sanitizer: DomSanitizer, private el: ElementRef, private infoService: InfoService, private cdr: ChangeDetectorRef){}

  ngOnInit(){
     this.editedContentSubscription = this.apiService.editedContent$.subscribe(
      (content: any) => {
        this.editedContent = this.formatText(content.text, content.spans);
        this.author = content.metadata['Author'];
        this.title = content.metadata['Title'];
      });
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
          if (itemId && itemType) {
            console.log("my itemtype", itemType)
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
      console.log("My response is:", response);
      if(response.type === "Human"){
        this.cardOpen = true;
        this.infoService.setEntityData(response);
        console.log("My human data are:", response.data);
      }
      else if(response.type === "Location"){
        this.cardOpen = true;
        this.infoService.setEntityData(response);
        console.log("My location data are:", response.data);
      }
      else if(response.type === "Space"){
          this.cardOpen = true;
          this.infoService.setEntityData(response);
          console.log("My space data are:", response.data);
      }
      else if(response.type === "Default"){
        this.cardOpen = true;
        this.infoService.setEntityData(response);
        console.log("My default data are:", response.data);
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
