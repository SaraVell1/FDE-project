import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-clickable-span',
  templateUrl: './clickable-span.component.html',
  styleUrls: ['./clickable-span.component.css']
})
export class ClickableSpanComponent implements OnInit{
  @Input() text: string = '';
  @Input() dataId: string = '';
  @Input() dataClass: string = '';
  @Input() dataList: string = '';
  selectedValue: string = '';
  updatedDataId: string = '';

  @Output() updateSpan: EventEmitter<any> = new EventEmitter();
  @Output() spanClick: EventEmitter<any> = new EventEmitter();

  constructor(private apiService: ApiService){}
  cardOpen = false;

  ngOnInit(){
     this.updatedDataId = this.apiService.getUpdatedDataId();
  }
  openCard() {
    this.cardOpen = true;
  }

  updateSpanData() {
    this.cardOpen = false;
    this.updatedDataId = this.selectedValue;
    this.apiService.setUpdatedDataId(this.updatedDataId);
    this.updateSpan.emit({
    dataId: this.updatedDataId,
    dataClass: this.dataClass,
    dataList: this.dataList,
  });
  }

  onClick() {
    // Emit a click event with the relevant data
    this.spanClick.emit({
      dataId: this.updatedDataId,
      dataClass: this.dataClass,
      dataList: this.dataList,
    });
  }
}
