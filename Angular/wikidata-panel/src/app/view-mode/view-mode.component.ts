import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-view-mode',
  templateUrl: './view-mode.component.html',
  styleUrls: ['./view-mode.component.css']
})
export class ViewModeComponent {

  editedContent :any = {}
  constructor(private apiService: ApiService){}

  ngOnInit(){
     this.editedContent = this.apiService.getEditedContent();
  }
}
