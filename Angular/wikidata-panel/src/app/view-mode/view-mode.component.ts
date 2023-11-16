import { Component, ElementRef, Renderer2 } from '@angular/core';
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
  
  constructor(private apiService: ApiService, private renderer: Renderer2, private el: ElementRef){}

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
  }

  insertSpansIntoText(): void {
    const textContainer = this.el.nativeElement.querySelector('.col-md-auto.bookMode > div');
    textContainer.innerHTML = ''; // Clear existing content
  
    let currentIndex = 0;
  
    for (const span of this.editedContent.spans) {
      const name = span.Name;
      const namePattern = new RegExp(`\\b${name}\\b`, 'g');
      const matches = this.editedContent.text.match(namePattern);
  
      if (matches) {
        matches.forEach(match => {
          const textBeforeSpan = this.editedContent.text.slice(currentIndex, this.editedContent.text.indexOf(match, currentIndex));
          const spanElement = this.renderer.createElement('span');
          this.renderer.addClass(spanElement, 'mySpan');
          this.renderer.setAttribute(spanElement, 'data-id', span.ID);
          this.renderer.setAttribute(spanElement, 'data-class', span.Type);
          this.renderer.setAttribute(spanElement, 'data-type', span.Name);
          this.renderer.appendChild(spanElement, this.renderer.createText(match));
          this.renderer.appendChild(textContainer, this.renderer.createText(textBeforeSpan));
          this.renderer.appendChild(textContainer, spanElement);
          currentIndex = this.editedContent.text.indexOf(match, currentIndex) + match.length;
        });
      }
    }
  
    // Add any remaining text after the last span
    const remainingText = this.editedContent.text.slice(currentIndex);
    this.renderer.appendChild(textContainer, this.renderer.createText(remainingText));
  }

  // getFormattedText(): string {
  //   let formattedHTML = this.editedContent.text;

  //   for (const span of this.editedContent.spans) {
  //     const spanAttributes = `data-id="${span.ID}" data-class="${span.Type}" data-type="${span.Name}"`;
  //     const spanText = `<span ${spanAttributes} class="mySpan">${span.text}</span>`;
  //     const insertIndex = formattedHTML.indexOf(span.text);
  //     if (insertIndex !== -1) {
  //       formattedHTML =
  //         formattedHTML.slice(0, insertIndex) +
  //         spanText +
  //         formattedHTML.slice(insertIndex + span.text.length);
  //     } else {
  //       formattedHTML += spanText;
  //     }
  //   }

  //   return formattedHTML;
  // }
}
