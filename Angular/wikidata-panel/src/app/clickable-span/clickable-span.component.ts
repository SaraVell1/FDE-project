import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-clickable-span',
  templateUrl: './clickable-span.component.html',
  styleUrls: ['./clickable-span.component.css']
})
export class ClickableSpanComponent {
  @Input() text: string = '';
  @Input() dataId: string = '';
  @Input() dataClass: string = '';
  @Input() dataList: string = '';

  @Output() updateSpan: EventEmitter<any> = new EventEmitter();
  @Output() spanClick: EventEmitter<any> = new EventEmitter();

  cardOpen = false;

  openCard() {
    this.cardOpen = true;
  }

  updateSpanData() {
    this.cardOpen = false;
    this.updateSpan.emit({
      dataId: this.dataId,
      dataClass: this.dataClass,
      dataList: this.dataList,
    });
  }

  onClick() {
    // Emit a click event with the relevant data
    this.spanClick.emit({
      dataId: this.dataId,
      dataClass: this.dataClass,
      dataList: this.dataList,
    });
  }
}
