import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InfoService } from '../info.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-panel-data',
  templateUrl: './panel-data.component.html',
  styleUrls: ['./panel-data.component.css']
})
export class PanelDataComponent implements OnInit, AfterViewInit{

  @Output() closePanel = new EventEmitter<any>();
  entityName:string = '';
  entityImage:string='';
  entityInfo:any;
  res:any;
  keys: string[] = [];
  constructor(private infoService: InfoService, private cdr:ChangeDetectorRef){}

  ngOnInit(){
    
  }

  ngAfterViewInit(){
    this.getEntityInformation();
    this.cdr.detectChanges();
  }

  getEntityInformation(){
   const entityData = this.infoService.getEntityData();
   if(entityData){
    this.entityInfo = entityData.data;
    this.createPanel();
   }
   else
   {
      alert("No information provided for this entity");
    }
  }

  createPanel(){
    this.keys = Object.keys(this.entityInfo);
    this.entityName = this.entityInfo['Name'];
    return this.keys;
  }

  downloadTurtleFile() {
    const turtleData = this.entityInfo['Turtle'];   
    if (turtleData) {
      const blob = new Blob([turtleData], { type: 'text/turtle;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'turtle_entity_'+this.entityInfo['Name']+'.ttl';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('Turtle data is missing.');
    }
  }

  close(){
    this.closePanel.emit(false);
  }
}
