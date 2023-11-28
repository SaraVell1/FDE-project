import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, AfterViewInit, Injector, ComponentRef, ComponentFactoryResolver, ChangeDetectorRef, HostListener, Renderer2 } from '@angular/core';
import { EditedText } from '../edited-text';
import { ApiService } from '../api.service';
import { SafeHtml } from '@angular/platform-browser';
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
  editedContent: EditedText = {text: '', spans: []};
  fragList:any[] = [];
  private componentRef: ComponentRef<ClickableSpanComponent> | null = null;
  private dynamicComponentRef: ComponentRef<ClickableSpanComponent> | null = null;

  @ViewChild('spanContainer', {read: ViewContainerRef}) spans: ViewContainerRef | any;
  @ViewChild('formattedTextContainer', {static: true}) formattedTextContainer: ElementRef | any;

  constructor(private renderer: Renderer2 ,private apiService:ApiService, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, private cdr: ChangeDetectorRef){}

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
      this.response = apiResponse;
      console.log(this.response);
    this.formatText(this.inText, apiResponse);
      this.loading = false;
    })
  }

  formatText(text: string, response: any) {
    const flatResponse = response.flatMap((array: any) => array);
    const textFragments: (string | { type: string, text: string, data?: any })[] = [];
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
            const textBeforeSpan = text.slice(currentIndex, text.indexOf(match, currentIndex));
            if (textBeforeSpan) {
              textFragments.push({ type: 'text', text: textBeforeSpan });
            }
  
            textFragments.push({ type: 'span', text: match, data: spanData });
            currentIndex = text.indexOf(match, currentIndex) + match.length;
          });
        }
      }
    });
    const remainingText = text.slice(currentIndex);
    if (remainingText) {
      textFragments.push({ type: 'text', text: remainingText });
    }
  
    console.log('Text Fragments:', textFragments);
    this.textFragments = textFragments;
  
    this.formattedText = textFragments.map(fragment => {
      if (typeof fragment === 'string') {
        return fragment;
      } else if (fragment.type === 'span') {
        return `<span class="mySpan" data-id="${fragment.data.ID}" data-class="${fragment.data.Type}" data-candidates="${JSON.stringify(fragment.data.Candidates)}">${fragment.text}</span>`;
      } else {
        return fragment.text;
      }
    }).join('');

    this.fragList = textFragments.slice();
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
        const index = this.textFragments.findIndex(fragment => fragment.type === 'span' && fragment.data === spanData);
      if (index !== -1) {
        this.textFragments[index] = { type: 'span', text: dynamicComponent.text, data: data };
      }
        if (this.componentRef) {
          this.componentRef.instance.dataList = data.dataList;
          this.componentRef.instance.selectedValue = data.dataList.length > 0 ? data.dataList[0] : '';
          this.componentRef.instance.dataId = data.dataId;
          this.componentRef.instance.dataClass = data.dataClass;
        }
        spanData.ID = data.dataId;
        spanData.Candidates = data.dataList;
        spanData.Type = data.dataClass;
        console.log('Update span data:', data);
        this.cdr.detectChanges();
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
        const range = selection.getRangeAt(0);
        const startOffset = range.startOffset;
        const endOffset = range.endOffset;
        const container = range.commonAncestorContainer;
  
        const spanData = { Name: this.highlightedText, ID: '', Candidates: [] };
  
        // Verifica se il testo selezionato è già uno span con classe mySpan
        if (container.nodeType === 3 && container.parentElement?.classList.contains('mySpan')) {
          // Aggiorna uno span esistente
          this.updateExistingSpan(container.parentElement, spanData);
        } else {
          // Aggiungi un nuovo span
          range.deleteContents();
  
          const span = document.createElement('span');
          span.className = 'mySpan';
          span.textContent = this.highlightedText;
          span.setAttribute('data-id', '');
          span.setAttribute('data-class', '');
          span.setAttribute('data-candidates', JSON.stringify([]));
          span.addEventListener('click', () => this.handleSpanClick(spanData));
  
          range.insertNode(span);
  
          // Trova la posizione corretta nel tuo array e aggiungi lo span
          const currentIndex = this.textFragments.findIndex(fragment => fragment.type === 'text' && fragment.text === this.highlightedText);
          if (currentIndex !== -1) {
            this.textFragments.splice(currentIndex, 1, { type: 'span', text: this.highlightedText, data: spanData });
          } else {
            // Se il testo non è già presente, aggiungilo alla lista
            this.addSpanToList(this.highlightedText, spanData);
          }
  
          this.highlightedText = '';
          this.addingNewSpan = false;
        }
      }
    } else {
      this.addingNewSpan = true;
    }
  }
  
  updateExistingSpan(existingSpan: HTMLElement, spanData: any) {
    existingSpan.classList.add('mySpan');
    existingSpan.setAttribute('data-id', '');
    existingSpan.setAttribute('data-class', '');
    existingSpan.setAttribute('data-candidates', JSON.stringify([]));
    this.addingNewSpan = false;
    this.addSpanToList(existingSpan.innerHTML, spanData);
  }
  
  addSpanToList(spanText: string, spanData: any) {
    this.fragList.push({ type: 'span', text: spanText, data: spanData });
    console.log("The fragList in addSpanToList is", this.fragList);
  }
  
  deleteEntity(fragment: any) {
    console.log('deleteEntity called');
  
    const indexInSpansList = this.fragList.findIndex(item => item === fragment);
    const indexInTextFragments = this.textFragments.findIndex(item => item === fragment);
  
    if (indexInSpansList !== -1) {
      // Replace the span with plain text in the fragList
      this.fragList.splice(indexInSpansList, 1);
    }
  
    if (indexInTextFragments !== -1) {
      // Replace the span with plain text in the textFragments
      const deletedFragment = this.textFragments.splice(indexInTextFragments, 1, { type: 'text', text: fragment.text })[0];
  
      // Update the HTML in the bookMode div
      const bookModeDiv = document.querySelector('.bookMode');
      if (bookModeDiv && deletedFragment) {
        // Convert NodeListOf<Element> to array
        const spans = Array.from(bookModeDiv.querySelectorAll('.mySpan'));
  
        // Iterate through spans and find the one with the specified text
        for (const span of spans) {
          if (span.textContent === deletedFragment.text) {
            // Update the properties of the existing span
            span.classList.remove('mySpan');
            span.removeAttribute('data-id');
            span.removeAttribute('data-class');
            span.removeAttribute('data-candidates');
            span.removeEventListener('click', () => this.handleSpanClick({
              Name: span.textContent,
              ID: '',
              Candidates: [],
              Type: '',
            }));
            break;
          }
        }
      }
    }
  
    this.highlightedText = '';
    this.addingNewSpan = false;
  
    // Additional logic if needed
  
    // Make sure to detect changes after modifying the lists
    this.cdr.detectChanges();
  }
  
 
  highlightAndOpenCard(event: MouseEvent) {
    const selection = window.getSelection();
    if (selection) {
      const highlightedText = selection.toString();
      this.highlightedText = highlightedText;
      this.addingNewSpan = true;
    }
  }

  

  saveText() {
    const updatedSpans = this.fragList
      .filter(fragment => fragment.type === 'span')
      .map(fragment => fragment.data);
  
    console.log("My updated spans are:", updatedSpans);
    const fragmentIndices: { start: number; end: number }[] = [];
    let currentIndex = 0;

    const totalLength = this.fragList.reduce((acc, fragment) => {
      if (fragment.type === 'text') {
        const start = acc;
        const end = start + fragment.text.length;
        fragmentIndices.push({ start, end });
        currentIndex = end;
        return end;
      }
      return acc;
    }, 0);
  
    let updatedText = '';
    let lastIndex = 0;
    
    fragmentIndices.forEach((index, i) => {
      const textFragment = this.inText.substring(index.start, index.end);
    
      if (i < fragmentIndices.length - 1) {
        const span = this.fragList.find(fragment => fragment.type === 'span' && fragment.data.Name === textFragment);
        if (span) {
          if (index.start > lastIndex) {
            const remainingText = this.inText.substring(lastIndex, index.start);
            updatedText += remainingText;
          }
    
          const spanText = `<span class="mySpan" data-id="${span.data.ID}" data-class="${span.data.Type}" data-candidates="${JSON.stringify(span.data.Candidates)}">${textFragment}</span>`;
          updatedText += spanText;
    
          lastIndex = index.end;
        }
      } else {
        const remainingText = this.inText.substring(lastIndex);
        updatedText += remainingText;
      }
    });
    
    this.editedContent = {
      text: updatedText,
      spans: updatedSpans
    };
    this.apiService.setEditedContent(this.editedContent);
  
    console.log('The text has been saved!');
  }
  
  
  
  
  
}
