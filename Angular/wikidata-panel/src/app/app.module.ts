import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import{ InputTextModule } from 'primeng/inputtext';
import { ButtonModule} from 'primeng/button';
import{ Table, TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { MessageService } from 'primeng/api';
import { ApiService } from './api.service';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    RouterModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
