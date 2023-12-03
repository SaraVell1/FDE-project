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

  editedContent: any;
  editedContentSubscription: Subscription | any;
  sanitizedText:SafeHtml = '';
  cardOpen:boolean = false;
  
  constructor(private apiService: ApiService, private sanitizer: DomSanitizer, private el: ElementRef, private infoService: InfoService, private cdr: ChangeDetectorRef){}

  ngOnInit(){
     this.editedContentSubscription = this.apiService.editedContent$.subscribe(
      (content: any) => {
        this.editedContent = this.formatText(content.text, content.spans);
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
        spanElement.addEventListener('click', (event) => {
          if (itemId) {
            this.getIdInfo(itemId);
          } else {
            console.log('Item ID not found on clicked element.');
          }
        });
      }
    });
  }
  
  
  getIdInfo(itemId:string){
    this.infoService.getEntityInfo(itemId).subscribe((response)=>{
      console.log("My response is:", response);
      if(response.type === "human"){
        this.cardOpen = true;
        this.infoService.setEntityData(response);
        console.log("My human data are:", response.data);
      }
      if(response.type === "city"){
        console.log("My city data are:", response.data);
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
