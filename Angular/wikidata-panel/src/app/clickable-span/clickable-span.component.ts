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

      // Set the selectedValue if dataList is not empty
      if (this.dataList.length > 0) {
        this.selectedValue = this.dataList[0];
      }

      // Manually trigger change detection
      this.cdr.detectChanges();
    }
  }
  
  openCard() {
    this.cardOpen = true;
  }
  
  updateSpanData() {
    this.cardOpen = false;
    this.updatedDataId = this.selectedValue ? this.selectedValue : this.dataId;
    this.apiService.updateSpanData({
      ID: this.updatedDataId,
      Candidates: this.dataList,
      // ... (other properties)
    });
    this.apiService.updateDataList(this.dataList);
    this.apiService.setUpdatedDataId(this.updatedDataId);
    this.updateSpan.emit({
      Name: this.text,
      ID: this.updatedDataId,
      Type: this.dataClass,
      Candidates: this.dataList,
      text: this.text,
      dataId: this.updatedDataId,
      dataClass: this.dataClass,
      dataList: this.dataList
  });
  this.cdr.detectChanges();
  }

  // onClick() {
  //   this.spanClick.emit({
  //     dataId: this.updatedDataId,
  //     dataClass: this.dataClass,
  //     dataList: this.dataList,
  //   });
  // }
}
