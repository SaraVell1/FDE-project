import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-clickable-span',
  templateUrl: './clickable-span.component.html',
  styleUrls: ['./clickable-span.component.css']
})
export class ClickableSpanComponent implements OnInit, OnChanges{
  @Input() text: string = '';
  @Input() dataId: string = '';
  @Input() dataClass: string = '';
  @Input() dataList: string[] = [];
  selectedValue: string = '';
  updatedDataId: string = '';

  @Output() updateSpan: EventEmitter<any> = new EventEmitter();
  @Output() spanClick: EventEmitter<any> = new EventEmitter();

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef){}
  cardOpen = false;

  ngOnInit(){
     this.updatedDataId = this.apiService.getUpdatedDataId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataList']) {
      this.dataList = [...changes['dataList'].currentValue];
      if (this.dataList.length > 0) {
        this.selectedValue = this.dataList[0];
      }
      this.cdr.detectChanges();
    }
    if (changes['selectedValue']) {
      this.selectedValue = changes['selectedValue'].currentValue;
      this.cdr.detectChanges();
    }
  }
  
  openCard() {
    this.cardOpen = true;
  }
  
  updateSpanData() {
    this.cardOpen = false;
    this.updatedDataId = this.selectedValue;
    this.apiService.updateDataList(this.dataList);
    this.apiService.setUpdatedDataId(this.updatedDataId);
    this.updateSpan.emit({
    dataId: this.updatedDataId,
    dataClass: this.dataClass,
    dataList: this.dataList,
  });
  this.cdr.detectChanges();
  console.log('After updateSpanData - dataList:', this.dataList);
  }

  onClick() {
    this.spanClick.emit({
      dataId: this.updatedDataId,
      dataClass: this.dataClass,
      dataList: this.dataList,
    });
  }
}
