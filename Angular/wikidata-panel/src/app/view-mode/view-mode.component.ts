import { ChangeDetectorRef, Component, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { EditedText } from '../edited-text';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-mode',
  templateUrl: './view-mode.component.html',
  styleUrls: ['./view-mode.component.css']
})
export class ViewModeComponent {

  editedContent: EditedText = { text: '', spans: [] };
  editedContentSubscription: Subscription | any;
  
  constructor(private apiService: ApiService, private renderer: Renderer2, private el: ElementRef, private cdr: ChangeDetectorRef){}

  ngOnInit(){
     //this.editedContent = this.apiService.getEditedContent();
     this.editedContentSubscription = this.apiService.editedContent$.subscribe(
      (content: EditedText) => {
        this.editedContent = content;
        // Update the view when the content changes
        this.insertSpansIntoText();
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    this.editedContentSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Insert spans into text after the view has been initialized
    this.insertSpansIntoText();
    this.cdr.detectChanges();
  }

  insertSpansIntoText(): void {
    const textContainer = this.el.nativeElement.querySelector('.col-md-auto.bookMode > div');
    textContainer.innerHTML = ''; // Clear existing content
  
    let currentIndex = 0;
    const elements: (string | HTMLElement)[] = [];
    let processedMatches: Set<string> = new Set(); // Keep track of processed matches
  
    // Sort spans by their index in the original text
    const sortedSpans = this.editedContent.spans.sort((a, b) => {
      return this.editedContent.text.indexOf(a.Name) - this.editedContent.text.indexOf(b.Name);
    });
  
    for (const span of sortedSpans) {
      const name = span.Name;
      const namePattern = new RegExp(`\\b${name}\\b`, 'g');
      const matches = this.editedContent.text.match(namePattern);
  
      if (matches) {
        matches.forEach(match => {
          // Check if the match has been processed to avoid duplicates
          if (!processedMatches.has(match)) {
            const textBeforeSpan = this.editedContent.text.slice(currentIndex, this.editedContent.text.indexOf(match, currentIndex));
            elements.push(textBeforeSpan);
  
            const spanElement = this.renderer.createElement('span');
            this.renderer.addClass(spanElement, 'mySpan');
            this.renderer.setAttribute(spanElement, 'data-id', span.ID);
            this.renderer.setAttribute(spanElement, 'data-class', span.Type);
            this.renderer.setAttribute(spanElement, 'data-type', span.Name);
            this.renderer.appendChild(spanElement, this.renderer.createText(match));
            elements.push(spanElement);
  
            currentIndex = this.editedContent.text.indexOf(match, currentIndex) + match.length;
            processedMatches.add(match); // Mark the match as processed
          }
        });
      }
    }
  
    // Add any remaining text after the last span
    const remainingText = this.editedContent.text.slice(currentIndex);
    elements.push(remainingText);
  
    // Join the elements array and set innerHTML of textContainer
    textContainer.innerHTML = elements.map(element => (typeof element === 'string' ? element : element.outerHTML)).join('');
  }
  
  
}
