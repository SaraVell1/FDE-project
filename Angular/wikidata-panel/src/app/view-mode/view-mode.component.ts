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

  editedContent: any;
  editedContentSubscription: Subscription | any;
  
  constructor(private apiService: ApiService, private renderer: Renderer2, private el: ElementRef, private cdr: ChangeDetectorRef){}

  ngOnInit(){
     this.editedContentSubscription = this.apiService.editedContent$.subscribe(
      (content: any) => {
        this.editedContent = content;
      });
  }

  ngOnDestroy(): void {
    this.editedContentSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  
}
