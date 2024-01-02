import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import * as PizZip from 'pizzip';
import * as DocxtemplaterModule from 'docxtemplater';
const Docxtemplater = DocxtemplaterModule as any;


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
  emptyFile:boolean = true;

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
      this.fileUploaded = false;
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
  
      if (file.name.endsWith('.txt')) {
        this.processTxtFile(file);
      } else if (file.name.endsWith('.docx')) {
        this.convertDocxToTxt(file);
      } else {
        console.error('Formato del file non supportato.');
      }
    } else {
      this.fileContent = null;
    }
  }
  
  processTxtFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent: string | ArrayBuffer | null = reader.result;
  
      if (typeof fileContent === 'string') {
        this.fileUploaded = true;
        this.emptyFile = false;
        this.fileContent = fileContent;
        this.fileName = file.name;
      } else {
        console.error('Failed to read file content as string.');
      }
    };
  
    reader.readAsText(file);
  }
  
  async convertDocxToTxt(docxFile: File) {
    const fileBuffer = await this.readFile(docxFile);
    const zip = new PizZip(fileBuffer);
    const doc = new Docxtemplater();
    doc.loadZip(zip);
  
    const textContent = doc.getFullText();
  
    this.fileUploaded = true;
    this.emptyFile = false;
    this.fileContent = textContent;
    this.fileName = `${docxFile.name}`;
  }
  
  async readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        resolve(arrayBuffer);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}


