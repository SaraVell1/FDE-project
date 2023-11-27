import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { Observable, catchError, forkJoin, from, merge, mergeMap, of } from 'rxjs';
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
      const blocks = this.splitTextIntoBlocks(textToAnalyze, 1000);
      const allResponses: any[] = [];

      const sendRequest = (index: number) => {
        if (index < blocks.length) {
          const block = blocks[index];
          this.apiService.getAnalyzedText(block).subscribe(response => {
            allResponses.push(response);
            sendRequest(index + 1);
          });
        } else {
          this.handleCombinedResponse(allResponses);
        }
      };
      sendRequest(0);
    } else {
      console.error('No text to analyze.');
    }
  }
  

  private splitTextIntoBlocks(text: string, blockSize: number): string[] {
    const blocks: string[] = [];
    for (let i = 0; i < text.length; i += blockSize) {
      blocks.push(text.slice(i, i + blockSize));
    }
    return blocks;
  }

  private handleCombinedResponse(combinedResponse: any[]) {
    this.apiService.setCombinedResponse(combinedResponse);
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


