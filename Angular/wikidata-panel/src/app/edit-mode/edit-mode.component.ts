import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, AfterViewInit, Injector, ComponentRef, ComponentFactoryResolver, ChangeDetectorRef, HostListener, Renderer2 } from '@angular/core';
import { EditedText } from '../edited-text';
import { ApiService } from '../api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ClickableSpanComponent } from '../clickable-span/clickable-span.component';
import { Subscription } from 'rxjs';

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
  selectedSpanData: any = null;
  spanContainer: any;
  response: any;
  textFragments: any[] = [];
  dataL:string[] = [];
  spansSaved: boolean = false;
  highlightedText:string = '';
  editedContent: any;
  fragList:any[] = [];
  private componentRef: ComponentRef<ClickableSpanComponent> | null = null;
  private dynamicComponentRef: ComponentRef<ClickableSpanComponent> | null = null;

  editableText : any;
  dialogVisible: boolean = false;
  titleValue: string = '';
  authorValue: string = '';
  metadata: any;

  @ViewChild('spanContainer', {read: ViewContainerRef}) spans: ViewContainerRef | any;
  @ViewChild('formattedTextContainer', {static: true}) formattedTextContainer: ElementRef | any;
  editedContentSubscription: Subscription | any;

  constructor( private el:ElementRef, private apiService:ApiService, private componentFactoryResolver: ComponentFactoryResolver, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    const savedContent = this.apiService.getEditedContent();
    if (savedContent && savedContent.text && savedContent.spans && savedContent.spans.length > 0) {
      this.editedContentSubscription = this.apiService.editedContent$.subscribe(
        (content: any) => {
          this.inText = content.text;
          this.fragList = content.spans;
          this.metadata = content.metadata;
          setTimeout(() => {
            this.formatText(this.inText, this.fragList);
          }, 100); 
          this.loading = false;          
        })     
    }
    else{
      this.getResult();
    }
  }
  

  ngAfterViewInit() {
    if (this.response) {
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

    if(this.fragList.length === 0){
      this.fragList = this.response;
    }
    flatResponse.forEach((item: any) => {
        const spanElement = document.createElement('span');
        spanElement.textContent = item.Name;
        spanElement.className = 'mySpan ' + item.ID;
        const spanHtml = spanElement.outerHTML;

        const regex = new RegExp(item.Name, 'gi');
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
    return this.editableText;
}
  
  handleSpanClick(spanData: any) {
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
        if(this.fragList.length === 0){
          this.editableText = this.formatText(this.inText, this.response);
        }
        else{
          this.editableText = this.formatText(this.inText, this.fragList);
        }
      });
    
      this.spans.insert(this.dynamicComponentRef.hostView);
      if (this.componentRef) {
        this.componentRef.destroy();
      }
      this.componentRef = this.dynamicComponentRef;
    }
  }

  showDialogMetadata(){
    this.dialogVisible = true;
  }

  createMetadata(){
    this.dialogVisible = false;
    this.metadata = { 'Title': this.titleValue, 'Author': this.authorValue};

  }
  
  addNewSpan() {
    if (this.highlightedText) {
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const spanData = { Name: this.highlightedText, ID: '', Candidates: [] };

        this.fragList.push(spanData);
        this.handleSpanClick(spanData);
        if(this.fragList.length === 0){
          this.editableText = this.formatText(this.inText, this.response);   
        }
        else{
          this.editableText = this.formatText(this.inText, this.fragList);   
        }
            
      }
     }
  }
  

  deleteEntity(spanData: any) {
    var myDiv = document.getElementById('book');
    var targetId = spanData.ID;

    if (myDiv) {
        if (myDiv.querySelector(`span.${targetId}`)) {
            var spanEl = this.el.nativeElement.querySelector(`span.${targetId}`);

            if (spanEl && spanEl.textContent !== null) {
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
    this.apiService.setEditedContent(this.inText, this.fragList, this.metadata);
  }

  findType(list:any){
    let type:any;
    let personArray = ["PERSON", "Deity", "Group of fictional characters", "Human"];
    let locationArray = ["GPE", "LOC", "Location"]
    let planetArray = ["Natural satellite", "satellite", "planet", "Astronomical object", "Planetary system", "galaxy", "Space"]
    list.forEach((entity:any) => {
      type = entity.Type;
      if(personArray.find(x => x.valueOf().toLowerCase() === type.toLowerCase())){
        entity.Type = "Person";
      }
      else if(locationArray.find(x => x.valueOf().toLowerCase() === type.toLowerCase()))
      {
        entity.Type = "Location";
      }
      else if((planetArray.find(x => x.valueOf().toLowerCase() === type.toLowerCase())))
      {
        entity.Type = "Space";
      }
      else{
        entity.Type = "Other";
      }
    });
    return this.fragList;
  }

}