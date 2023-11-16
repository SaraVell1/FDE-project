import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loading-mode',
  templateUrl: './loading-mode.component.html',
  styleUrls: ['./loading-mode.component.css']
})
export class LoadingModeComponent {
  title = 'wikidata-panel';
  searchText: string = '';
  entityData: any;

  constructor(private apiService: ApiService, private router: Router){}
  ngOnInit(): void {}

  goToUrl(path:any){
    this.router.navigate(path);
  }
  
  sendText(){
    this.apiService.setText(this.searchText);
    this.apiService.getAnalyzedText();
  }

  // callApi(){
  //   this.entityData = null;
  //   this.apiService.getResults(this.searchText).subscribe(response => {
  //     this.entityData = response;
  //     console.log(response);
  //   })
  // }

  
}


