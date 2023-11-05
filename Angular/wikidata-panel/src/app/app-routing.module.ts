import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewModeComponent } from './view-mode/view-mode.component';
import { LoadingModeComponent } from './loading-mode/loading-mode.component';

const routes: Routes = [
  { path: '', component: LoadingModeComponent},
  { path: 'view', component: ViewModeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [LoadingModeComponent, ViewModeComponent]