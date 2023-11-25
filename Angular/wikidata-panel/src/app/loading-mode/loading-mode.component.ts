import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-loading-mode',
  templateUrl: './loading-mode.component.html',
  styleUrls: ['./loading-mode.component.css']
})
export class LoadingModeComponent {
  title = 'wikidata-panel';
  searchText: string = '';
  entityData: any;
  formData: any;
  fileContent: string | null = null;
  fileUploaded: boolean = false;
  fileName:string = '';

  constructor(private apiService: ApiService, private router: Router){}
  ngOnInit(): void {}

  goToUrl(path:any){
    this.router.navigate(path);
  }
  
  sendText() {
    const textToAnalyze = this.fileContent !== null ? this.fileContent : this.searchText;
    if (textToAnalyze) {
      this.apiService.setText(textToAnalyze);
      this.apiService.getAnalyzedText();
    } else {
      console.error('No text to analyze.');
    }
  }

  onFileChange(event: any) {
    const fileList: FileList | null = event.target.files;
    if (fileList && fileList.length > 0) {
      const file: File = fileList[0];

      const reader = new FileReader();
      reader.onload = () => {
        const fileContent: string | ArrayBuffer | null = reader.result;

        if (typeof fileContent === 'string') {
          this.fileContent = fileContent;
        } else {
          console.error('Failed to read file content as string.');
        }
      };

      reader.readAsText(file);
      this.fileUploaded = true;
      this.fileName = file.name;

    } else {
      this.fileContent = null;
    }
  }
}


