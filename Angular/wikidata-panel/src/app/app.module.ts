import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import{ InputTextModule } from 'primeng/inputtext';
import { ButtonModule} from 'primeng/button';
import{ Table, TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { RouterModule } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { MessageService } from 'primeng/api';
import { ApiService } from './api.service';
import { ViewModeComponent } from './view-mode/view-mode.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { PanelDataComponent } from './panel-data/panel-data.component';
import { DialogModule } from 'primeng/dialog';



@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    ViewModeComponent,
    PanelDataComponent,
  ],
  imports: [
    DialogModule,
    BrowserModule,
    BrowserAnimationsModule,
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
    FileUploadModule,
    TabViewModule
  ],
  providers: [MessageService, ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
