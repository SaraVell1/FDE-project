import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import{ InputTextModule } from 'primeng/inputtext';
import { ButtonModule} from 'primeng/button';
import{ Table, TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { MessageService } from 'primeng/api';
import { ApiService } from './api.service';
import { ViewModeComponent } from './view-mode/view-mode.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';


@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    ViewModeComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    TableModule,
    RouterModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    FileUploadModule
  ],
  providers: [MessageService, ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
