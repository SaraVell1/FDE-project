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
  showSuggestions: boolean = false;
  classArray: Array<string> = []

  @Output() updateSpan: EventEmitter<any> = new EventEmitter();
  @Output() spanClick: EventEmitter<any> = new EventEmitter();

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef){}
  cardOpen = false;
  

  ngOnInit(){
     this.updatedDataId = this.apiService.getUpdatedDataId();
     this.dataClass = this.dataClass || '';
     this.classArray = [ this.dataClass, 'Person', 'Location', 'Space', 'Other']
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataList']) {
      this.dataList = [...changes['dataList'].currentValue];
      if (this.dataList.length > 0) {
        this.selectedValue = this.dataList[0];
      }
      this.cdr.detectChanges();
    }
  }
  
  openCard() {
    if (!this.cardOpen) {
      if (this.text === '') {
        this.selectedValue = '';
        this.cardOpen = true;
      } else {
        this.cardOpen = true;
      }
    }
  }
  

  close(){
    this.cardOpen = false;
  }

 updateSpanData() {
  console.log("dataclass in updateSpanData", this.dataClass);
  this.cardOpen = false;
  this.updatedDataId = this.selectedValue ? this.selectedValue : this.dataId;
  const updatedDataClass = this.dataClass || 'DefaultClass';
  this.apiService.updateSpanData({
    ID: this.updatedDataId,
    Candidates: this.dataList,
  });
  this.apiService.updateDataList(this.dataList);
  this.apiService.setUpdatedDataId(this.updatedDataId);
  this.updateSpan.emit({
    text: this.text,
    dataId: this.updatedDataId,
    dataClass: updatedDataClass,
    dataList: this.dataList
  });
  this.cdr.detectChanges();
}

}
