import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, AfterViewInit, Injector, ComponentRef, ComponentFactoryResolver, ChangeDetectorRef, HostListener, Renderer2 } from '@angular/core';
import { EditedText } from '../edited-text';
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
  formattedText: string = '';
  loading: boolean = false;
  value: number = 0;
  spanDataList: any[] = [];
  selectedSpanData: any = null;
  spanContainer: any;
  response: any;
  textFragments: any[] = [];
  dataL:string[] = [];
  spansSaved: boolean = false;
  highlightedText:string = '';
  addingNewSpan:boolean = false;
  editedContent: any;
  fragList:any[] = [];
  private componentRef: ComponentRef<ClickableSpanComponent> | null = null;
  private dynamicComponentRef: ComponentRef<ClickableSpanComponent> | null = null;

  editableText : any;
  maxSentenceNumber = 10;
  paragraphs: string[] = [];

  @ViewChild('spanContainer', {read: ViewContainerRef}) spans: ViewContainerRef | any;
  @ViewChild('formattedTextContainer', {static: true}) formattedTextContainer: ElementRef | any;

  constructor(private sanitizer: DomSanitizer, private el:ElementRef, private apiService:ApiService, private componentFactoryResolver: ComponentFactoryResolver, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this.apiService.spanData$.subscribe((spanData) => {
      console.log('Updated spanData:', spanData);
    });
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
      this.response = [...apiResponse];
    this.formatText(this.inText, this.response);
      this.loading = false;
    })
  }
  
  formatText(text: string, response: any) {
    const flatResponse = response.flatMap((array: any) => array);
    const sentencesBetweenNewLines = 5;

    flatResponse.forEach((item: any) => {
        const spanElement = document.createElement('span');
        spanElement.textContent = item.Name;
        spanElement.className = 'mySpan ' + item.ID;
        const spanHtml = spanElement.outerHTML;

        const regex = new RegExp(item.Name, 'g');
        text = text.replace(regex, spanHtml);
    });
    const sentences = text.match(/[^.!?]*((?:[.!?]["']*)|(?:$))/g) || [];

    let sentenceCountProcessed = 0;
    let modifiedText = "";

    sentences.forEach((sentence) => {
        sentenceCountProcessed++;
        if (sentenceCountProcessed % sentencesBetweenNewLines === 0 && sentenceCountProcessed < sentences.length) {
            modifiedText += `<br/><br/>`;
        }
        modifiedText += sentence;
    });

    this.editableText = modifiedText;
    this.fragList = this.response;
    return this.editableText;
}
  
  handleSpanClick(spanData: any) {
    console.log('Span clicked:', spanData);
    this.selectedSpanData = spanData;

    const factory = this.componentFactoryResolver.resolveComponentFactory(ClickableSpanComponent);
    this.dynamicComponentRef = this.spans.createComponent(factory);
    
    if (this.dynamicComponentRef) {
      const dynamicComponent = this.dynamicComponentRef.instance;
      dynamicComponent.text = spanData.Name;
      dynamicComponent.dataId = spanData.ID;
      dynamicComponent.dataClass = spanData.Type;
      dynamicComponent.dataList = spanData.Candidates;
      dynamicComponent.openCard();

      dynamicComponent.updateSpan.subscribe((data: any) => {
        if (this.componentRef) {
          this.componentRef.instance.dataList = data.dataList;
          this.componentRef.instance.selectedValue = data.dataList.length > 0 ? data.dataList[0] : '';
          this.componentRef.instance.dataId = data.dataId;
          this.componentRef.instance.dataClass = data.dataClass;
        }
        spanData.ID = data.dataId;
        spanData.Candidates = data.dataList;
        spanData.Type = data.dataClass;
 
        this.cdr.detectChanges();
        this.editableText = this.formatText(this.inText, this.response);
      });
    
      this.spans.insert(this.dynamicComponentRef.hostView);
      if (this.componentRef) {
        this.componentRef.destroy();
      }
      this.componentRef = this.dynamicComponentRef;
    }
  }
  
  addNewSpan() {
    if (this.highlightedText) {
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const spanData = { Name: this.highlightedText, ID: '', Candidates: [] };

        this.fragList.push(spanData);
        this.handleSpanClick(spanData);
        this.editableText = this.formatText(this.inText, this.response);
      }
     }
  }
  

  deleteEntity(spanData: any) {
    console.log('deleteEntity called');  
    var myDiv = document.getElementById('book');
    var targetId = spanData.ID;
    console.log('Target ID:', targetId);

    if (myDiv) {
        if (myDiv.querySelector(`span.${targetId}`)) {
            var spanEl = this.el.nativeElement.querySelector(`span.${targetId}`);
            console.log("spanEl", spanEl);

            if (spanEl && spanEl.textContent !== null) {
                console.log("Im in the if");
                var textNode = document.createTextNode(spanEl.textContent);
                spanEl.parentNode?.replaceChild(textNode, spanEl);
                this.popOutFromArray(spanData);
            } else {
                console.log("Span element not found or has no text content.");
            }
        } else {
            console.log("Span element not found in the DOM.");
        }
    } else {
        console.log("Div element not found.");
    }
  }

  popOutFromArray(element:any){
    const index = this.fragList.indexOf(element);
    if(index !== -1){
      this.fragList.splice(index, 1);
    }
  }  
 
  highlightAndOpenCard(event: MouseEvent) {
    const selection = window.getSelection();
    if (selection) {
      const highlightedText = selection.toString();
      this.highlightedText = highlightedText;
    }
  }


  saveText() {
    this.fragList = this.findType(this.fragList);
    this.apiService.setEditedContent(this.inText, this.fragList);
    console.log('The text has been saved!', this.fragList);
  }

  findType(list:any){
    let type:any;
    let humanArray = ["PERSON", "Deity", "Group of fictional characters"];
    let planetArray = ["Natural satellite", "satellite", "planet", "Astronomical object"]
    list.forEach((entity:any) => {
      type = entity.Type;
      if(humanArray.find(x => x.valueOf() === type)){
        entity.Type = "Human"
      }
    });
    console.log(this.fragList);
    return this.fragList;
  }
}
