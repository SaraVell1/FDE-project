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
  type:string = '';
  entityName:string = '';
  entityImage:string='';
  entityInfo:any;
  res:any;
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
    this.type = entityData.type;
    this.entityInfo = entityData.data;
    this.createPanel(this.type);
   }else{
    console.log("EntityData is empty");
   }
  }

  createPanel(type:string){
    console.log("Sono nel create Panel");
    switch(type)
    {
      case "human":
        this.entityName = this.entityInfo.Name;
        this.entityImage = this.entityInfo.Image || null;
        break;
      default:
        console.log("Sono nel default e questo è il mio type", type);
    }
  }
  close(){
    this.closePanel.emit(false);
  }
}