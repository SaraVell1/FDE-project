import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';


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
      const maxSentencesPerBlock = 15; //con 5 me ne riconosce 14, con 10 me ne ricosce 15, con 15 me ne riconosce 17
      const blocks = this.splitTextIntoBlocks(textToAnalyze, maxSentencesPerBlock);

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
  
  
  splitTextIntoBlocks(text: string, maxSentencesPerBlock: number): string[] {
    const sentences = text.split(/(?<=[.!?])\s+/); // Suddivide il testo in frasi
    const blocks: string[] = [];
  
    for (let i = 0; i < sentences.length; i += maxSentencesPerBlock) {
      const block = sentences.slice(i, i + maxSentencesPerBlock).join(' ');
      blocks.push(block);
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


